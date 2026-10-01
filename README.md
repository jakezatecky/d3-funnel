# d3-funnel

[![npm](https://img.shields.io/npm/v/d3-funnel.svg?style=flat-square)](https://www.npmjs.com/package/d3-funnel)
[![Build Status](https://img.shields.io/github/actions/workflow/status/jakezatecky/d3-funnel/main.yml?branch=master&style=flat-square)](https://github.com/jakezatecky/d3-funnel/actions/workflows/main.yml)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/jakezatecky/d3-funnel/master/LICENSE.txt)

**d3-funnel** is an extensible, open-source JavaScript library for rendering
funnel charts using the [D3.js][d3] library.

d3-funnel is focused on providing practical and visually appealing funnels
through a variety of customization options. Check out the [examples page][examples]
to get a showcasing of the several possible options.

# Installation

Install this library via npm, yarn, pnpm, or your preferred package manager:

```
npm install d3-funnel --save
```

You can then load this library into your app using `import`:

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
            proportionalHeight: true,
            minHeight: 15,
        },
    };

    const chart = new D3Funnel('#funnel');
    chart.draw(data, options);
</script>
```

## Options

| Option                         | Description                                                              | Type     | Default               |
| ------------------------------ | ------------------------------------------------------------------------ | -------- | --------------------- |
| `chart.width`                  | The width of the chart in pixels or a percentage.                        | mixed    | Container's width     |
| `chart.height`                 | The height of the chart in pixels or a percentage.                       | mixed    | Container's height    |
| `chart.neckWidth`              | The width of the narrow end (top when inverted) as a fraction of width.  | number   | `1 / 3`               |
| `chart.pinchedBlocks`          | How many blocks at the neck keep its width.                              | number   | `0`                   |
| `chart.inverted`               | Whether the funnel direction is inverted (like a pyramid).               | bool     | `false`               |
| `chart.animation.duration`     | The duration of each block's load animation in milliseconds.             | number   | `0` (disabled)        |
| `chart.curve.enabled`          | Whether the funnel is curved.                                            | bool     | `false`               |
| `chart.curve.depth`            | The pixel depth of a full-width edge's curve; narrower edges curve less. | number   | `5`                   |
| `chart.curve.shade`            | The shade adjustment of the top oval, from `-1` to `1`.                  | number   | `-0.4`                |
| `chart.totalValue`             | Override the total value used in ratio calculations.                     | number   | `null`                |
| `block.proportionalHeight`     | Whether the block heights are proportional to their value.               | bool     | `false`               |
| `block.proportionalWidth`      | Whether the block widths narrow in proportion to their value decrease.   | bool     | `false`               |
| `block.barOverlay.enabled`     | Whether the blocks have bar chart overlays proportional to its weight.   | bool     | `false`               |
| `block.barOverlay.shade`       | The shade adjustment of the block behind its overlay, from `-1` to `1`.  | number   | `0.3`                 |
| `block.fill.colors`            | The block colors as a repeating array or a function of the block index.  | mixed    | `d3.schemeCategory10` |
| `block.fill.type`              | Either `'solid'` or `'gradient'`.                                        | string   | `'solid'`             |
| `block.fill.gradientShade`     | The shade adjustment of the edges of gradient fills, from `-1` to `1`.   | number   | `-0.2`                |
| `block.minHeight`              | The minimum pixel height of a block.                                     | number   | `0`                   |
| `block.gap`                    | The pixel space between blocks. The funnel's outline is preserved.       | number   | `0`                   |
| `block.highlight.enabled`      | Whether the blocks are highlighted on hover.                             | bool     | `false`               |
| `block.highlight.shade`        | The shade adjustment of a highlighted block, from `-1` to `1`.           | number   | `-0.2`                |
| `label.enabled`                | Whether the block labels should be displayed.                            | bool     | `true`                |
| `label.fontFamily`             | Any valid font family for the labels.                                    | string   | `null`                |
| `label.fontSize`               | Any valid font size for the labels.                                      | string   | `'14px'`              |
| `label.lineHeight`             | The height of each line of a label, as a multiple of its font size.      | number   | `1.4`                 |
| `label.color`                  | Any valid hex color for the labels.                                      | string   | `'#fff'`              |
| `label.format`                 | Either `function(label, value)` or a format string. See below.           | mixed    | `'{l}: {f}'`          |
| `label.verticalAlign`          | Where to place labels within their blocks: `top`, `middle`, or `bottom`. | string   | `'middle'`            |
| `label.overflow`               | Either `'visible'` or `'ellipsis'` to truncate labels wider than blocks. | string   | `'visible'`           |
| `label.padding`                | The pixel padding between a label and the edges of its block.            | number   | `5`                   |
| `tooltip.enabled`              | Whether tooltips should be enabled on hover.                             | bool     | `false`               |
| `tooltip.format`               | Either `function(label, value)` or a format string. See below.           | mixed    | `'{l}: {f}'`          |
| `tooltip.offset`               | The pixel distance between the tooltip and the mouse.                    | number   | `5`                   |
| `tooltip.style`                | CSS properties for the tooltip, keyed by CSS name. See below.            | object   | See below             |
| `events.click.block`           | Callback `function(event, data)` for when a block is clicked.            | function | `null`                |
| `events.mouseover.block`       | Callback `function(event, data)` for when the mouse enters a block.      | function | `null`                |
| `events.mouseout.block`        | Callback `function(event, data)` for when the mouse leaves a block.      | function | `null`                |

### Curved Funnels with Gaps

When a curved funnel has a `block.gap`, each block shows its own top oval, with
the block above floating over it. Both options are in pixels, so they are easy
to compare: the blocks will look most three-dimensional when `block.gap` is
smaller than `chart.curve.depth`. For example, pair a deeper curve with a small
gap:

``` javascript
chart.draw(data, {
    chart: {
        curve: {
            enabled: true,
            depth: 15,
        },
    },
    block: {
        gap: 4,
    },
});
```

A shallow curve with a large gap will instead leave a wide band of empty space
between the blocks. Remember that narrower edges curve less, so the lower
blocks of a funnel have shallower ovals than the top block.

### Tooltip Styles

The option `tooltip.style` holds the CSS properties applied to the tooltip,
keyed by their CSS names. Your properties are merged into the defaults below,
and setting a property to `null` removes it. The tooltip's border is drawn in
the block's color unless you set `border` or `border-color`.

``` javascript
{
    background: 'rgb(255,255,255,0.75)',
    'border-style': 'solid',
    'border-width': '1px',
    color: '#000',
    'font-size': '14px',
    'font-weight': 'bold',
    padding: '5px 15px',
    'text-align': 'center',
}
```

For example, to use a dark tooltip without bold text:

``` javascript
chart.draw(data, {
    tooltip: {
        enabled: true,
        style: {
            background: '#222',
            color: '#fff',
            'font-weight': null,
        },
    },
});
```

### Label/Tooltip Format

The option `label.format` can either be a function or a string. The following
keys will be substituted by the string formatter:

| Key     | Description                  |
| ------- | ---------------------------- |
| `'{l}'` | The block's supplied label.  |
| `'{v}'` | The block's raw value.       |
| `'{f}'` | The block's formatted value. |

### Event Data

Block-based events are passed a DOM `event` and a `data` object containing
the following elements:

| Key              | Type   | Description                           |
| ---------------- | ------ | ------------------------------------- |
| index            | number | The index of the block.               |
| data             | mixed  | The block's original data entry.      |
| node             | object | The DOM node of the block.            |
| value            | number | The numerical value.                  |
| fill.raw         | string | The original block color.             |
| fill.actual      | string | The actual color (may be a gradient). |
| label.raw        | string | The unformatted label.                |
| label.formatted  | string | The result of `options.label.format`. |
| label.color      | string | The label color.                      |
| label.fontSize   | string | The label font size.                  |
| label.fontFamily | string | The label font family, if any.        |

An example `data` object is below:

``` javascript
{
    index: 0,
    data: { label: 'Visitors', value: 150 },
    node: { ... },
    value: 150,
    fill: { raw: "#ff7f0e", actual: "#ff7f0e" },
    label: {
        raw: 'Visitors',
        formatted: 'Visitors: 150',
        color: '#fff',
        fontSize: '14px',
        fontFamily: null,
    },
},
```

Because `data` holds the original entry, you can attach your own properties to
each block and read them in event handlers. For example, to open a URL when a
block is clicked:

``` javascript
const data = [
    { label: 'Visitors', value: 5000, url: '/visitors' },
    { label: 'Leads', value: 2500, url: '/leads' },
];
const options = {
    events: {
        click: {
            block(event, d) {
                window.location.href = d.data.url;
            },
        },
    },
};

chart.draw(data, options);
```

### Overriding Defaults

You may wish to override the default chart options. For example, you may wish
for every funnel to have proportional heights. To do this, simply modify the
`D3Funnel.defaults` property:

``` javascript
D3Funnel.defaults.block.proportionalHeight = true;
```

Should you wish to override multiple properties at a time, you may consider
using [lodash's][lodash-merge] `_.merge` or [jQuery's][jquery-extend] `$.extend`:

``` javascript
D3Funnel.defaults = _.merge(D3Funnel.defaults, {
    block: {
        proportionalHeight: true,
        fill: {
            type: 'gradient',
        },
    },
    label: {
        format: '{l}: ${f}',
    },
});
```

## Advanced Data Options

In the examples above, `label` and `value` were required descriptions of a block
within the funnel. Below is a complete list of all block-level options:

| Option          | Type   | Description                                                     | Example       |
| --------------- | ------ | --------------------------------------------------------------- | ------------- |
| label           | mixed  | **Required.** The label to associate with the block.            | `'Students'`  |
| value           | number | **Required.** The value (or count) to associate with the block. | `500`         |
| fillColor       | string | A row-level override for `block.fill.colors`. Hex only.         | `'#702963'`   |
| formattedValue  | mixed  | A row-level override for `label.format`.                        | `'USD: $150'` |
| hideLabel       | bool   | Whether to hide the formatted label for this block.             | `true`        |
| labelColor      | string | A row-level override for `label.color`. Hex only.               | `'#333'`      |
| labelFontSize   | string | A row-level override for `label.fontSize`.                      | `'18px'`      |
| labelFontFamily | string | A row-level override for `label.fontFamily`.                    | `'Georgia'`   |

## API

Additional methods beyond `draw()` are accessible after instantiating the chart:

### `drawLabel(index, overrides?)`

Redraws the label of the block at `index`, optionally with a different `color`,
`fontSize`, or `fontFamily`. Overrides apply only to that drawing, so calling
`drawLabel(index)` again restores the block's original label. For example, to
enlarge a block's label while the mouse is over it:

``` javascript
const options = {
    events: {
        mouseover: {
            block(event, d) {
                chart.drawLabel(d.index, { fontSize: '18px' });
            },
        },
        mouseout: {
            block(event, d) {
                chart.drawLabel(d.index);
            },
        },
    },
};
```

### `destroy()`

Removes the funnel and its events from the DOM.

# License

MIT license.

[d3]: http://d3js.org/
[examples]: http://jakezatecky.github.io/d3-funnel/
[jquery-extend]: https://api.jquery.com/jquery.extend/
[lodash-merge]: https://lodash.com/docs#merge
