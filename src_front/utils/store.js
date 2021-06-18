import { writable } from 'svelte/store';

export { get as $, get } from 'svelte/store';

export const config = writable({});
export const session = writable();
export const prevUrl = writable();

// add yours here
