import dataset_schema from '$lib/config/schemas/dataset-schema.json';
import person_schema from '$lib/config/schemas/person-schema.json';
import metadata_schema from '$lib/config/schemas/metadata-schema.json';
import s3_connection_detaikls_schema from '$lib/config/schemas/s3-connection-details.json';

const mapping = {
    'dataset': dataset_schema,
    'person': person_schema,
    'metadata': metadata_schema,
    's3-connection-details': s3_connection_detaikls_schema,
}

export default class Schemas { 
    
    static getObjectFromSchema(identifier: string) {
        let schema = mapping[identifier as keyof typeof mapping];
        if (!schema) {
            throw new Error(`No schema found for identifier: ${identifier}`);
        }

        const getDataTypeByJsonType = (type: string) => {
            let types = {
                'string': '',
                'array': [],
                'object': {},
                'boolean': false,
            }
            return types[type as keyof typeof types];
        }

        let obj: { [key: string]: any } = {};
        let keys = [];

        if (schema && typeof schema === 'object' && 'properties' in schema && typeof schema.properties === 'object') {
            for (const [k,v] of Object.entries(schema.properties)) {
                keys.push(k);

                //@ts-ignore
                if (v['type'] === 'string') {
                    obj[k] = '';
                //@ts-ignore
                } else if (v['type'] === 'boolean') {
                    obj[k] = false;
                //@ts-ignore
                } else if (v['type'] === 'array') {
                    obj[k] = [];
                //@ts-ignore
                } else if (v['type'] === 'object') {
                    //@ts-ignore
                    let entries = Object.entries(v['properties'] || {});
                    if (entries.length === 0) {
                        obj[k] = {};
                    } else {
                        obj[k] = Object.fromEntries(entries.map( (x) => [x[0], getDataTypeByJsonType((x[1] as { type: string })['type'])] ));
                    }
                //@ts-ignore
                } else if (v['anyOf'] !== undefined) {
                    //@ts-ignore
                    if (v['anyOf'][0]['type'] !== undefined) {
                        //@ts-ignore
                        if (v['anyOf'][0]['type'] === 'string') {
                            obj[k] = '';    
                        //@ts-ignore
                        } else if (v['anyOf'][0]['type'] === 'boolean') {
                            obj[k] = false;
                        //@ts-ignore
                        } else if (v['anyOf'][0]['type'] === 'array') {
                            obj[k] = [];
                        //@ts-ignore
                        } else if (v['anyOf'][0]['type'] === 'object') {
                            //@ts-ignore
                            let entries = Object.entries(v['properties'] || {});
                            if (entries.length === 0) {
                                obj[k] = {};
                            } else {
                                obj[k] = Object.fromEntries(entries.map( (x) => [x[0], getDataTypeByJsonType((x[1] as { type: string })['type'])] ));
                            }
                        }
                    //@ts-ignore
                    } else if (v['anyOf'][0]['$ref'] !== undefined) {
                        obj[k] = {};
                    } else {
                        obj[k] = null;
                    }
                } else {
                    obj[k] = {};
                }
            }
        }
        return obj;
    }
}