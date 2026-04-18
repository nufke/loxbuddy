<script lang="ts">
	import { Map, Layer, View, Feature } from 'svelte-openlayers';
	import { createCircleStyle } from 'svelte-openlayers/utils';
	import 'svelte-openlayers/styles.css';

	let { zoom, latitude, longitude } = $props();

	const pointStyle = createCircleStyle({
		radius: 10,
		fill: { color: '#4338ca' },
		stroke: { color: '#ffffff', width: 2 }
	});
</script>

<div class="h-150 w-full">
	<View center={[longitude, latitude]} zoom={zoom}>
		<Map controls={{ fullscreen: true }}>
			<Layer.Tile source="osm" />
			<Layer.Vector style={pointStyle}>
				<Feature.Point coordinates={[longitude, latitude]} />
			</Layer.Vector>
		</Map>
	</View>
</div>
