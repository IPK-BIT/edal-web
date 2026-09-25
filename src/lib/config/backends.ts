import general from './general.json';

export type BackendName = keyof typeof general.backends;

export function backendUrl(name: BackendName): string {
	return general.backends[name];
}
