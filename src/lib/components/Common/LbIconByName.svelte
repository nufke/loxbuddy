<script lang="ts">
	import { onMount} from 'svelte';
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import iconmap from '$lib/components/Common/lox2iconify.json';
	import Icon, { setCustomIconLoader, loadIcon } from '@iconify/svelte';
	import '$lib/helpers/custom-icons';

	const iconpath = '/icons/svg/';

	let { name, ...others } = $props();

	let iconName: string = iconmap[name] && iconmap[name].length ? iconmap[name] : name;
	let icon: string = iconName.includes(':') ? 'lb_' + iconName : iconName; // iconify icons redirected to custom loader

	let strokeWidth = 1.5;
 
	const updateIconProps = async (name: string, iconSet: string) => {
		const data = await loadIcon(`${iconSet}:${name}`);
		const scale = data.height/32/0.75 * strokeWidth;
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
				.replaceAll(/stroke=\"[0-9\#]+\"/g, 'stroke-width="currentColor')
		} : null;
	}

	onMount( () => {
		// register callbacks to update properties of fonts.
		setCustomIconLoader( (name: string) => updateIconProps(name, 'akar-icons'), 'lb_akar-icons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'charm'), 'lb_charm');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'ci'), 'lb_ci');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'cbi'), 'lb_cbi');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'famicons'), 'lb_famicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'flowbite'), 'lb_flowbite');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'heroicons'), 'lb_heroicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'heroicons-outline'), 'lb_heroicons-outline');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'hugeicons'), 'lb_hugeicons');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'iconamoon'), 'lb_iconamoon');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'iconoir'), 'lb_iconoir');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'icon-park-outline'), 'lb_icon-park-outline');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'ion'), 'lb_ion');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'line-md'), 'lb_line-md');
		setCustomIconLoader( (name: string) => updateIconProps(name, 'loxbuddy'), 'lb_loxbuddy');
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
		setCustomIconLoader( (name: string) => updateIconProps(name, 'streamline-sharp'), 'lb_streamline-sharp');
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