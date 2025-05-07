import { writable, derived } from 'svelte/store';
import type { State, Structure } from '$lib/types/models';
import { INITIAL_STRUCTURE, INITIAL_STATE } from '$lib/types/models';

export const structure = writable<Structure>(INITIAL_STRUCTURE);
export const state = writable<State>(INITIAL_STATE);
export const securedDetails = writable<any>();

export const controls = derived(structure, $structure => $structure.controls);
export const categories = derived(structure, $structure => $structure.cats);
export const rooms = derived(structure, $structure => $structure.rooms);

export const controlList = derived(structure, $structure => Object.values($structure.controls));
export const categoryList = derived(structure, $structure => Object.values($structure.cats));
export const roomList = derived(structure, $structure => Object.values($structure.rooms));

/*
export const connect = () => {
  // Create a new websocket
  const ws = new WebSocket("ws://example.com");

  ws.addEventListener("message", (message: any) => {
    // Parse the incoming message here
    const data: Request = JSON.parse(message.data);
    // Update the state.  That's literally it.  This can happen from anywhere:
    // we're not in a component, and there's no nested context.
    state.update((state) => ({
      ...state,
      requests: [data].concat(state.requests),
    }));
  });
};
*/