export type RoCrateEntity = Record<string, unknown> & {
	'@id'?: string;
	'@type'?: string | string[];
};

export type RoCrateFileNode =
	| { kind: 'file'; name: string; path: string }
	| { kind: 'directory'; name: string; path: string; children: RoCrateFileNode[] };

export function toArray<T>(value: T | T[] | undefined | null): T[] {
	if (value === undefined || value === null) return [];
	return Array.isArray(value) ? value : [value];
}

export function asString(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
		return value.name;
	}
	if (
		value &&
		typeof value === 'object' &&
		'description' in value &&
		typeof value.description === 'string'
	) {
		return value.description;
	}
	if (value && typeof value === 'object' && '@id' in value && typeof value['@id'] === 'string') {
		return value['@id'] as string;
	}
	return '';
}

export function resolveRef(graph: RoCrateEntity[], value: unknown): RoCrateEntity | undefined {
	if (!value || typeof value !== 'object') return undefined;
	const id = (value as RoCrateEntity)['@id'];
	if (!id) return undefined;
	return graph.find((entity) => entity['@id'] === id);
}

// RO-Crate roots are found indirectly: the metadata descriptor entity's `about`
// property points at the actual root Dataset entity, which may not be `./`.
export function findRootEntity(graph: RoCrateEntity[]): RoCrateEntity | undefined {
	const descriptor = graph.find(
		(entity) =>
			entity['@id'] === 'ro-crate-metadata.json' || entity['@id'] === 'ro-crate-metadata.jsonld'
	);
	if (descriptor) {
		const root = resolveRef(graph, descriptor.about);
		if (root) return root;
	}
	return graph.find((entity) => entity['@id'] === './');
}

function relativePath(id: string): string {
	return id.replace(/^\.\/+/, '').replace(/\/+$/, '');
}

function isFileEntity(entity: RoCrateEntity): boolean {
	return toArray(entity['@type']).map(String).includes('File');
}

// ARC ISA metadata (isa.investigation.xlsx, isa.study.xlsx, isa.assay.xlsx) isn't
// represented as its own File entity - its content is mapped directly onto the
// Dataset entity for the directory it lives in (`@id`), tagged via `additionalType`.
// We synthesize the conventional filename so it still shows up as a file leaf.
const ISA_FILENAMES: Record<string, string> = {
	investigation: 'isa.investigation.xlsx',
	study: 'isa.study.xlsx',
	assay: 'isa.assay.xlsx'
};

function isaFileName(entity: RoCrateEntity): string | undefined {
	for (const type of toArray(entity.additionalType)) {
		const filename = ISA_FILENAMES[asString(type).toLowerCase()];
		if (filename) return filename;
	}
	return undefined;
}

// Collects the relative path of every File/Dataset entity reachable from `root`
// via `hasPart`, following references recursively and guarding against cycles.
function collectPaths(root: RoCrateEntity, graph: RoCrateEntity[]) {
	const filePaths = new Set<string>();
	const dirPaths = new Set<string>();
	const visited = new Set<string>();

	function visit(entity: RoCrateEntity) {
		const id = entity['@id'];
		if (!id || visited.has(id)) return;
		visited.add(id);

		// The Investigation is conventionally mapped onto the crate root itself, so
		// its directory path is "" rather than a `hasPart` entry with its own `@id`.
		const dirPath = entity === root ? '' : relativePath(id);

		if (entity !== root && dirPath) {
			if (isFileEntity(entity)) filePaths.add(dirPath);
			else dirPaths.add(dirPath);
		}

		const isaFilename = isaFileName(entity);
		if (isaFilename) {
			filePaths.add(dirPath ? `${dirPath}/${isaFilename}` : isaFilename);
		}

		for (const ref of toArray(entity.hasPart)) {
			const child = resolveRef(graph, ref);
			if (child) visit(child);
		}
	}
	visit(root);

	return { filePaths, dirPaths };
}

function sortChildren(nodes: RoCrateFileNode[]): RoCrateFileNode[] {
	return nodes.sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}

// Builds a nested tree purely from each entity's relative path, rather than trusting
// `hasPart` to be nested per-directory - this handles both crates that nest `hasPart`
// per subdirectory and crates that list deep paths flatly off the root.
export function buildFileTree(graph: RoCrateEntity[], root: RoCrateEntity): RoCrateFileNode[] {
	const { filePaths, dirPaths } = collectPaths(root, graph);
	const rootChildren: RoCrateFileNode[] = [];
	const dirsByPath = new Map<string, RoCrateFileNode & { kind: 'directory' }>();

	function ensureDir(path: string): RoCrateFileNode[] {
		if (!path) return rootChildren;
		const existing = dirsByPath.get(path);
		if (existing) return existing.children;

		const segments = path.split('/');
		const name = segments[segments.length - 1];
		const parentPath = segments.slice(0, -1).join('/');
		const node: RoCrateFileNode & { kind: 'directory' } = {
			kind: 'directory',
			name,
			path,
			children: []
		};
		dirsByPath.set(path, node);
		ensureDir(parentPath).push(node);
		return node.children;
	}

	for (const dirPath of dirPaths) {
		ensureDir(dirPath);
	}
	for (const filePath of filePaths) {
		const segments = filePath.split('/');
		const name = segments[segments.length - 1];
		const parentPath = segments.slice(0, -1).join('/');
		ensureDir(parentPath).push({ kind: 'file', name, path: filePath });
	}

	for (const dir of dirsByPath.values()) {
		sortChildren(dir.children);
	}
	return sortChildren(rootChildren);
}

export function countFiles(nodes: RoCrateFileNode[]): number {
	return nodes.reduce(
		(sum, node) => sum + (node.kind === 'file' ? 1 : countFiles(node.children)),
		0
	);
}
