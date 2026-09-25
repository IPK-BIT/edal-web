import { describe, expect, it } from 'vitest';
import { treeFromPaths, countFiles } from './crateUtils';

describe('treeFromPaths', () => {
	it('returns an empty tree for empty input', () => {
		expect(treeFromPaths([])).toEqual([]);
	});

	it('builds a flat tree with no nesting', () => {
		const tree = treeFromPaths(['a.txt', 'b.txt']);
		expect(tree).toEqual([
			{ kind: 'file', name: 'a.txt', path: 'a.txt' },
			{ kind: 'file', name: 'b.txt', path: 'b.txt' }
		]);
	});

	it('builds nested directories from deep paths', () => {
		const tree = treeFromPaths(['assays/assay1/data.csv', 'assays/assay1/isa.assay.xlsx']);
		expect(tree).toEqual([
			{
				kind: 'directory',
				name: 'assays',
				path: 'assays',
				children: [
					{
						kind: 'directory',
						name: 'assay1',
						path: 'assays/assay1',
						children: [
							{ kind: 'file', name: 'data.csv', path: 'assays/assay1/data.csv' },
							{ kind: 'file', name: 'isa.assay.xlsx', path: 'assays/assay1/isa.assay.xlsx' }
						]
					}
				]
			}
		]);
		expect(countFiles(tree)).toBe(2);
	});

	it('does not crash on duplicate-prefix paths (a name used as both file and directory)', () => {
		expect(() => treeFromPaths(['data', 'data/sub.txt'])).not.toThrow();
		const tree = treeFromPaths(['data', 'data/sub.txt']);
		expect(countFiles(tree)).toBe(2);
	});

	it('normalizes leading/trailing slashes and drops empty segments', () => {
		const tree = treeFromPaths(['/a/b.txt/', '']);
		expect(tree).toEqual([
			{
				kind: 'directory',
				name: 'a',
				path: 'a',
				children: [{ kind: 'file', name: 'b.txt', path: 'a/b.txt' }]
			}
		]);
	});
});
