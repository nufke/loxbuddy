<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import type { ControlView } from '$lib/types/models';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { fadeInOut } from '$lib/helpers/styles';
	import { utils } from '$lib/helpers/Utils';
	import { _ } from 'svelte-i18n';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let actualFormat = $derived(controlView.control.details?.actualFormat ?? '%.1f kW');
	let nodes = $derived((controlView.control.details?.nodes ?? []) as any[]);

	let productionPower = $derived(Number(controlStore.getState(controlView.control.states?.Ppwr) ?? 0));
	let storagePower = $derived(Number(controlStore.getState(controlView.control.states?.Spwr) ?? 0));
	let gridPower = $derived(Number(controlStore.getState(controlView.control.states?.Gpwr) ?? 0));
	let consumptionPower = $derived(gridPower + productionPower + storagePower);

	function fmt(value: number): string {
		const [v, unit] = utils.formatString(value, actualFormat);
		return `${v.toLocaleString(appStore.locale)} ${unit}`;
	}

	function nodeActual(node: any): number {
		return Number(controlStore.getState(node.actualEfmState) ?? 0);
	}

	function nodeColor(value: number, nodeType: string): string {
		if (value === 0) return 'dark:text-surface-300 text-surface-700';
		switch (nodeType) {
			case 'Grid': return value > 0 ? 'dark:text-error-500 text-error-700' : 'dark:text-primary-500 text-primary-700';
			case 'Storage': return value > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-secondary-500 text-secondary-700';
			default: return 'dark:text-primary-500 text-primary-700';
		}
	}

	function summaryColor(value: number, invert: boolean = false): string {
		if (value === 0) return 'dark:text-surface-300 text-surface-700';
		const positive = invert ? value < 0 : value > 0;
		return positive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-secondary-500 text-secondary-700';
	}

	function close(): void {
		controlView.dialog.action(false);
	}
</script>

{#if controlView.dialog.state}
<Dialog open={controlView.dialog.state} onInteractOutside={close}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full w-[450px] {fadeInOut}">
				<LbInfo control={controlView.control}/>
				<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
							<LbIcon name="x" height="16" width="16"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="mt-4 flex flex-col gap-2">
						<!-- Summary -->
						<div class="grid grid-cols-2 gap-2 p-2 rounded-lg bg-surface-50-950 border border-white/10">
							{#if productionPower !== 0}
							<div class="flex flex-col items-center">
								<p class="text-xs dark:text-surface-400 text-surface-600">{$_('Production')}</p>
								<p class="text-lg font-medium {summaryColor(productionPower)}">{fmt(productionPower)}</p>
							</div>
							{/if}
							<div class="flex flex-col items-center">
								<p class="text-xs dark:text-surface-400 text-surface-600">{$_('Consumption')}</p>
								<p class="text-lg font-medium {summaryColor(consumptionPower)}">{fmt(consumptionPower)}</p>
							</div>
							<div class="flex flex-col items-center">
								<p class="text-xs dark:text-surface-400 text-surface-600">{gridPower >= 0 ? $_('Grid import') : $_('Grid export')}</p>
								<p class="text-lg font-medium {summaryColor(gridPower, true)}">{fmt(Math.abs(gridPower))}</p>
							</div>
							{#if storagePower !== 0}
							<div class="flex flex-col items-center">
								<p class="text-xs dark:text-surface-400 text-surface-600">{storagePower > 0 ? $_('Discharging') : $_('Charging')}</p>
								<p class="text-lg font-medium {summaryColor(storagePower)}">{fmt(Math.abs(storagePower))}</p>
							</div>
							{/if}
						</div>
						<!-- Node list -->
						<div class="flex flex-col gap-2">
							{#each nodes as node (node.uuid)}
								{@const actual = nodeActual(node)}
								<div class="flex flex-row items-center justify-between h-[52px] p-4 rounded-lg
											bg-surface-50-950 border border-white/10">
									<p class="truncate text-base">{node.title}</p>
									<p class="text-base shrink-0 {nodeColor(actual, node.nodeType)}">{fmt(actual)}</p>
								</div>
							{/each}
						</div>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
{/if}
