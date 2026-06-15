<script lang="ts">
	import { Map, Layer, View, Feature } from 'svelte-openlayers';
	import type { LayerTileProps } from 'svelte-openlayers';
	import 'svelte-openlayers/styles.css';
	import { Style, Icon, Circle, Fill, Stroke } from 'ol/style';
	import type { MapType } from '$lib/types/models';
	import { getCustomIconSrc } from '$lib/helpers/registerIcons';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';

	let { map } = $props();

	let map_ = $derived(getMap(map));

	function getMap(map: string | MapType) : MapType | null {
		const mapElement = (map as string).match(/openstreetmap.org\/#map=(.*)\/(.*)\/(.*)/) ?? [];
		if (mapElement.length) return {
			map: 'osm',
			coordinates: [Number(mapElement[3]), Number(mapElement[2])],
			description: "Map",
			zoom: Number(mapElement[1]),
		}
		const mapw =	(map as string).match(/openstreetmap.org\/\?mlat=(.*)&mlon=(.*)#map=(.*)\/(.*)\/(.*)/) ?? [];
		if (mapw.length) return {
			map: 'osm',
			coordinates: [Number(mapw[5]), Number(mapw[4])],
			zoom: Number(mapw[3]),
			markers: [
				{
      		coordinates: [Number(mapw[2]), Number(mapw[1])],
      		name: 'Marker',
      		icon: 'weui:location-filled',
      		color: '#0000ff'
				}
			]
		}
		const mapObj = utils.isValidJSONObject(map as string) ? JSON.parse(map as string) : (map as MapType);
		if (mapObj?.map && mapObj?.coordinates) {
			return mapObj;
		}
		return null; // not a map string nor object, return null
	}

	function createIconStyle(iconName: string, color: string, bgColor?: string): Style[] {
		const [prefix, name] = iconName.split(':');
		const src = (prefix === 'loxbuddy') ? getCustomIconSrc(name, color)
			: `https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(color)}`;
		const style: Style[] = [];
		if (bgColor) { // only add cicle if we specify an icon background
			style.push(
				new Style({
					image: new Circle({
						radius: 20,
						fill: new Fill({ color: bgColor }),
						stroke: new Stroke({ color: '#bfbfbf', width: 1 })
					})
				})
			)
		};
		style.push(
			new Style({
				image: new Icon({ src, width: 28, height: 28, crossOrigin: 'anonymous' })
			})
		);
		return style;
	}
</script>

<div class="h-150 w-full">
	{#if map_ && map_.zoom && map_.coordinates}
		<View center={map_.coordinates} zoom={map_.zoom}>
			<Map controls={{ fullscreen: true }}>
				<Layer.Tile source={(map_.map) as LayerTileProps['source']} />
				{#each map_.markers as marker}
					<Layer.Vector style={createIconStyle(marker.icon, marker.color, marker?.bgColor)}>
						<Feature.Point coordinates={marker.coordinates} />
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
