# Map

Special LoxBuddy control to show a map. Currently only OpenStreetMap is supported.

The following two Loxone Config controls can be used to show a map:
* Webpage control: For the embedding of fixed maps
* Marker (InfoOnlyText) control: For the embedding of dynamic maps, using a Virtual Text Input

## Map using Webpage control

Use the `URL` field in the Webpage control to specify the OpenStreetMap location.
The most basic map URL describing a specific location and region of the map has the following form:

```
http://www.openstreetmap.org/#map=<zoom>/<latitude>/<longitude>
```

The `latitude` and `longitude` refer to the location of the centre of the map, the `zoom` level gives its scale.In zoom level 13, the scale is ≈ 13 metres per pixel. Larger zoom values give a more accurate scale, and successive zoom levels differ by a factor 2. By default a blue marker is placed at the center of the map.

Example:

```
https://www.openstreetmap.org/#map=19/52.373104/4.898829
```

As the Webpage control has no inputs. The specified map is *static* and cannot be altered afterwards. To implement dynamic maps, use the **Marker** control.

## Map using Marker (InfoOnlyText) control

Place a marker in your Loxone Config setup, and specify `Text` as input type. Attach a Virtual Text Input to the Marker, and give it a name (e.g. map_url). Now you can send the map URL as text to the Marker. Note that the hash character (`#`) should be replaced by `%23` otherwise the Virtual Text Input does not process the entire string:

```
http://User:Password@MiniserverIP/dev/sps/io/map_url/https://www.openstreetmap.org/%23map=19/52.373104/4.898829
```

In order to visualize multiple markers on the map, the following object structure should be used: 

```json
{
  "map": "osm",
  "coordinates": [4.898829,52.373104],
  "zoom": 19,
  "icons": [
    {
      "coordinates": [4.898829,52.373104],
      "name": "hugeicons:car-05",
      "color": "#ef4444",
      "bgColor": "#ffffff"
    },
    {
      "coordinates": [4.89895,52.373104],
      "name": "tabler:armchair",
      "color": "#3b82f6",
      "bgColor": "#ffffff"
    }
  ]
}
```

In addition to the map information, a list of icon-based markers can be added. where each icon should define its coordinates, the name of the icon based on the [Iconify](https://iconify.design/) library name, and the fill and background color of the icon.

The object should be send as *stringified* text message to the Virtual Text Marker. Note that we again replaced `#` by a `%23` to avoid interpretation issues.

```
http://User:Password@MiniserverIP/dev/sps/io/map_url{"map":"osm","coordinates":[4.898829,52.373104],"zoom":19,"icons":[{"coordinates":[4.898829,52.373104],"name":"hugeicons:car-05","color":"%23ef4444","bgColor":"%23ffffff"},{"coordinates":[4.89895,52.373104],"name":"tabler:armchair","color":"%233b82f6","bgColor":"%23ffffff"}]}
```

## Screenshot

<img src="https://github.com/nufke/loxbuddy/blob/main/docs/screenshot_mobile_show_map.png" height=800 width=400 alt="Screenshot Show Map">
