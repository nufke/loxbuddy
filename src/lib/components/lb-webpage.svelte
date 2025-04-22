<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { categories } from '$lib/stores/stores';

	export let control: Control;

	$: image = $categories[control.cat].image;

	$: iconView = {
		name: '/loxicons/' + (control.defaultIcon ? control.defaultIcon : image),
		color: 'white'
	};

	$: textView = {
		name: control.name,
		color: ''
	};

	$: stateView = {
		name: 'Web Link',
		color: ''
	};

	$: buttonView = {
		buttons: [
			{
				name: 'SquareArrowOutUpRight',
				type: 'button',
				color: '',
				action: () => console.log('external link')
			}
		]
	};
</script>

<LbControl {iconView}	{textView} {stateView} {buttonView} />
