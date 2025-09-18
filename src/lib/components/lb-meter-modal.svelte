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

	let soc =  $derived(Number(controlView.modal.details['storage']));
	let selected = $state(0);

	function getWeekDates(d: Date) {
		return $_('Week'); // TODO change in weekdays for statistics
		const today = d.getDate();
		const currentDay = d.getDay();
		let now = format(d, 'd-L');
		let startOfWeek = format(d.setDate(today - currentDay), 'd-L');
		return startOfWeek + ' . . ' + now; 
	}

	function close() {
		controlView.modal.action(false);
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
							md:max-w-9/10 md:max-h-9/10 overflow-auto {controlView.modal.size?.width || 'w-[450px]'}"
	backdropClasses={ controlView.modal.noBlur ? "" : "backdrop-blur-sm"}
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop?-->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={close}></div> 
	<Info control={controlView.control}/>
	<header class="relative">
		<div>
			<p class="h5 text-center">{controlView.textName}</p>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={close}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center">
		<div class="container w-full">
			<div class="grid grid-cols-1 gap-x-2 m-2">
				{#if controlView.control.details.type == 'unidirectional' || controlView.control.details.type == 'bidirectional'}
				<div class="flex h-18 w-18 m-auto items-center justify-center rounded-full border
										{controlView.modal.details['actual'][0] > 0 ? 'border-2 border-primary-500' : 
										(controlView.modal.details['actual'][0] == 0 ? 'border-white/10' :
										(controlView.control.details.type == 'bidirectional' ? 'border-2 border-tertiary-500' : 'border-white/10'))} dark:bg-surface-950 bg-surface-50">
					<LbIcon class="dark:fill-surface-50 fill-surface-950" name={controlView.iconName} width="36" height="36"/>
				</div>
				{/if}
				{#if controlView.control.details.type == 'storage'}
				<div class="relative flex items-center justify-center dark:fill-surface-950 fill-surface-50">
					<LbIcon class="absolute dark:fill-surface-50 fill-surface-950" name={controlView.iconName} width="36" height="36"/>
					<svg height="74" width="74" viewBox='0 0 74 74'>
    				<circle class="dark:stroke-tertiary-500 stroke-tertiary-700" r="36" cx="37" cy="37" stroke-width="2" />
						<circle class="dark:stroke-primary-500 stroke-primary-700" r="36" cx="37" cy="37" transform="rotate({-90+(soc/100)},37,37)"
									stroke-dasharray="calc({2*3.1415*36*soc/100}) calc({2*3.1415*36*(100-soc)/100})" stroke-width="2" fill="none"/>
					</svg>
				</div>
				{/if}
				<div class="relative w-full mt-2 flex flex-col justify-center items-center">
					<p class="text-lg {controlView.modal.details['actual'][0] > 0 ? 'dark:text-primary-500 text-primary-700' :
								(controlView.modal.details['actual'][0] == 0 ? 'border-white/10' :
									'dark:text-tertiary-500 text-tertiary-700')} ">{controlView.modal.details['actual'].join(' ')}</p>
						{#if controlView.modal.details && controlView.control.details.type == 'storage'}
						<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['storage']} %</p>
						{/if}
				</div>
			</div>
		</div>
		<div class="relative w-full mt-2">
			{#if controlView.modal.details}
			<div class="grid { controlView.control.details.type == 'unidirectional' ? 'grid-cols-2' : 'grid-cols-3'} gap-x-2 m-2">
				{#if controlView.control.details.type == 'storage' || controlView.control.details.type == 'bidirectional'}
				<div></div>
				{/if}
				<div class="relative w-full flex justify-center items-center">
					{#if controlView.control.details.type == 'storage'}
					<p class="text-md dark:text-primary-500 text-primary-700">{$_('Charge')}</p>
					{/if}
					{#if controlView.control.details.type == 'bidirectional'}
					<p class="text-md dark:text-primary-500 text-primary-700">{$_('Production')}</p>
					{/if}
				</div>
				<div class="relative w-full flex justify-center items-center">
					{#if controlView.control.details.type == 'storage'}
					<p class="text-md dark:text-tertiary-500 text-tertiary-700">{$_('Discharge')}</p>
					{/if}
					{#if controlView.control.details.type == 'bidirectional'}
					<p class="text-md dark:text-tertiary-500 text-tertiary-700">{$_('Consumption')}</p>
					{/if}
				</div>
			</div>
			<div class="grid { controlView.control.details.type == 'unidirectional' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 m-2">
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Today')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalDay'].join(' ')}</p>
				</div>
				{#if controlView.control.details.type != 'unidirectional'}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-tertiary-500 text-tertiary-700">{controlView.modal.details['totalNegDay'].join(' ')}</p>
				</div>
				{/if}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{getWeekDates(store.time)}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalWeek'].join(' ')}</p>
				</div>
				{#if controlView.control.details.type != 'unidirectional'}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-tertiary-500 text-tertiary-700">{controlView.modal.details['totalNegWeek'].join(' ')}</p>
				</div>
				{/if}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'MMMM')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalMonth'].join(' ')}</p>
				</div>
				{#if controlView.control.details.type != 'unidirectional'}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-tertiary-500 text-tertiary-700">{controlView.modal.details['totalNegMonth'].join(' ')}</p>
				</div>
				{/if}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{format(store.time, 'u')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['totalYear'].join(' ')}</p>
				</div>
				{#if controlView.control.details.type != 'unidirectional'}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-tertiary-500 text-tertiary-700">{controlView.modal.details['totalNegYear'].join(' ')}</p>
				</div>
				{/if}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-md">{$_('Total')}</p>
				</div>
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-primary-500 text-primary-700">{controlView.modal.details['total'].join(' ')}</p>
				</div>
				{#if controlView.control.details.type != 'unidirectional'}
				<div class="relative w-full flex justify-center items-center">
					<p class="text-lg dark:text-tertiary-500 text-tertiary-700">{controlView.modal.details['totalNeg'].join(' ')}</p>
				</div>
				{/if}
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
