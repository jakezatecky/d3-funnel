# D3 Funnel

**D3Funnel** is an extensible, open-source JavaScript library for rendering
funnel charts using the [D3.js][d3] library.

D3Funnel is focused on providing practical and visually appealing funnels
through a variety of customization options. Check out the [examples page][examples]
to get a showcasing of the several possible options.

# Usage

To use this library, you must include include [D3.js][d3] and the D3Funnel
source file:

``` html
<script src="d3.min.js"></script>
<script src="d3-funnel.js"></script>
```

## Basic

Drawing the funnel is relatively easy:

### HTML

``` html
<div id="funnel"></div>
```

### JavaScript

``` javascript
var data = [
    ["Plants",     5000],
    ["Flowers",    2500],
    ["Perennials", 200],
    ["Roses",      50]
];

var chart = new D3Funnel("#funnel");
chart.draw(data);
```

## Advanced

The following options may also be specified through the second parameter to
`D3Funnel.draw` (default values shown):

``` javascript
var options = {
    width: 350,            // In pixels; defaults to container's width (if non-zero)
    height: 400,           // In pixels; defaults to container's height (if non-zero)
    bottomWidth: 1/3,      // The percent of total width the bottom should be
    bottomPinch: 0,        // How many sections to pinch
    isCurved: false,       // Whether the funnel is curved
    curveHeight: 20,       // The curvature amount
    fillType: "solid",     // Either "solid" or "gradient"
    isInverted: false,     // Whether the funnel is inverted
    hoverEffects: false,   // Whether the funnel has effects on hover
    dynamicArea: false,    // Whether the funnel should calculate the blocks by
                           // the count values rather than equal heights
    minHeight: false,      // In pixels; minimum height of a section
    animation: false,      // The load animation speed in milliseconds
    label: {
        fontSize: "14px",  // Any valid font size
        fill: "#fff"       // Any valid hex color
    }
    onItemClick: function(d, i) {}  // Event handler if one of the items is clicked
};
chart.draw(data, options);
```

You can also specify overriding colors for any data point (hex only):

``` javascript
var data = [
    ["Teal",      12000, "#008080"],
    ["Byzantium", 4000,  "#702963"],
    ["Persimmon", 2500,  "#ff634d"],
    ["Azure",     1500,  "#007fff"]
];
```

You can also set colors for any data point label (hex only):

``` javascript
var data = [
    ["Teal",      12000, "#008080" "#080800"],
    ["Byzantium", 4000,  "#702963"],            // Defaults to options.label.fill
    ["Persimmon", 2500,  "#ff634d" "#6f34fd"],
    ["Azure",     1500,  "#007fff" "#07fff0"]
];
```

If you want to pass formatted values to be shown in the funnel, pass in an array containing the value and formatted value:

``` javascript
var data = [
    ["Teal",      [12000, 'USD 12,000'], "#008080"],
    ["Byzantium", [4000, 'USD 4,000'],  "#702963"],
    ["Persimmon", [2500, 'USD 2,500'],  "#ff634d"],
    ["Azure",     [1500, 'USD 1,500'],  "#007fff"]
];
```

# License

MIT license.

[d3]: http://d3js.org/
[examples]: http://jakezatecky.github.io/d3-funnel/
