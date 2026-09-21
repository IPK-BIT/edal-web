import type { Author, Dataset } from '$lib/stores/dataset';
import {
	type RoCrateEntity,
	type RoCrateFileNode,
	toArray,
	asString,
	resolveRef,
	findRootEntity,
	buildFileTree
} from '$lib/js/crateUtils';

export type RoCrateMetadata = Partial<Dataset['metadata']>;

// ARCs identify a person by ORCID via the entity's own `@id` (e.g.
// "http://orcid.org/0000-...") rather than a separate `identifier` property.
function personFromEntity(entity: RoCrateEntity, graph: RoCrateEntity[], role: string): Author {
	const affiliationRaw = entity.affiliation;
	const affiliationEntity = resolveRef(graph, affiliationRaw);
	const orcidCandidates = [entity['@id'] ?? '', asString(entity.identifier)];

	return {
		firstName: asString(entity.givenName),
		lastName: asString(entity.familyName),
		affiliation: affiliationEntity ? asString(affiliationEntity) : asString(affiliationRaw),
		orcid: orcidCandidates.find((v) => v.includes('orcid.org')) ?? '',
		city: '',
		address: '',
		role
	};
}

function extractPersons(refs: unknown, graph: RoCrateEntity[], role: string): Author[] {
	return toArray(refs)
		.map(
			(ref) =>
				resolveRef(graph, ref) ?? (typeof ref === 'object' ? (ref as RoCrateEntity) : undefined)
		)
		.filter((entity): entity is RoCrateEntity => !!entity)
		.map((entity) => personFromEntity(entity, graph, role));
}

// Authors listed as `creator` on the root Dataset get the "Creator" role that
// Questionnaire's people step expects; `contributor` maps to "Contributor".
function extractAuthors(root: RoCrateEntity, graph: RoCrateEntity[]): Author[] {
	const creators = extractPersons(root.creator, graph, 'Creator');
	const contributors = extractPersons(root.contributor, graph, 'Contributor');
	if (creators.length || contributors.length) return [...creators, ...contributors];
	return extractPersons(root.author, graph, '');
}

// ARCs typically link `license` to a CreativeWork entity holding the full legalcode
// text (e.g. a repo's LICENSE file), not an SPDX id. The e!DAL wizard's <select>
// only offers these 7 CC identifiers, so we detect them from the standard CC
// legalcode header/URL rather than expect the crate to supply the id directly.
const SPDX_URL_SIGNATURES: { pattern: RegExp; spdx: string }[] = [
	{ pattern: /creativecommons\.org\/publicdomain\/zero\/1\.0/i, spdx: 'CC0-1.0' },
	{ pattern: /creativecommons\.org\/licenses\/by-nc-nd\/4\.0/i, spdx: 'CC-BY-NC-ND-4.0' },
	{ pattern: /creativecommons\.org\/licenses\/by-nc-sa\/4\.0/i, spdx: 'CC-BY-NC-SA-4.0' },
	{ pattern: /creativecommons\.org\/licenses\/by-nc\/4\.0/i, spdx: 'CC-BY-NC-4.0' },
	{ pattern: /creativecommons\.org\/licenses\/by-nd\/4\.0/i, spdx: 'CC-BY-ND-4.0' },
	{ pattern: /creativecommons\.org\/licenses\/by-sa\/4\.0/i, spdx: 'CC-BY-SA-4.0' },
	{ pattern: /creativecommons\.org\/licenses\/by\/4\.0/i, spdx: 'CC-BY-4.0' }
];

const SPDX_TEXT_SIGNATURES: { pattern: RegExp; spdx: string }[] = [
	{ pattern: /CC0[\s-]?1\.0 Universal/i, spdx: 'CC0-1.0' },
	{
		pattern: /Attribution-NonCommercial-NoDerivatives 4\.0 International/i,
		spdx: 'CC-BY-NC-ND-4.0'
	},
	{ pattern: /Attribution-NonCommercial-ShareAlike 4\.0 International/i, spdx: 'CC-BY-NC-SA-4.0' },
	{ pattern: /Attribution-NonCommercial 4\.0 International/i, spdx: 'CC-BY-NC-4.0' },
	{ pattern: /Attribution-NoDerivatives 4\.0 International/i, spdx: 'CC-BY-ND-4.0' },
	{ pattern: /Attribution-ShareAlike 4\.0 International/i, spdx: 'CC-BY-SA-4.0' },
	{ pattern: /Attribution 4\.0 International/i, spdx: 'CC-BY-4.0' }
];

