<script lang="ts">
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { _ } from 'svelte-i18n';

	let { onSubmit, onCancel }: { onSubmit: (pw: string) => void; onCancel: () => void } = $props();

	let password = $state('');
	let hidePassword = $state(true);

	function focusOnMount(node: HTMLInputElement): void {
		requestAnimationFrame(() => node.focus()); // defer past focus trap cycle
	}

	function submit(): void {
		if (!password.length) return;
		const pw = password;
		password = '';
		hidePassword = true;
		onSubmit(pw);
	}
</script>

<form onsubmit={(e) => { e.preventDefault(); submit(); }}>
	<div class="w-full mb-2">
		<!-- hidden username field assists browser autofill heuristics -->
		<input class="sr-only" type="text" autocomplete="username" tabindex="-1" aria-hidden="true" value="" readonly />
		<div class="input-group grid-cols-[1fr_auto] rounded-lg">
			<div dir="ltr">
				<input class="input h-[48px] bg-surface-50-950 rounded-s-lg"
					type={hidePassword ? "password" : "text"} bind:value={password}
					placeholder={$_("Password")} autocomplete="current-password" use:focusOnMount />
			</div>
			<div class="ig-btn preset-tonal" onclick={() => { hidePassword = !hidePassword }}>
				<LbIcon name={hidePassword ? "eye" : "eye-off"} height="16" width="16"/>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-2 mt-4 w-full">
		<button type="button" onclick={onCancel}
				class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50">
			<p class="truncate text-lg">{$_("Cancel")}</p>
		</button>
		<button type="submit"
				class="w-full btn btn-lg shadow-sm rounded-lg border border-white/15 hover:border-white/50
					{password.length > 0 ? 'preset-filled-primary-500' : 'bg-surface-50-950'}">
			<p class="truncate text-lg">{$_("OK")}</p>
		</button>
	</div>
</form>
