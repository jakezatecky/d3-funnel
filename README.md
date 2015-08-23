# D3 Funnel

[![npm](https://img.shields.io/npm/v/d3-funnel.svg)](https://www.npmjs.com/package/d3-funnel)
[![Build Status](https://travis-ci.org/jakezatecky/d3-funnel.svg?branch=master)](https://travis-ci.org/jakezatecky/d3-funnel)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/jakezatecky/d3-funnel/master/LICENSE.txt)

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
        ['Plants',     5000],
        ['Flowers',    2500],
        ['Perennials', 200],
        ['Roses',      50],
    ];
    var options = {};

    var chart = new D3Funnel('#funnel');
    chart.draw(data, options);
</script>
```

## Options

| Option           | Description                                                                 | Type     | Default            |
| ---------------- | --------------------------------------------------------------------------- | -------- | ------------------ |
| `width`          | The pixel width of the chart.                                               | int      | Container's width  |
| `height`         | The pixel height of the chart.                                              | int      | Container's height |
| `bottomWidth`    | The percent of total width the bottom should be.                            | float    | `1 / 3`            |
| `bottomPinch`    | How many blocks to pinch on the bottom to create a "neck".                  | int      | `0`                |
| `isCurved`       | Whether the funnel is curved.                                               | bool     | `false`            |
| `curveHeight`    | The curvature amount (if `isCurved` is `true`).                             | int      | `20`               |
| `fillType`       | Either `'solid'` or `'gradient'`.                                           | string   | `'solid'`          |
| `isInverted`     | Whether the funnel is inverted (like a pyramid).                            | bool     | `false`            |
| `hoverEffects`   | Whether the funnel has effects on hover.                                    | bool     | `false`            |
| `dynamicArea`    | Whether block areas are calculated by counts (as opposed to static height). | bool     | `false`            |
| `minHeight`      | The minimum pixel height of a block.                                        | int/bool | `false`            |
| `animation`      | The load animation speed in milliseconds.                                   | int/bool | `false`            |
| `label.fontSize` | Any valid font size for the labels.                                         | string   | `'14px'`           |
| `label.fill`     | Any valid hex color for the label color                                     | string   | `'#fff'`           |
| `label.format`   | Either `function(label, value)` or a format string. See below.              | mixed    | `'{l}: {f}'`       |
| `onItemClick`    | Event handler if one of the items is clicked.                               | function | `null`             |

### Label Format

The option `label.format` can either by a function, or a string. The following
keys will be substituted by the string formatter:

| Key    | Description                  |
| ------ | ---------------------------- |
| `'{l}'` | The block's supplied label.  |
| `'{v}'` | The block's raw value.       |
| `'{f}'` | The block's formatted value. |

## API

Additional methods beyond `draw()` are accessible after instantiating the chart:

| Method           | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `destroy()`      | Removes the funnel and its events from the DOM.                             |

## Advanced Data

You can specify overriding colors for any data point (hex only):

``` javascript
var data = [
    ['Teal',      12000, '#008080' '#080800'],
    ['Byzantium', 4000,  '#702963'],
    ['Persimmon', 2500,  '#ff634d' '#6f34fd'],
    ['Azure',     1500,  '#007fff' '#07fff0'],
    //         Background ---^         ^--- Label
];
```

If you want to pass formatted values to be shown in the funnel, pass in an array
containing the value and formatted value:

``` javascript
var data = [
    ['Teal',      [12000, 'USD 12,000']],
    ['Byzantium', [4000,  'USD 4,000']],
    ['Persimmon', [2500,  'USD 2,500']],
    ['Azure',     [1500,  'USD 1,500']],
];
```

# License

MIT license.

[d3]: http://d3js.org/
[examples]: http://jakezatecky.github.io/d3-funnel/
