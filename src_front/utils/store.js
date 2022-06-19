import { writable } from 'svelte/store';

export { get as $, get } from 'svelte/store';

export const config = writable({});
export const redirectData = writable({});
export const session = writable(false);

// add yours here
