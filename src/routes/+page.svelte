<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { controlList, categoryList, roomList } from '$lib/stores/stores';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { Room, Category, Control } from '$lib/types/models';
	import LbUpDownDigital from '$lib/components/lb-up-down-digital.svelte';
	import LbTextState from '$lib/components/lb-text-state.svelte';
	import LbInfoOnlyAnalog from '$lib/components/lb-info-only-analog.svelte';
	import LbInfoOnlyDigital from '$lib/components/lb-info-only-digital.svelte';
	import LbInfoOnlyText from '$lib/components/lb-info-only-text.svelte';
	import LbJalousie from '$lib/components/lb-jalousie.svelte';
	import LbPushbutton from '$lib/components/lb-pushbutton.svelte';
	import LbRadio from '$lib/components/lb-radio.svelte';
	import LbWebpage from '$lib/components/lb-webpage.svelte';
	import LbSlider from '$lib/components/lb-slider.svelte';
	import LbSwitch from '$lib/components/lb-switch.svelte';
	import LbLightControllerV2 from '$lib/components/lb-lightcontroller-v2.svelte';
	import LbUnknown from '$lib/components/lb-unknown.svelte';
	import LbCard from '$lib/components/lb-card.svelte';
	import { selectedMenu } from '$lib/stores/menu';
	import { X } from '@lucide/svelte';

	let openModal: boolean = false;
	let currentMenuState = 'Home';
	let currentLabel = 'Home';
	let items: Room[] | Category[];
	let uuid:string;

	$: checkMenu($selectedMenu);

	function checkMenu(item: any) {
		if (item && (currentMenuState == '' || currentMenuState != item.menuItem) ) {
			currentMenuState = item.menuItem;
			switch(currentMenuState) {
			  case 'Rooms': {
					items = $roomList.filter((item) => $controlList.map((control) => control.room)
						.indexOf(item.uuid) > -1)
						.sort((a, b) => a.name.localeCompare(b.name));
					openModal = true;
					break;
				}
				case 'Categories': {
					items = $categoryList.filter((item) => $controlList.map((control) => control.cat)
						.indexOf(item.uuid) > -1)
						.sort((a, b) => a.name.localeCompare(b.name));
					openModal = true;
					break;
				}
				case 'Home': {
					currentLabel = 'Home';
				}
				default: /* none */
			}
		}
	}

	function modalClose() {
		currentMenuState = '';
		openModal = false;
	}

	let componentList = [
		{ format: 'UpDownDigital', component: LbUpDownDigital },
		{ format: 'TextState', component: LbTextState },
		{ format: 'InfoOnlyAnalog', component: LbInfoOnlyAnalog },
		{ format: 'InfoOnlyDigital', component: LbInfoOnlyDigital },
		{ format: 'InfoOnlyText', component: LbInfoOnlyText },
		{ format: 'Radio', component: LbRadio },
		{ format: 'Pushbutton', component: LbPushbutton },
		{ format: 'Webpage', component: LbWebpage },
		{ format: 'Slider', component: LbSlider },
		{ format: 'Switch', component: LbSwitch },
		{ format: 'Jalousie', component: LbJalousie },
		{ format: 'LightControllerV2', component: LbLightControllerV2 }
	];

	function getComponent(name: string) {
		const comp = componentList.find((type) => type.format == name);
		return comp ? comp.component : LbUnknown;
	}

	$: isRoom = (currentLabel == 'Rooms');
	$: isHome = (currentLabel == 'Home');

	$: filteredControls = isHome ?  
			$controlList.filter((control) => control.isFavorite === true)
				.sort((a, b) => a.name.localeCompare(b.name)) : ( isRoom ? 
			$controlList.filter((control) => control.room === uuid)
				.sort((a, b) => a.name.localeCompare(b.name)) :
			$controlList.filter((control) => control.cat === uuid)
				.sort((a, b) => a.name.localeCompare(b.name)) );

	$: labels = (isRoom || isHome) ? 
			$categoryList.filter((item) => filteredControls.map((control) => control.cat)
				.indexOf(item.uuid) > -1)
				.sort((a, b) => a.name.localeCompare(b.name)) :
			$roomList.filter((item) => filteredControls.map((control) => control.room)
				.indexOf(item.uuid) > -1)
				.sort((a, b) => a.name.localeCompare(b.name));

	$: pageTitle = isHome ? {name: 'Favorieten'} : ( isRoom ? 
			$roomList.find((item) => filteredControls[0].room == item.uuid) :
			$categoryList.find((item) => filteredControls[0].cat == item.uuid) );

	const action = (menuState:string, itemUuid:string) => {
		currentLabel = menuState;
		uuid = itemUuid;
		modalClose();
	};
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{pageTitle?.name}</h1>
	{#each labels as label}
		<h1 class="h5 ml-2">{label.name}</h1>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each filteredControls.filter( item => item.cat == label.uuid || item.room == label.uuid) as control, index}
				<svelte:component this={getComponent(control.type)} {control} />
			{/each}
		</div>
	{/each}
</div>

<Modal
	open={openModal}
	onOpenChange={modalClose}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-9/10 max-h-9/10 overflow-auto"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="flex justify-between">
		<div>
			<h2 class="h4">{$_(currentMenuState)}</h2>
		</div>
		<div class="justify-end">
			<button type="button" class="btn-icon" on:click={()=>modalClose()}><X/></button>
		</div>
	</header>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
			{#each items as item}
				<LbCard {item} {currentMenuState} {action}/>
			{/each}
		</div>
	{/snippet}
</Modal>
