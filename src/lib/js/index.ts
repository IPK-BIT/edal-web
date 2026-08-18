import dataset_schema from '$lib/config/schemas/dataset-schema.json';
import person_schema from '$lib/config/schemas/person-schema.json';
import metadata_schema from '$lib/config/schemas/metadata-schema.json';
import s3_connection_detaikls_schema from '$lib/config/schemas/s3-connection-details.json';

const mapping = {
	dataset: dataset_schema,
	person: person_schema,
	metadata: metadata_schema,
	's3-connection-details': s3_connection_detaikls_schema
};

export default class Schemas {
	private static identifierFromRef(ref: string): string {
		return ref
			.replace(/#$/, '')
			.replace(/\.json$/, '')
			.replace(/-schema$/, '');
	}

	static getObjectFromSchema(identifier: string) {
		const schema = mapping[identifier as keyof typeof mapping];
		if (!schema) {
			throw new Error(`No schema found for identifier: ${identifier}`);
		}

		const getDataTypeByJsonType = (type: string) => {
			const types = {
				string: '',
				array: [],
				object: {},
				boolean: false
			};
			return types[type as keyof typeof types];
		};

		const obj: Record<string, unknown> = {};
		const keys = [];

		if (
			schema &&
			typeof schema === 'object' &&
			'properties' in schema &&
			typeof schema.properties === 'object'
		) {
			for (const [k, v] of Object.entries(schema.properties)) {
				keys.push(k);

				//@ts-expect-error schema typing
				if (v['type'] === 'string') {
					obj[k] = '';
					//@ts-expect-error schema typing
				} else if (v['type'] === 'boolean') {
					obj[k] = false;
					//@ts-expect-error schema typing
				} else if (v['type'] === 'array') {
					obj[k] = [];
					//@ts-expect-error schema typing
				} else if (v['type'] === 'object') {
					//@ts-expect-error schema typing
					const entries = Object.entries(v['properties'] || {});
					if (entries.length === 0) {
						obj[k] = {};
					} else {
						obj[k] = Object.fromEntries(
							entries.map((x) => [x[0], getDataTypeByJsonType((x[1] as { type: string })['type'])])
						);
					}
					//@ts-expect-error schema typing
				} else if (typeof v['$ref'] === 'string') {
					//@ts-expect-error schema typing
					obj[k] = Schemas.getObjectFromSchema(Schemas.identifierFromRef(v['$ref']));
					//@ts-expect-error schema typing
				} else if (v['anyOf'] !== undefined) {
					//@ts-expect-error schema typing
					if (v['anyOf'][0]['type'] !== undefined) {
						//@ts-expect-error schema typing
						if (v['anyOf'][0]['type'] === 'string') {
							obj[k] = '';
							//@ts-expect-error schema typing
						} else if (v['anyOf'][0]['type'] === 'boolean') {
							obj[k] = false;
							//@ts-expect-error schema typing
						} else if (v['anyOf'][0]['type'] === 'array') {
							obj[k] = [];
							//@ts-expect-error schema typing
						} else if (v['anyOf'][0]['type'] === 'object') {
							//@ts-expect-error schema typing
							const entries = Object.entries(v['properties'] || {});
							if (entries.length === 0) {
								obj[k] = {};
							} else {
								obj[k] = Object.fromEntries(
									entries.map((x) => [
										x[0],
										getDataTypeByJsonType((x[1] as { type: string })['type'])
									])
								);
							}
						}
						//@ts-expect-error schema typing
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