const KNOWN_SPDX_IDS = new Set(
	[...SPDX_URL_SIGNATURES, ...SPDX_TEXT_SIGNATURES].map((s) => s.spdx)
);

// Handles concise forms like "CC-BY 4.0" or "CC BY-SA 4.0": collapse whitespace to
// hyphens so separator style doesn't matter, then match the SPDX id shape directly.
function detectShortFormSpdx(raw: string): string | undefined {
	const normalized = raw.trim().toUpperCase().replace(/\s+/g, '-');
	if (/^CC0(-1\.0)?$/.test(normalized)) return 'CC0-1.0';
	const match = normalized.match(/^CC-BY(-NC)?(-SA|-ND)?-(\d+\.\d+)$/);
	if (match) {
		const spdx = `CC-BY${match[1] ?? ''}${match[2] ?? ''}-${match[3]}`;
		if (KNOWN_SPDX_IDS.has(spdx)) return spdx;
	}
	return undefined;
}

function detectSpdxLicense(haystack: string): string | undefined {
	const shortForm = detectShortFormSpdx(haystack);
	if (shortForm) return shortForm;
	for (const { pattern, spdx } of SPDX_URL_SIGNATURES) {
		if (pattern.test(haystack)) return spdx;
	}
	for (const { pattern, spdx } of SPDX_TEXT_SIGNATURES) {
		if (pattern.test(haystack)) return spdx;
	}
	return undefined;
}

// Newer ARC RO-Crates drop the RO-Crate-spec `license` property and instead
// record it as a Comment (named "License") referenced from `root.comment`.
function findNamedComment(
	root: RoCrateEntity,
	graph: RoCrateEntity[],
	name: string
): RoCrateEntity | undefined {
	return toArray(root.comment)
		.map((ref) => resolveRef(graph, ref))
		.find((entity) => entity && asString(entity.name).toLowerCase() === name.toLowerCase());
}

function extractLicense(root: RoCrateEntity, graph: RoCrateEntity[]): string {
	const licenseEntity = resolveRef(graph, root.license);
	if (licenseEntity) {
		const explicitId = asString(licenseEntity.identifier) || asString(licenseEntity.name);
		if (KNOWN_SPDX_IDS.has(explicitId)) return explicitId;

		const haystack = [
			licenseEntity['@id'],
			explicitId,
			asString(licenseEntity.text ?? licenseEntity.description)
		].join(' ');
		const detected = detectSpdxLicense(haystack);
		if (detected) return detected;
		if (explicitId) return explicitId;
	} else if (root.license) {
		const rawString = asString(root.license);
		const detected = detectSpdxLicense(rawString);
		if (detected) return detected;
		if (rawString) return rawString;
	}

	const licenseComment = findNamedComment(root, graph, 'License');
	if (licenseComment) {
		const text = asString(licenseComment.text);
		return detectSpdxLicense(text) ?? text;
	}

	return '';
}

function extractSubjects(root: RoCrateEntity): string[] {
	const keywords = root.keywords;
	if (Array.isArray(keywords))
		return keywords
			.map(String)
			.map((s) => s.trim())
			.filter(Boolean);
	if (typeof keywords === 'string') {
		return keywords
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

function extractMetadata(root: RoCrateEntity, graph: RoCrateEntity[]): RoCrateMetadata {
	return {
		title: asString(root.name),
		description: asString(root.description),
		authors: extractAuthors(root, graph),
		language: asString(root.inLanguage),
		subjects: extractSubjects(root),
		license: extractLicense(root, graph)
	};
}

export async function fetchRoCrateData(
	rocrateLink: string,
	gitlabToken: string
): Promise<{ metadata: RoCrateMetadata; fileTree: RoCrateFileNode[] }> {
	const res = await fetch(rocrateLink, {
		headers: { 'PRIVATE-TOKEN': gitlabToken }
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch RO-Crate metadata: ${res.status} ${res.statusText}`);
	}

	const crate = await res.json();
	const graph: RoCrateEntity[] = Array.isArray(crate?.['@graph']) ? crate['@graph'] : [];

	const root = findRootEntity(graph);
	if (!root) {
		throw new Error('RO-Crate metadata is missing a root Dataset entity');
	}

	return {
		metadata: extractMetadata(root, graph),
		fileTree: buildFileTree(graph, root)
	};
}
