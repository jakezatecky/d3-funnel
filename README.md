# D3 Funnel

**D3Funnel** is an extensible, open-source JavaScript library for rendering
funnel charts using the [D3.js][d3] library.

D3Funnel is focused on providing practical and visually appealing funnels
through a variety of customization options. Check out the [examples page][examples]
to get a showcasing of the several possible options.

# Usage

To use this library, you must include the source files for [D3.js][d3] and
D3Funnel.

``` html
<script src="/path/to/d3.min.js"></script>
<script src="/path/to/d3-funnel.js"></script>
```

You must also create a container element and instantiate a new chart:

``` html
<div id="funnel"></div>

<script>
	var data = [
	    ["Plants",     5000],
	    ["Flowers",    2500],
	    ["Perennials", 200],
	    ["Roses",      50]
	];
	var options = {};

	var chart = new D3Funnel("#funnel");
	chart.draw(data, options);
</script>
```

## Options


| Option           | Description                                                                 | Type     | Default             |
| ---------------- | --------------------------------------------------------------------------- | -------- | ------------------- |
| `width`          | The pixel width of the chart.                                               | int      | Container's width   |
| `height`         | The pixel height of the chart.                                              | int      | Container's height  |
| `bottomWidth`    | The percent of total width the bottom should be.                            | float    | `1 / 3`             |
| `bottomPinch`    | How many sections to pinch on the bottom to create a "neck".                | int      | `0`                 |
| `isCurved`       | Whether the funnel is curved.                                               | bool     | `false`             |
| `curveHeight`    | The curvature amount (if `isCurved` is `true`).                             | int      | `20`                |
| `fillType`       | Either `"solid"` or `"gradient"`.                                           | string   | `"solid"`           |
| `isInverted`     | Whether the funnel is inverted (like a pyramid).                            | bool     | `false`             |
| `hoverEffects`   | Whether the funnel has effects on hover.                                    | bool     | `false`             |
| `dynamicArea`    | Whether block areas are calculated by counts (as opposed to static height). | bool     | `false`             |
| `minHeight`      | The minimum pixel height of a block.                                        | int/bool | `false`             |
| `animation`      | The load animation speed in milliseconds.                                   | int/bool | `false`             |
| `label.fontSize` | Any valid font size for the labels.                                         | string   | `"14px"`            |
| `label.fill`     | Any valid hex color for the label color                                     | string   | `"#fff"`            |
| `onItemClick`    | Event handler if one of the items is clicked.                               | function | `function(d, i) {}` |

<table>

</table>

## Advanced Data

You can specify overriding colors for any data point (hex only):

``` javascript
var data = [
    ["Teal",      12000, "#008080" "#080800"],
    ["Byzantium", 4000,  "#702963"],
    ["Persimmon", 2500,  "#ff634d" "#6f34fd"],
    ["Azure",     1500,  "#007fff" "#07fff0"]
    //         Background ---^         ^--- Label
];
```

If you want to pass formatted values to be shown in the funnel, pass in an array containing the value and formatted value:

``` javascript
var data = [
    ["Teal",      [12000, "USD 12,000'], "#008080"],
    ["Byzantium", [4000,  "USD 4,000'],  "#702963"],
    ["Persimmon", [2500,  "USD 2,500'],  "#ff634d"],
    ["Azure",     [1500,  'USD 1,500'],  "#007fff"]
];
```

# License

MIT license.

[d3]: http://d3js.org/
[examples]: http://jakezatecky.github.io/d3-funnel/
