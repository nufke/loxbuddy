<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import type { Button } from '$lib/types/models';
	import { fadeInOut } from '$lib/helpers/styles';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';

	let { view = $bindable() } = $props();

	let returnObj: any; // Dialog can return any object
	let selectedButton: any = $derived(view.buttons ? view.buttons.find( (b: Button) => b.selected): null);
	let password = $state('');
	let hidePassword = $state(true);

	/**
	 * Helper function to establish focus on the input field when dialog opens.
	 * Note that LbDialog's focus trap is already established when LbGeneralDialog mounts.
	 * The function focusOnMount runs synchronously, sets focus, but then LbDialog's trap fires
	 * asynchronously and steals it back. So we need to defer past the focus trap cycle using
	 * the requestAnimationFrame function.
	 */
	function focusOnMount(node: HTMLInputElement): void {
		requestAnimationFrame(() => node.focus());
	}

	function buttonSelect(id: number): void {
		selectedButton = {};
		selectedButton.id = id;
		returnObj = id; // store selected button
	}

	function cancel(): void {
		view.openDialog = false;
		password = ''; // clear password
		view.cancel();
	}

	function ok(): void {
 		if (view.input && !password.length) return; // ignore if no password is given
		if (view.input) {
			returnObj = password;
		}
		view.openDialog = false;
		view.ok(returnObj);
		password = ''; // clear password
	}
</script>

{#if view.openDialog}
	<Dialog
		open={view.openDialog}
		onInteractOutside={cancel}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-40 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									max-w-full max-h-full w-[450px] {fadeInOut}">
					{#if view.label}
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={cancel}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
					{/if}
					<Dialog.Description>
						<form onsubmit={(e) => { e.preventDefault(); ok(); }}>
							<div class="w-full mt-3 mb-2 grid gap-2">
								{#if view.buttons && view.buttons.length}
									{#each view.buttons as button}
									<button type="button" class="w-full h-[48px] btn btn-lg { selectedButton.id == button.id ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
												shadow-sm rounded-lg border border-white/15 hover:border-white/50"
													onclick={(e) => { e.stopPropagation(); e.preventDefault(); buttonSelect(button.id)}}>
												<span class="text-lg">{$_(button.name)}</span>
									</button>
									{/each}
								{/if}
								{#if view.input}
									<!-- hidden username -->
									<input class="sr-only" type="text" autocomplete="username" tabindex="-1" aria-hidden="true" value="" readonly />
									<div class="input-group grid-cols-[1fr_auto] rounded-lg">
										<div dir="ltr">
											<input class="input h-[48px] dark:bg-surface-950 bg-surface-50 rounded-s-lg"
											  type={hidePassword ? "password" : "text"} bind:value={password}
												placeholder={$_("Password")} autocomplete="current-password" use:focusOnMount />
										</div>
										<div class="ig-btn preset-tonal" onclick={() => {hidePassword = !hidePassword}}>
											{#if hidePassword}
												<LbIcon name="eye" height="16" width="16"/>
											{:else}
												<LbIcon name="eye-off" height="16" width="16"/>
											{/if}
										</div>
									</div>
								{/if}
							</div>
							<div class="flex grid grid-cols-2 gap-2 mt-4 w-full">
								<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
												onclick={cancel}>
									<p class="truncate text-lg">{$_("Cancel")}</p>
								</button>
								<button type="submit" class="w-full btn btn-lg shadow-sm rounded-lg border border-white/15 hover:border-white/50
										{password.length > 0 ? 'preset-filled-primary-500' : 'dark:bg-surface-950 bg-surface-50'}">
									<p class="truncate text-lg">{$_("OK")}</p>
								</button>
							</div>
						</form>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
