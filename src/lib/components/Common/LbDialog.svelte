<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Control } from '$lib/types/models';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { fadeInOut } from '$lib/helpers/styles';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';

	let {
		open,
		onClose,
		control,
		title,
		width = 'w-[450px]',
		zIndex = 'z-10',
		isFullscreen = false,
		showClose = true,
		header,
		description,
	}: {
		open: boolean;
		onClose: () => void;
		control?: Control;
		title?: string;
		width?: string;
		zIndex?: string;
		isFullscreen?: boolean;
		showClose?: boolean;
		header?: Snippet<[]>;
		description: Snippet<[]>;
	} = $props();

	let backdropClass = $derived(isFullscreen
		? `fixed top-0 left-0 right-0 bottom-0 ${zIndex} bg-surface-50-950 ${fadeInOut}`
		: `fixed inset-0 ${zIndex} bg-surface-50-950/75 backdrop-blur-sm ${fadeInOut}` );

		let positionerClass = $derived(isFullscreen
		? `fixed top-0 left-0 w-full h-full ${zIndex}`
		: `fixed inset-0 ${zIndex} flex justify-center items-center p-4`);

	let contentClass = $derived(isFullscreen
		? `card ${header ? '' : 'p-2'} shadow-xl h-full overflow-y-auto ${fadeInOut}`
		: `card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
			 max-w-full max-h-full ${width} ${fadeInOut}`);

	let headerClass = $derived(isFullscreen
		? 'sticky top-0 h-[40px] dark:bg-surface-950/50 bg-surface-50/50 z-1 grid grid-cols-[5%_90%_5%]'
		: 'grid grid-cols-[5%_90%_5%]');
		
	let iconPositionClass = $derived(isFullscreen ? 'absolute right-1 top-1' : 'flex justify-center items-center');
</script>

<!-- Only construct dialog when opened, important to get correct clientHeight -->
{#if open}
	<Dialog {open} onInteractOutside={onClose}>
		<Portal>
			<Dialog.Backdrop class={backdropClass}/>
			<Dialog.Positioner class={positionerClass}>
				<Dialog.Content class={contentClass}>
					{#if control}<LbInfo {control}/>{/if}
					{#if header}
						{@render header()}
					{:else if title !== undefined}
						<header class={headerClass}>
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<Dialog.Title class="h5 flex justify-center items-center">{title}</Dialog.Title>
							<div class={iconPositionClass}>
								{#if showClose}
									<button type="button" class="btn-icon hover:preset-tonal" onclick={onClose}>
										<LbIcon name="x" height="16" width="16"/>
									</button>
								{/if}
							</div>
						</header>
					{/if}
					<Dialog.Description>
						<div class={!header && title !== undefined ? 'mt-3' : ''}>
							{@render description()}
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
