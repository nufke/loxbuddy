<script lang="ts">
	import { Map, Layer, View, Feature } from 'svelte-openlayers';
	import type { LayerTileProps } from 'svelte-openlayers';
	import 'svelte-openlayers/styles.css';
	import { Style, Icon, Circle, Fill, Stroke } from 'ol/style';
	import type { MapType } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';

	let { map } = $props();

	let map_ = $derived(getMap(map));

	function getMap(map: string | MapType) : MapType | null {
		const mapElement = (map as string).match(/openstreetmap.org\/#map=(.*)\/(.*)\/(.*)/) ?? [];
		if (mapElement.length) return {
			map: 'osm',
			coordinates: [Number(mapElement[3]), Number(mapElement[2])],
			zoom: Number(mapElement[1]),
			icons: [
				{
					coordinates: [Number(mapElement[3]), Number(mapElement[2])],
					name: 'boxicons:location-filled', // default: location pin
					color: '#0000ff', // blue icon
					bgColor: '#ffffff' // white background
				}
			]
		}
		const mapObj = utils.isValidJSONObject(map as string) ? JSON.parse(map as string) : (map as MapType);
		if (mapObj?.map && mapObj?.coordinates) {
			return mapObj;
		}
		return null; // not a map string nor object, return null
	}

	function createIconStyle(iconName: string, color: string, bgColor: string): Style[] {
		const [prefix, name] = iconName.split(':');
		const src = `https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(color)}`;
		return [
			new Style({
				image: new Circle({
					radius: 20,
					fill: new Fill({ color: bgColor }),
					stroke: new Stroke({ color: '#bfbfbf', width: 1 })
				})
			}),
			new Style({
				image: new Icon({ src, width: 24, height: 24, crossOrigin: 'anonymous' })
			})
		];
	}
</script>

<div class="h-150 w-full">
	{#if map_ && map_.zoom && map_.coordinates}
		<View center={map_.coordinates} zoom={map_.zoom}>
			<Map controls={{ fullscreen: true }}>
				<Layer.Tile source={(map_.map) as LayerTileProps['source']} />
				{#each map_.icons as icon}
					<Layer.Vector style={createIconStyle(icon.name, icon.color, icon.bgColor)}>
						<Feature.Point coordinates={icon.coordinates} />
					</Layer.Vector>
				{/each}
			</Map>
		</View>
	{:else}
		<div class="flex w-full h-full justify-center items-center bg-surface-200-800">
			<p>{$_('No valid map or coordinates found')}</p>
		</div>
	{/if}
</div>
