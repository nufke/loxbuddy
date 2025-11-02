<script lang="ts">
	import type { PageProps } from './$types';
	import type { Control } from '$lib/types/models';
	import { store } from '$lib/stores/Store.svelte';

	let { data }: PageProps = $props();

	let textarea: any;
	let text = $derived('');
	
	let control: Control = store.controls[data.uuid];
	let states: [string,string][] = control && control.states ? Object.entries(control.states) : [];
	let subControls = control && control.subControls ? Object.values(control.subControls) : [];

	text = 'Control UUID ' + data.uuid + '\n\n';
	text += JSON.stringify(control) + '\n\n';
	text += 'States' + '\n\n';
	for (const state of states) { 
		text += state[0] + ': ' + state[1] + ', value: ' + JSON.stringify(getState(state[1])) + '\n\n' }
	text += 'Subcontrols' + '\n\n';
	for (const sub of subControls) { 
		text += 'SubControl: ' + sub.name + ': ' + sub.uuidAction + '\n\n';
		for (const substate of getSubStates(sub)) { 
			text += substate[0] + ': ' + substate[1] + ', value: ' + JSON.stringify(getState(substate[1])) + '\n\n';
		}
		text += '\n';
	}

	function getState(key: string) {
		return store.getState(key);
	}

	function getSubStates(sub: Control) {
		let states: [string, string][] = sub.states ? Object.entries(sub.states) : [];
		return states;
	}

	function doCopy() {
		textarea.select();
		document.execCommand('copy');
	}
</script>

<button type="button" class="btn btn-base preset-filled" onclick={doCopy}>copy</button>
<textarea class="bg-transparent h-full container mx-auto max-w-[1280px] p-3 lb-page-center" bind:this={textarea} bind:value={text}>
</textarea>
