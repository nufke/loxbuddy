<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, DEFAULT_CONTROLVIEW, type DateMap } from '$lib/types/models';
	import LucideIcon from './icon-by-name.svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';
	
	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };

	let selected = 0;

	function sortDates(d: DateMap) {
		return  Object.keys(d).map(Number).sort( (a, b) => b-a);
	}

	function formatDate(i: number) {
		return format(new Date(i), 'PPP', { locale: nl }); // TODO change locale
	}

</script>

<Modal
	open={vm.modal?.state}
	onOpenChange={()=>vm.modal?.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 pt-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[680px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{vm.textName}</h2>
		</div>
		<div class="absolute right-4 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" on:click={()=>vm.modal?.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="h-130">
	{#if selected==0 && vm.modal?.details.video.videoInfo}
	<img alt="" src={vm.modal?.details.video.videoInfo.streamUrl} width="100%"/>
	{/if}
	
	{#if selected==1}
	<div class="w-full p-4">
		{#if vm.modal?.details.lastBellEvents}
		{#each sortDates(vm.modal.details.lastBellEvents) as item}
		<div>
			<p class="text-gray-500 truncate">
				{formatDate(item)}
			</p>
			{#each vm.modal?.details.lastBellEvents[item] as time}
			<p class="text-white truncate">
				{time}
			</p>
			{/each}
		</div>
		{/each}
		{/if}
	</div>
	{/if}
	</div>
	<div class="sticky bottom-0 left-0 w-full h-16 pb-2">
		<div class="grid h-full max-w-lg grid-cols-3 mx-auto">
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selected==0 ? 'text-green-500' : ''} " on:click={() => selected=0}>
					<LucideIcon name='Video'/>
					<span class="mt-1 text-xs">Video</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selected==1 ? 'text-green-500' : ''} " on:click={() => selected=1}>
					<LucideIcon name='History'/>
					<span class="mt-1 text-xs">History</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selected==2 ? 'text-green-500' : ''} " on:click={() => selected=2}>
					<LucideIcon name='Settings'/>
					<span class="mt-1 text-xs">Settings</span>
				</button>
		</div>
	</div>
	{/snippet}
</Modal>
