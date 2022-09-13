# d3-funnel

[![npm](https://img.shields.io/npm/v/d3-funnel.svg?style=flat-square)](https://www.npmjs.com/package/d3-funnel)
[![Build Status](https://img.shields.io/github/workflow/status/jakezatecky/d3-funnel/Build?style=flat-square)](https://github.com/jakezatecky/d3-funnel/actions/workflows/main.yml)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/jakezatecky/d3-funnel/master/LICENSE.txt)

**d3-funnel** is an extensible, open-source JavaScript library for rendering
funnel charts using the [D3.js][d3] library.

d3-funnel is focused on providing practical and visually appealing funnels
through a variety of customization options. Check out the [examples page][examples]
to get a showcasing of the several possible options.

# Installation

To install this library, simply include both [D3.js][d3] and D3Funnel:

``` html
<script src="/path/to/d3.js"></script>
<script src="/path/to/dist/d3-funnel.js"></script>
```

Alternatively, if you are using Webpack or Browserify, you can install the npm
package and `import` the module. This will include a compatible version of
D3.js for you:

```
npm install d3-funnel --save
```

``` javascript
import D3Funnel from 'd3-funnel';
```

# Usage

To use this library, you must create a container element and instantiate a new
funnel chart. By default, the chart will assume the width and height of the
parent container:

``` html
<div id="funnel"></div>

<script>
    const data = [
        { label: 'Inquiries', value: 5000 },
        { label: 'Applicants', value: 2500 },
        { label: 'Admits', value: 500 },
        { label: 'Deposits', value: 200 },
    ];
    const options = {
        block: {
            dynamicHeight: true,
            minHeight: 15,
        },
    };

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
| `label.enabled`        | Whether the block labels should be displayed.                             | bool     | `true`                  |
| `label.fontFamily`     | Any valid font family for the labels.                                     | string   | `null`                  |
| `label.fontSize`       | Any valid font size for the labels.                                       | string   | `'14px'`                |
| `label.fill`           | Any valid hex color for the label color.                                  | string   | `'#fff'`                |
| `label.format`         | Either `function(label, value)` or a format string. See below.            | mixed    | `'{l}: {f}'`            |
| `tooltip.enabled`      | Whether tooltips should be enabled on hover.                              | bool     | `false`                 |
| `tooltip.format`       | Either `function(label, value)` or a format string. See below.            | mixed    | `'{l}: {f}'`            |
| `events.click.block`   | Callback `function(data)` for when a block is clicked.                    | function | `null`                  |

### Label/Tooltip Format

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

## Advanced Data

In the examples above, both `label` and `value` were just to describe a block
within the funnel. A complete listing of the available options is included
below:

| Option          | Type   | Description                                                     | Example       |
| --------------- | ------ | --------------------------------------------------------------- | ------------- |
| label           | mixed  | **Required.** The label to associate with the block.            | `'Students'`  |
| value           | number | **Required.** The value (or count) to associate with the block. | `500`         |
| backgroundColor | string | A row-level override for `block.fill.scale`. Hex only.          | `'#008080'`   |
| formattedValue  | mixed  | A row-level override for `label.format`.                        | `'USD: $150'` |
| hideLabel       | bool   | Whether to hide the formatted label for this block.             | `true`        |
| labelColor      | string | A row-level override for `label.fill`. Hex only.                | `'#333'`      |

## API

Additional methods beyond `draw()` are accessible after instantiating the chart:

| Method      | Description                                     |
| ----------- | ----------------------------------------------- |
| `destroy()` | Removes the funnel and its events from the DOM. |

# License

MIT license.

[d3]: http://d3js.org/
[examples]: http://jakezatecky.github.io/d3-funnel/
[jQuery-extend]: https://api.jquery.com/jquery.extend/
[lodash-merge]: https://lodash.com/docs#merge
