# Map

Special LoxBuddy control to show a map. Currently only OpenStreetMap is supported.

The following two Loxone Config elements can be used to show a map:
* Webpage elements: For the embedding of fixed maps.
* Marker (InfoOnlyText) elements: For the embedding of dynamic maps, using a Virtual Text Input.

*NOTE: This map functionality is not available in the original App*

## Map using the Loxone Webpage element

Use the `URL` field in the Webpage element to specify the OpenStreetMap location.
As the Webpage element has no inputs, the specified map is *fixed* and cannot be altered.
The most basic map URL describing a specific location and region of the map has the following form:

```
https://www.openstreetmap.org/#map=<zoom>/<latitude>/<longitude>
```

The `latitude` and `longitude` refer to the location of the centre of the map, the `zoom` level gives its scale.In zoom level 13, the scale is ≈ 13 meters per pixel. Larger zoom values give a more accurate scale, and successive zoom levels differ by a factor 2. No marker is shown for this map URL.

Example:

```
https://www.openstreetmap.org/#map=19/52.373104/4.898829
```

To display a map with a location marker, specify the `mlat` (marker latitude) and `mlon` (marker longitude) *before* the map coordinates:
 
```
https://www.openstreetmap.org/?mlat=<latitude>&mlon=<longitude>#map=<zoom>/<latitude>/<longitude>
```

Example:

```
https://www.openstreetmap.org/?mlat=52.373104&mlon=4.898829#map=19/52.373104/4.898829
```

A blue location marker is now placed at the center of the map.

## Map using Loxone Marker element (InfoOnlyText)

Place a Marker in your Loxone Config setup, and specify `Text` as input type. Attach a Virtual Text Input to the Marker, and give it a name (e.g. `map_url`). Now you can send the map URL as text to the Marker using a HTTP GET request (see [documentation](https://www.loxone.com/enen/kb/virtual-inputs-outputs/)). Note that the hash character (`#`) should be replaced by `%23` otherwise the Virtual Text Input does not process the entire string:

```
http://User:Password@MiniserverIP/dev/sps/io/map_url/https://www.openstreetmap.org/%23map=19/52.373104/4.898829
```

And to display a map with a location marker:

```
http://User:Password@MiniserverIP/dev/sps/io/map_url/https://www.openstreetmap.org/?mlat=<latitude>&mlon=<longitude>%23map=<zoom>/<latitude>/<longitude>
```

## Map with multiple custom markers

In order to visualize multiple custom markers on the map, the following JSON object structure could be used: 

```json
{
  "map": "osm",
  "coordinates": [4.898829, 52.373104],
  "description": "Map of Amsterdam",
  "zoom": 19,
  "markers": [
    {
      "coordinates": [4.898829, 52.373104],
      "name": "Car",
      "icon": "hugeicons:car-05",
      "color": "#ef4444",
      "bgColor": "#ffffff"
    },
    {
      "coordinates": [4.89895, 52.373104],
      "name": "Gas station",
      "icon": "tabler:gas-station",
      "color": "#3b82f6",
      "bgColor": "#ffffff"
    }
  ]
}
```

In addition to the map information, a list of markers is given. Each marker contains coordinates, name and  icon based on the [Iconify](https://iconify.design/) library name, and the fill and background color of the icon.
The background color is optional.

The object should be send as *stringified* text message to the Virtual Text Marker using a HTTP GET request. Note that we again replace `#` by a `%23` to avoid interpretation issues.

```
http://User:Password@MiniserverIP/dev/sps/io/map_url/{"map":"osm","coordinates":[4.898829,52.373104],"description":"Map of Amsterdam","zoom":19,"markers":[{"coordinates":[4.898829,52.373104],"name":"Car","icon":"hugeicons:car-05","color":"%23ef4444","bgColor":"%23ffffff"},{"coordinates":[4.89895,52.373104],"name":"Gas station","icon":"tabler:gas-station","color":"%233b82f6","bgColor":"%23ffffff"}]}
```

## Screenshot

<img src="https://github.com/nufke/loxbuddy/blob/main/docs/screenshot_mobile_show_map.png" alt="Screenshot Show Map">
