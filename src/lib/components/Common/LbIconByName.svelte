<script lang="ts">
	import { onMount} from 'svelte';
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import iconmap from '$lib/components/Common/lox2iconify.json';
	import Icon, { setCustomIconLoader, loadIcon } from '@iconify/svelte';

	const iconpath = '/icons/svg/';
	let { name, ...others } = $props();
	let iconName = name.includes(':') ? 'lb_' + name : name; 
	let icon: string = iconmap[iconName] && iconmap[iconName].length ? iconmap[iconName] : iconName;

	let strokeWidth = 1.5;
 
	const updateIconProps = async (name: string, font: string) => {
		const data = await loadIcon(`${font}:${name}`);
		const scale = data.height/32/0.75*strokeWidth;
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
		} : null;
	}

	onMount( () => {
		// register callbacks to update properties of fonts.
		setCustomIconLoader( (name: string) => updateIconProps(name, 'charm'), 'lb_charm');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'ci'), 'lb_ci');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'cbi'), 'lb_cbi');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'hugeicons'), 'lb_hugeicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'iconamoon'), 'lb_iconamoon');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'iconoir'), 'lb_iconoir');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'icon-park-outline'), 'lb_icon-park-outline');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'ion'), 'lb_ion');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'lucide'), 'lb_lucide');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'lucide-lab'), 'lb_lucide-lab');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'majesticons'), 'lb_majesticons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'mage'), 'lb_mage');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'mynaui'), 'lb_mynaui');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'ph'), 'lb_ph');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'proicons'), 'lb_proicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'si'), 'lb_si');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'solar'), 'lb_solar');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'streamline'), 'lb_streamline');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'streamline-flex'), 'lb_streamline-flex');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'streamline-plump'), 'lb_streamline-plump');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'streamline-ultimate'), 'lb_streamline-ultimate');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'system-uicons'), 'lb_system-uicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'tabler'), 'lb_tabler');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'tdesign'), 'lb_tdesign');
	});
</script>

{#if icon && icon.length && icon.includes('svg')}
	<svg use:inlineSvg={iconpath + icon} {...others}></svg>
{:else if icon && icon.length && icon.includes(':')}
	<Icon {icon} {...others} />
{:else if icons[name]}
	{@const LucideIcon = icons[name]}
	<LucideIcon {...others} />
{:else}
	<Icon icon="lb_hugeicons:border-none-02"  {...others} />
{/if}


<!--
<div style='stroke-width: {await setStrokeWidth(icon)}'>
</div>
-->