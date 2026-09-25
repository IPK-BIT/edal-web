// Pure MetadataResponse -> Dataset patch mapping. No I/O, no Svelte - see
// docs/arc-migration-plan.md section 1.2/2.1. Every field is optional on the way in;
// a badly parsed crate must still produce something the DLA/preview screen can render.

import type { Author } from '$lib/stores/dataset';
import { treeFromPaths, type RoCrateFileNode } from '$lib/js/crateUtils';
import type { components } from './types.generated';

export type MetadataResponse = components['schemas']['MetadataResponse'];
export type ApiAuthor = components['schemas']['Author'];

// Dataset['metadata'] itself only names `title`/`authors` and falls back to an
// index signature for everything else, so this is spelled out explicitly rather
// than derived via Pick<Dataset['metadata'], ...> (which would type these as
// `unknown`).
export type MetadataPatch = {
	title: string;
	description: string;
	language: string;
	subjects: string[];
	license: string;
	embargoDate: string;
	authors: Author[];
};

export type ArcAdapterResult = {
	metadataPatch: MetadataPatch;
	filePaths: string[];
	fileTree: RoCrateFileNode[];
};

const ORCID_PREFIX_RE = /^https?:\/\/orcid\.org\//i;

// Strips the "http(s)://orcid.org/" prefix and any trailing slash, so authors
// prefilled from an ARC (which stores ORCID as a full URL) don't get doubled up
// when Preview.svelte/Person.svelte build `https://orcid.org/${orcid}` - see plan 1.2.
export function normalizeOrcid(raw: string | null | undefined): string {
	if (!raw) return '';
	return raw.trim().replace(ORCID_PREFIX_RE, '').replace(/\/+$/, '');
}

export type SplitAffiliationResult = {
	affiliation: string;
	city: string;
	address: string;
	rawAffiliation: string;
};

// Best-effort, non-destructive split per plan section 1.3: only attempt when city
// and address are both empty and affiliation contains commas; take a trailing
// segment (optional postal code + city name) as city, leave the rest as
// affiliation. On any ambiguity (no comma, a single segment, an empty side), don't
// split - the original string is always preserved verbatim in rawAffiliation so a
// wrong heuristic can never corrupt what gets published.
export function splitAffiliation(
	affiliation: string | null | undefined,
	city: string | null | undefined,
	address: string | null | undefined
): SplitAffiliationResult {
	const rawAffiliation = affiliation ?? '';
	const safeCity = city ?? '';
	const safeAddress = address ?? '';
	const fallback = {
		affiliation: rawAffiliation,
		city: safeCity,
		address: safeAddress,
		rawAffiliation
	};

	if (safeCity.trim() !== '' || safeAddress.trim() !== '' || !rawAffiliation.includes(',')) {
		return fallback;
	}

	const segments = rawAffiliation.split(',').map((s) => s.trim());
	if (segments.length < 2) return fallback;

	const last = segments[segments.length - 1];
	const rest = segments.slice(0, -1).join(', ').trim();
	if (!last || !rest) return fallback;

	const postalCityMatch = last.match(/^(\d{4,6})\s+(.+)$/);
	const cityName = postalCityMatch ? postalCityMatch[2].trim() : last;
	if (!cityName) return fallback;

	return { affiliation: rest, city: cityName, address: safeAddress, rawAffiliation };
}

function adaptAuthor(raw: ApiAuthor): Author {
	const { affiliation, city, address, rawAffiliation } = splitAffiliation(
		raw?.affiliation,
		raw?.city,
		raw?.address
	);
	return {
		firstName: raw?.firstName ?? '',
		lastName: raw?.lastName ?? '',
		affiliation,
		city,
		address,
		rawAffiliation,
		orcid: normalizeOrcid(raw?.orcid),
		role: raw?.role ?? ''
	};
}

export function adaptAuthors(raw: ApiAuthor[] | null | undefined): Author[] {
	if (!Array.isArray(raw)) return [];
	return raw.map(adaptAuthor);
}

// Maps a (possibly partial/malformed) MetadataResponse onto a Dataset metadata patch
// plus the derived file tree. dlaRead is intentionally ignored (Dla.svelte owns local
// consent state - see plan 1.2). license/embargoDate are passed through verbatim: an
// unrecognized license id is the UI's problem to render as read-only text, not the
// adapter's to validate.
export function toDatasetPatch(response: MetadataResponse | null | undefined): ArcAdapterResult {
	const metadata = response?.metadata;
	const filePaths = Array.isArray(response?.filePaths)
		? response.filePaths.filter((p): p is string => typeof p === 'string')
		: [];
	const subjects = Array.isArray(metadata?.subjects)
		? metadata.subjects.filter((s): s is string => typeof s === 'string')
		: [];

	return {
		metadataPatch: {
			title: metadata?.title ?? '',
			description: metadata?.description ?? '',
			language: metadata?.language ?? '',
			subjects,
			license: metadata?.license ?? '',
			embargoDate: metadata?.embargoDate ?? '',
			authors: adaptAuthors(metadata?.authors)
		},
		filePaths,
		fileTree: treeFromPaths(filePaths)
	};
}
