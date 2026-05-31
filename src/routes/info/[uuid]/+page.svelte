<script lang="ts">
	import type { PageProps } from './$types';
	import type { Control } from '$lib/types/models';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { data }: PageProps = $props();

	let textarea: any;
	let text = $derived('');
	
	let control: Control | undefined = controlStore.controls.get(data.uuid);
	let states: [string,string][] = control && control.states ? Object.entries(control.states) : [];
	let subControls = control && control.subControls ? Object.values(control.subControls) : [];

	text = 'Control UUID ' + data.uuid + '\n\n';
	text += JSON.stringify(control) + '\n\n';
	text += 'States' + '\n\n';

	for (const state of states) { 
		text += state[0] + ': ' + state[1] + ', value: ' + JSON.stringify(controlStore.getState(state[1])) + '\n\n' }
	text += 'Subcontrols' + '\n\n';

	for (const subControl of subControls) { 
		text += 'SubControl: ' + subControl.name + ': ' + subControl.uuidAction + '\n\n';
		for (const subControlState of getSubControlStates(subControl)) { 
			text += subControlState[0] + ': ' + subControlState[1] + ', value: ' + JSON.stringify(controlStore.getState(subControlState[1])) + '\n\n';
		}
		text += '\n';
	}

	/**
	 * Retrieve subControl states for specified subControl
	 * @param subControl child of the Control
	 * @returns state entries of the subControl as map
	 */
	function getSubControlStates(subControl: Control): [string, string][] {
		let states: [string, string][] = subControl.states ? Object.entries(subControl.states) : [];
		return states;
	}

	/**
	 * Copy text area.
	 */
	function doCopy(): void {
		textarea.select();
		document.execCommand('copy'); // TODO deprecated
	}
</script>

<button type="button" class="btn btn-base preset-filled" onclick={doCopy}>copy</button>
<textarea class="bg-transparent h-full container mx-auto max-w-[1280px] p-3 lb-page-center" bind:this={textarea} bind:value={text}>
</textarea>
