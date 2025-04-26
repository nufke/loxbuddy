import { writable } from 'svelte/store';

export const selectedMenu = writable();

export function setMenuItem(menuItem: string) {
  selectedMenu.set({menuItem});
  return menuItem;
}
