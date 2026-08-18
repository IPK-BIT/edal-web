import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';
import Schemas from '$lib/js';

export type Author = {
	firstName?: string;
	lastName?: string;
	affiliation?: string;
	city?: string;
	address?: string;
	orcid?: string;
	role?: string;
};

export type Dataset = {
	metadata: {
		title: string;
		authors: Author[];
		[key: string]: unknown;
	};
	file_transfer_mode: string;
	files: Record<string, File>;
	s3access: {
		endpoint: string;
		bucket: string;
		region: string;
		accessKey: string;
		secretKey: string;
		validated: boolean;
		validationMsg: string;
		[key: string]: unknown;
	};
	dlaRead: boolean;
	[key: string]: unknown;
};

const emptyDataset = () => Schemas.getObjectFromSchema('dataset') as Dataset;

function createDatasetStoresSynced() {
	const storeDatasetObj = writable<Dataset>(emptyDataset());
	const storeDatasetStr = writable<string>('');

	const setDatasetObj = (DatasetObj: Dataset) => {
		storeDatasetObj.set(DatasetObj);
		storeDatasetStr.set(JSON.stringify(DatasetObj, null, 2));
	};

	const updateDatasetObj = (DatasetObj: unknown) => {
		// accept an updater function or value
		if (typeof DatasetObj === 'function') {
			storeDatasetObj.update(DatasetObj as (d: Dataset) => Dataset);
		} else {
			storeDatasetObj.set(DatasetObj as Dataset);
		}
		storeDatasetStr.set(JSON.stringify(get(storeDatasetObj), null, 2));
	};

	const setDatasetStr = (DatasetStr: string) => {
		storeDatasetObj.set(JSON.parse(DatasetStr));
		storeDatasetStr.set(DatasetStr);
	};

	type DatasetObjStore = {
		subscribe: typeof storeDatasetObj.subscribe;
		update: typeof updateDatasetObj;
		set: typeof setDatasetObj;
		keyed?: (level: string) => ReturnType<typeof keyed>;
		keyedComments?: (jsonPath: string, commentName: string) => unknown;
	};

	const storesSynced: {
		DatasetObj: DatasetObjStore;
		DatasetStr: {
			subscribe: typeof storeDatasetStr.subscribe;
			set: typeof setDatasetStr;
		};
	} = {
		DatasetObj: {
			subscribe: storeDatasetObj.subscribe,
			update: updateDatasetObj,
			set: setDatasetObj
		},
		DatasetStr: {
			subscribe: storeDatasetStr.subscribe,
			set: setDatasetStr
		}
	};

	storesSynced.DatasetObj.keyed = (level) => keyed(storesSynced.DatasetObj, level);

	storesSynced.DatasetObj.keyedComments = (jsonPath, commentName) => {
		const keyedComments = keyed(storesSynced.DatasetObj, jsonPath);

		const derivedComments = derived(keyedComments, ($comments) => {
			const comment = $comments.find((c: { name: string; value: string }) => c.name == commentName);
			let value = '';
			if (comment) {
				value = comment.value;
			}
			return value;
		});

		const update = (value: string) => {
			if (!value) {
				value = '';
			}
			keyedComments.update(($comments) => {
				let comment = $comments.find((c: { name: string; value: string }) => c.name == commentName);
				if (comment) {
					$comments = $comments.map((c: { name: string; value: string }) =>
						c.name === commentName ? { ...c, value } : c
					);
				} else {
					comment = { name: commentName, value: value };
					$comments = [...$comments, comment];
				}
				return $comments;
			});
		};
		const set = (value: string) => {
			update(value);
		};

		const store = {
			subscribe: derivedComments.subscribe,
			update: update,
			set: set
		};

		return store;
	};

	return storesSynced;
}

const storesDataset = createDatasetStoresSynced();

export const datasetObj = storesDataset.DatasetObj;
export const datasetStr = storesDataset.DatasetStr;

export const currentStep = writable(0);
