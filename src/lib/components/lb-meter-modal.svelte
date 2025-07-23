<script lang="ts">
	import type { ControlView } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';
	import { format, getWeek } from 'date-fns';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	function getIconColorHex(hexColor: string | undefined) {
		return (hexColor && hexColor[0] == '#') ? 'fill: ' + hexColor : '';
	}

	let selected = $state(0);

	function getWeekDates(d: Date) {
		const today = d.getDate();
		const currentDay = d.getDay();
		let now = format(d, 'd-L');
		let startOfWeek = format(d.setDate(today - currentDay), 'd-L');
		return startOfWeek + ' . . ' + now; 
	}
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto {controlView.modal.size?.width || 'w-[450px]'}"
	backdropClasses={ controlView.modal.noBlur ? "" : "backdrop-blur-sm"}
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop?-->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
	<Info control={controlView.control}/>
	<header class="relative">
		<div>
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>controlView.modal.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center">
		<div class="container w-full">
			<div class="grid grid-cols-3 gap-x-2 m-2">
				<div></div>
				<div class="flex h-18 w-18 m-auto items-center justify-center rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
					<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"
								style={getIconColorHex(controlView.iconColor)}/>
				</div>
				<div>
					{#if controlView.modal.details && controlView.control.details.type == 'storage'}
					<div class="relative w-full flex flex-col justify-center items-center">
						<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['storage']} %</p>
						<p>SOC</p>
					</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="relative w-full mt-2">
			{#if controlView.modal.details && controlView.control.details.type == 'unidirectional'}
			<div class="grid grid-cols-3 gap-x-2 m-2">
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['actual']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalDay']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalWeek']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Actual')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Today')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{getWeekDates(store.time)}</p>
				</div>
			</div>
			<div class="grid grid-cols-3 gap-x-2 m-2">
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalMonth']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalYear']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['total']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'MMMM')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'u')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Total')}</p>
				</div>
			</div>
			{/if}
			{#if controlView.modal.details && (controlView.control.details.type == 'storage' || controlView.control.details.type == 'bidirectional')}
			<div class="grid grid-cols-3 gap-x-2 m-2">
				<div></div>
				<div class="relative w-full flex justify-center items-center">
					{#if controlView.control.details.type == 'storage'}
					<p class="text-md dark:text-primary-500 text-primary-700">{$_('Charge')}</p>
					{:else}
					<p class="text-md dark:text-primary-500 text-primary-700">{$_('Production')}</p>
					{/if}
				</div>
				<div class="relative w-full flex justify-center items-center">
					{#if controlView.control.details.type == 'storage'}
					<p class="text-md dark:text-yellow-500 text-yello-700">{$_('Discharge')}</p>
					{:else}
					<p class="text-md dark:text-yellow-500 text-yello-700">{$_('Consumption')}</p>
					{/if}
				</div>
			</div>
			<div class="grid grid-cols-3 gap-2 m-2">
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Actual')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['actual']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">-</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Today')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalDay']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">{controlView.modal.details['totalNegDay']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{getWeekDates(store.time)}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalWeek']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">{controlView.modal.details['totalNegWeek']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'MMMM')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalMonth']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">{controlView.modal.details['totalNegMonth']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'u')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalYear']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">{controlView.modal.details['totalNegYear']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Total')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['total']}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-yellow-500 text-yello-700">{controlView.modal.details['totalNeg']}</p>
				</div>
			</div>
			{/if}
		</div>
		{#if false}
		<div class="w-full mt-3 btn-group dark:bg-surface-950 bg-surface-50 rounded-lg grid-cols-2 p-[6px] flex-row border border-white/15 hover:border-white/15">
			<button type="button" class="w-full h-7 rounded-sm {selected==0 ? 'bg-surface-600' : ''}" onclick={() => selected=0}>
				<p class="text-md">{$_("Day")}</p>
			</button>
			<button type="button" class="w-full h-7 rounded-sm {selected==1 ? 'bg-surface-600' : ''}" onclick={() => selected=1}>
				<p class="text-md">{$_("Week")}</p>
			</button>
			<button type="button" class="w-full h-7 rounded-sm {selected==2 ? 'bg-surface-600' : ''}" onclick={() => selected=2}>
				<p class="text-md">{$_("Month")}</p>
			</button>
			<button type="button" class="w-full h-7 rounded-sm {selected==3 ? 'bg-surface-600' : ''}" onclick={() => selected=3}>
				<p class="text-md">{$_("Year")}</p>
			</button>
			<button type="button" class="w-full h-7 rounded-sm {selected==4 ? 'bg-surface-600' : ''}" onclick={() => selected=4}>
				<p class="text-md">{$_("Total")}</p>
			</button>
		</div>
		{/if}
	</div>
	
	{/snippet}
</Modal>
<!--				<p class="text-md">{getWeekDates(store.time)}</p>
-->