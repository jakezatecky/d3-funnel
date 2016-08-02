# D3 Funnel

[![npm](https://img.shields.io/npm/v/d3-funnel.svg?style=flat-square)](https://www.npmjs.com/package/d3-funnel)
[![Build Status](https://img.shields.io/travis/jakezatecky/d3-funnel/master.svg?style=flat-square)](https://travis-ci.org/jakezatecky/d3-funnel)
[![Dependency Status](https://img.shields.io/david/jakezatecky/d3-funnel.svg?style=flat-square)](https://david-dm.org/jakezatecky/d3-funnel)
[![devDependency Status](https://david-dm.org/jakezatecky/d3-funnel/dev-status.svg?style=flat-square)](https://david-dm.org/jakezatecky/d3-funnel#info=devDependencies)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/jakezatecky/d3-funnel/master/LICENSE.txt)

**D3Funnel** is an extensible, open-source JavaScript library for rendering
funnel charts using the [D3.js][d3] library.

D3Funnel is focused on providing practical and visually appealing funnels
through a variety of customization options. Check out the [examples page][examples]
to get a showcasing of the several possible options.

# Installation

To install this library, simply include both [D3.js v4.x][d3] and D3Funnel:

``` html
<script src="/path/to/d3.v4.js"></script>
<script src="/path/to/dist/d3-funnel.js"></script>
```

Alternatively, if you are using Webpack or Browserify, you can install the npm
package and `require` or `import` the module. This will include a compatible
version of D3.js for you:

```
npm install d3-funnel --save
```

``` javascript
// CommonJS
var D3Funnel = require('d3-funnel');

// ES6
import D3Funnel from 'd3-funnel';
```

# Usage

To use this library, you must create a container element and instantiate a new
funnel chart:

``` html
<div id="funnel"></div>

<script>
    const data = [
        ['Plants',     5000],
        ['Flowers',    2500],
        ['Perennials', 200],
        ['Roses',      50],
    ];
    const options = { block: { dynamicHeight: true } };

    const chart = new D3Funnel('#funnel');
    chart.draw(data, options);
</script>
```

## Options

| Option                 | Description                                                               | Type     | Default                 |
| ---------------------- | ------------------------------------------------------------------------- | -------- | ----------------------- |
| `chart.width`          | The width of the chart in pixels or a percentage.                         | mixed    | Container's width       |
| `chart.height`         | The height of the chart in pixels or a percentage.                        | mixed    | Container's height      |
| `chart.bottomWidth`    | The percent of total width the bottom should be.                          | number   | `1 / 3`                 |
| `chart.bottomPinch`    | How many blocks to pinch on the bottom to create a funnel "neck".         | number   | `0`                     |
| `chart.inverted`       | Whether the funnel direction is inverted (like a pyramid).                | bool     | `false`                 |
| `chart.animate`        | The load animation speed in milliseconds.                                 | number   | `0` (disabled)          |
| `chart.curve.enabled`  | Whether the funnel is curved.                                             | bool     | `false`                 |
| `chart.curve.height`   | The curvature amount.                                                     | number   | `20`                    |
| `chart.totalCount`     | Override the total count used in ratio calculations.                      | number   | `null`                  |
| `block.dynamicHeight`  | Whether the block heights are proportional to their weight.               | bool     | `false`                 |
| `block.dynamicSlope`   | Whether the block widths are proportional to their value decrease.        | bool     | `false`                 |
| `block.barOverlay`     | Whether the blocks have bar chart overlays proportional to its weight.    | bool     | `false`                 |
| `block.fill.scale`     | The background color scale as an array or function.                       | mixed    | `d3.schemeCategory10`   |
| `block.fill.type`      | Either `'solid'` or `'gradient'`.                                         | string   | `'solid'`               |
| `block.minHeight`      | The minimum pixel height of a block.                                      | number   | `0`                     |
| `block.highlight`      | Whether the blocks are highlighted on hover.                              | bool     | `false`                 |
| `label.fontFamily`     | Any valid font family for the labels.                                     | string   | `null`                  |
| `label.fontSize`       | Any valid font size for the labels.                                       | string   | `'14px'`                |
| `label.fill`           | Any valid hex color for the label color.                                  | string   | `'#fff'`                |
| `label.format`         | Either `function(label, value)`, an array, or a format string. See below. | mixed    | `'{l}: {f}'`            |
| `events.click.block`   | Callback `function(data)` for when a block is clicked.                    | function | `null`                  |

### Label Format

The option `label.format` can either be a function or a string. The following
keys will be substituted by the string formatter:

| Key     | Description                  |
| ------- | ---------------------------- |
| `'{l}'` | The block's supplied label.  |
| `'{v}'` | The block's raw value.       |
| `'{f}'` | The block's formatted value. |

### Event Data

Block-based events are passed a `data` object containing the following elements:

| Key             | Type   | Description                           |
| --------------- | ------ | ------------------------------------- |
| index           | number | The index of the block.               |
| node            | object | The DOM node of the block.            |
| value           | number | The numerical value.                  |
| fill            | string | The background color.                 |
| label.raw       | string | The unformatted label.                |
| label.formatted | string | The result of `options.label.format`. |
| label.color     | string | The label color.                      |

Example:

``` javascript
{
	index: 0,
	node: { ... },
	value: 150,
	fill: '#c33',
	label: {
		raw: 'Visitors',
		formatted: 'Visitors: 150',
		color: '#fff',
	},
},
```

### Overriding Defaults

You may wish to override the default chart options. For example, you may wish
for every funnel to have proportional heights. To do this, simply modify the
`D3Funnel.defaults` property:

``` javascript
D3Funnel.defaults.block.dynamicHeight = true;
```

Should you wish to override multiple properties at a time, you may consider
using [lodash's][lodash-merge] `_.merge` or [jQuery's][jquery-extend] `$.extend`:

``` javascript
D3Funnel.defaults = _.merge(D3Funnel.defaults, {
    block: {
        dynamicHeight: true,
        fill: {
            type: 'gradient',
        },
    },
    label: {
        format: '{l}: ${f}',
    },
});
```

## API

Additional methods beyond `draw()` are accessible after instantiating the chart:

| Method      | Description                                     |
| ----------- | ----------------------------------------------- |
| `destroy()` | Removes the funnel and its events from the DOM. |

## Advanced Data

You can specify colors to override `block.fill.scale` and `label.fill` for any
data point (hex only):

``` javascript
var data = [
    ['Teal',      12000, '#008080', '#080800'],
    ['Byzantium', 4000,  '#702963'],
    ['Persimmon', 2500,  '#ff634d', '#6f34fd'],
    ['Azure',     1500,  '#007fff', '#07fff0'],
    //         Background ---^          ^--- Label
];
```

In addition to using `label.format`, you can also pass formatted values in an
array:

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
[jQuery-extend]: https://api.jquery.com/jquery.extend/
[lodash-merge]: https://lodash.com/docs#merge
