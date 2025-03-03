import { writable, derived } from 'svelte/store';
import type { State, Structure } from '$lib/types/models';
import { INITIAL_STRUCTURE, INITIAL_STATE } from '$lib/types/models';

export const structure = writable<Structure>(INITIAL_STRUCTURE);
export const state = writable<State>(INITIAL_STATE);

export const controls = derived(structure, $structure => Object.values($structure.controls));
export const categories = derived(structure, $structure => Object.values($structure.cats));
export const rooms = derived(structure, $structure => Object.values($structure.rooms));
