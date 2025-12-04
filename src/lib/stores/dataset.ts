import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';

function createDatasetStoresSynced() {

    const storeDatasetObj = writable({});
    const storeDatasetStr = writable('');

    const setDatasetObj = (DatasetObj: any) => {
        storeDatasetObj.set(DatasetObj);
        storeDatasetStr.set(JSON.stringify(DatasetObj, null, 2));
    }

    const updateDatasetObj = (DatasetObj: any) => {
        storeDatasetObj.update(DatasetObj);
        storeDatasetStr.set(JSON.stringify(get(storeDatasetObj), null, 2));
    }

    const setDatasetStr = (DatasetStr: string) => {
        storeDatasetObj.set(JSON.parse(DatasetStr));
        storeDatasetStr.set(DatasetStr);
    }

    type DatasetObjStore = {
        subscribe: typeof storeDatasetObj.subscribe;
        update: typeof updateDatasetObj;
        set: typeof setDatasetObj;
        keyed?: (level: any) => ReturnType<typeof keyed>;
        keyedComments?: (jsonPath: any, commentName: any) => any;
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
            set: setDatasetObj,
        },
        DatasetStr: {
            subscribe: storeDatasetStr.subscribe,
            set: setDatasetStr
        }
    };

    storesSynced.DatasetObj.keyed = (level) => keyed(storesSynced.DatasetObj, level);

    storesSynced.DatasetObj.keyedComments = (jsonPath, commentName) => {
        const keyedComments = keyed(storesSynced.DatasetObj, jsonPath);

        const derivedComments = derived(keyedComments, $comments => {
            let comment = $comments.find((c: {name: string, value: string}) => c.name == commentName);
            let value = '';
            if(comment) {
                value = comment.value;
            }
            return value;
        });

        const update = (value: string) => {
            if (!value) {
                value = '';
            }
            keyedComments.update($comments => {
                let comment = $comments.find((c: {name: string, value: string}) => c.name == commentName);
                if(comment) {
                    comment.value = value;
                    $comments = $comments;
                } else {
                    comment = {'name': commentName, 'value': value};
                    $comments = [...$comments, comment];
                }
                return $comments;
            });

        }
        const set = (value: string) => {
            update(value);
        }

        const store = {
            subscribe: derivedComments.subscribe,
            update: update,
            set: set
        }

        return store;
    }

    return storesSynced;

}

const storesDataset = createDatasetStoresSynced();

export const datasetObj = storesDataset.DatasetObj;
export const datasetStr = storesDataset.DatasetStr;

export const currentStep = writable(0);