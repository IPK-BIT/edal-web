import { describe, expect, it } from 'vitest';
import {
	normalizeOrcid,
	splitAffiliation,
	toDatasetPatch,
	type MetadataResponse
} from './arcAdapter';

describe('normalizeOrcid', () => {
	it('passes through a bare ORCID unchanged', () => {
		expect(normalizeOrcid('0000-0001-6546-1818')).toBe('0000-0001-6546-1818');
	});

	it('strips an http:// URL prefix', () => {
		expect(normalizeOrcid('http://orcid.org/0000-0001-6546-1818')).toBe('0000-0001-6546-1818');
	});

	it('strips an https:// URL prefix', () => {
		expect(normalizeOrcid('https://orcid.org/0000-0001-6546-1818')).toBe('0000-0001-6546-1818');
	});

	it('strips a trailing slash', () => {
		expect(normalizeOrcid('https://orcid.org/0000-0001-6546-1818/')).toBe('0000-0001-6546-1818');
	});

	it('returns empty string for missing values', () => {
		expect(normalizeOrcid(undefined)).toBe('');
		expect(normalizeOrcid(null)).toBe('');
		expect(normalizeOrcid('')).toBe('');
	});
});

describe('splitAffiliation', () => {
	it('splits "institute, postal code city" into affiliation/city', () => {
		const result = splitAffiliation(
			'Leibniz Institute of Plant Genetics, 06466 Gatersleben',
			'',
			''
		);
		expect(result).toEqual({
			affiliation: 'Leibniz Institute of Plant Genetics',
			city: 'Gatersleben',
			address: '',
			rawAffiliation: 'Leibniz Institute of Plant Genetics, 06466 Gatersleben'
		});
	});

	it('splits "institute, city" without a postal code', () => {
		const result = splitAffiliation('Some Institute, Gatersleben', '', '');
		expect(result.affiliation).toBe('Some Institute');
		expect(result.city).toBe('Gatersleben');
	});

	it('does not split when city is already populated', () => {
		const result = splitAffiliation('Some Institute, Gatersleben', 'Gatersleben', '');
		expect(result).toEqual({
			affiliation: 'Some Institute, Gatersleben',
			city: 'Gatersleben',
			address: '',
			rawAffiliation: 'Some Institute, Gatersleben'
		});
	});

	it('does not split when address is already populated', () => {
		const result = splitAffiliation('Some Institute, Gatersleben', '', 'Corrensstraße 3');
		expect(result.affiliation).toBe('Some Institute, Gatersleben');
		expect(result.city).toBe('');
	});

	it('does not split when affiliation has no comma', () => {
		const result = splitAffiliation('Some Institute', '', '');
		expect(result.affiliation).toBe('Some Institute');
		expect(result.city).toBe('');
	});

	it('does not split on a trailing comma with an empty last segment', () => {
		const result = splitAffiliation('Some Institute,', '', '');
		expect(result.affiliation).toBe('Some Institute,');
		expect(result.city).toBe('');
	});

	it('does not split on a leading comma with an empty first segment', () => {
		const result = splitAffiliation(',Gatersleben', '', '');
		expect(result.affiliation).toBe(',Gatersleben');
		expect(result.city).toBe('');
	});

	it('handles missing/null inputs defensively', () => {
		expect(splitAffiliation(undefined, undefined, undefined)).toEqual({
			affiliation: '',
			city: '',
			address: '',
			rawAffiliation: ''
		});
	});
});

describe('toDatasetPatch', () => {
	it('is defensive against null/undefined input', () => {
		const result = toDatasetPatch(undefined);
		expect(result.metadataPatch).toEqual({
			title: '',
			description: '',
			language: '',
			subjects: [],
			license: '',
			embargoDate: '',
			authors: []
		});
		expect(result.filePaths).toEqual([]);
		expect(result.fileTree).toEqual([]);
	});

	it('defaults missing optional fields on an otherwise-present metadata object', () => {
		const response: MetadataResponse = { metadata: { title: 'Only a title' } };
		const result = toDatasetPatch(response);
		expect(result.metadataPatch).toEqual({
			title: 'Only a title',
			description: '',
			language: '',
			subjects: [],
			license: '',
			embargoDate: '',
			authors: []
		});
	});

	it('passes through a license outside the seven known options unchanged', () => {
		const response: MetadataResponse = {
			metadata: { title: 't', license: 'Some-Unknown-License-1.0' }
		};
		expect(toDatasetPatch(response).metadataPatch.license).toBe('Some-Unknown-License-1.0');
	});

	it('returns an empty authors array when authors is empty or absent', () => {
		expect(toDatasetPatch({ metadata: { title: 't', authors: [] } }).metadataPatch.authors).toEqual(
			[]
		);
		expect(toDatasetPatch({ metadata: { title: 't' } }).metadataPatch.authors).toEqual([]);
	});

	it('ignores dlaRead entirely', () => {
		const response: MetadataResponse = { dlaRead: true, metadata: { title: 't' } };
		expect(result_has_no_dlaRead(toDatasetPatch(response))).toBe(true);

		function result_has_no_dlaRead(patch: ReturnType<typeof toDatasetPatch>) {
			return !('dlaRead' in patch.metadataPatch);
		}
	});

	it('normalizes ORCID and derives a file tree from filePaths', () => {
		const response: MetadataResponse = {
			metadata: {
				title: 'SHAPE P2 Phenotyping Trials',
				authors: [
					{
						firstName: 'Manuel',
						lastName: 'Feser',
						affiliation: 'IPK Gatersleben',
						orcid: 'http://orcid.org/0000-0001-6546-1818',
						role: 'Creator'
					}
				]
			},
			filePaths: ['assays/assay1/data.csv']
		};
		const result = toDatasetPatch(response);
		expect(result.metadataPatch.authors).toEqual([
			{
				firstName: 'Manuel',
				lastName: 'Feser',
				affiliation: 'IPK Gatersleben',
				city: '',
				address: '',
				rawAffiliation: 'IPK Gatersleben',
				orcid: '0000-0001-6546-1818',
				role: 'Creator'
			}
		]);
		expect(result.filePaths).toEqual(['assays/assay1/data.csv']);
		expect(result.fileTree).toEqual([
			{
				kind: 'directory',
				name: 'assays',
				path: 'assays',
				children: [
					{
						kind: 'directory',
						name: 'assay1',
						path: 'assays/assay1',
						children: [{ kind: 'file', name: 'data.csv', path: 'assays/assay1/data.csv' }]
					}
				]
			}
		]);
	});
});
