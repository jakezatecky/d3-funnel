## [v2.1.0](https://github.com/jakezatecky/d3-funnel/compare/v2.0.0...v2.1.0) (2022-02-25)

### Other

* [#156]: Add TypeScript index file

## [v2.0.0](https://github.com/jakezatecky/d3-funnel/compare/v1.2.2...v2.0.0) (2021-06-04)

### Bug Fixes

* [#138]: Fix an issue with tooltip alignment in newer versions of Chrome

### Dependencies

* **Breaking**: Upgrade to using D3 v6 (changes `events.click.block(d)` to `events.click.block(event, d)`)

## [v1.2.2](https://github.com/jakezatecky/d3-funnel/compare/v1.2.1...v1.2.2) (2019-01-26)

### Performance

* [#97]: Significantly reduce package size to around 27% of its original size

## [v1.2.1](https://github.com/jakezatecky/d3-funnel/compare/v1.2.0...v1.2.1) (2018-10-13)

### Build Process

* [#93]: Fix issue where `dist/d3-funnel.js` was being minified alongside `dist/d3-funnel.min.js`

## [v1.2.0](https://github.com/jakezatecky/d3-funnel/compare/v1.1.1...v1.2.0) (2018-06-25)

### Dependencies

* [#87]: Add official support for D3 v5 (while continuing support for D3 v4)

### Bug Fixes

* [#86]: Fix issue where heights were being calculated incorrectly when the sum of values was zero

## [v1.1.1](https://github.com/jakezatecky/d3-funnel/compare/v1.1.0...v1.1.1) (2017-07-31)

This is a patch for the npm release, which was shipped without the updated `/dist` directory.

## [v1.1.0](https://github.com/jakezatecky/d3-funnel/compare/v1.0.1...v1.1.0) (2017-07-31)

Release **v1.1.0** adds a variety of new functionality to the funnel, and introduces a new data structure that allows for more flexibility on a row level than previously capable:

``` javascript
funnel.draw([{
    label: 'Prospects',
    value: 5000,
    backgroundColor: '#d33',
}]);
```

The old structure of an array-of-arrays has been deprecated and will be removed in the **v2.0** release. Please update to the newest data structure as soon as possible. Refer to the README for the list of available options, which includes all of the capabilities previously held in the data array.

### Deprecations

* [#73]: The old array-of-arrays data structure has been deprecated in favor of a data objects

### New Features

* [#45]: Add support for tooltips via `tooltip.enabled` and `tooltip.format`
* [#71]: Add `hideLabel` option to the data object
* [#74]: Add `label.enabled` chart option
* [#79]: Add support for `HTMLElement` in the D3Funnel constructor

### Bug Fixes

* [#77]: Fix an issue where containers with zero width and/or height would not inherit from the default dimensions

## [v1.0.1](https://github.com/jakezatecky/d3-funnel/compare/v1.0.0...v1.0.1) (2017-01-30)

### Bug Fixes

* [#67]: Add missing `cursor: pointer` style to blocks when clickable
* [#70]: Fix NaN and Infinity values in block paths when height is zero and `dynamicHeight: true`

## [v1.0.0](https://github.com/jakezatecky/d3-funnel/compare/v0.8.0...v1.0.0) (2016-08-02)

This release breaks major backwards compatibility by upgrading D3 3.x to
D3 4.x. Refer to D3's [changes documentation](d3-changes) for more info.

### Behavior Changes

* [#62]: Upgrade D3 3.x to 4.x

[d3-changes]: https://github.com/d3/d3/blob/master/CHANGES.md

## [v0.8.0](https://github.com/jakezatecky/d3-funnel/compare/v0.7.7...v0.8.0) (2016-07-21)

### New Features

* [#19]: Add support for percentages in `chart.width` and `chart.height` (e.g. `'75%'`)
* [#38]: Split line break characters found in `label.format` into multiple lines

### Bug Fixes

* [#49]: Fix issue where gradient definitions could conflict with existing definitions

## [v0.7.7](https://github.com/jakezatecky/d3-funnel/compare/v0.7.6...v0.7.7) (2016-07-15)

### New Features

* [#50]: Add `block.barOverlay` option to display bar charts proportional to block value
* [#52]: Add `chart.totalCount` option to override total counts used in ratio calculations

### Other

* Simplify and clean up examples

## [v0.7.6](https://github.com/jakezatecky/d3-funnel/compare/v0.7.5...v0.7.6) (2016-07-12)

### New Features

* [#53]: Add `label.fontSize` option
* [#57]: Add `block.dynamicSlope` option to make the funnel width proportional to its value

### Bug Fixes

* [#59]: Fix issue where formatted array values were not being passed to the label formatter

## [v0.7.5](https://github.com/jakezatecky/d3-funnel/compare/v0.7.4...v0.7.5) (2015-12-19)

### New Features

* [#44]: Pass DOM node to event data

## [v0.7.4](https://github.com/jakezatecky/d3-funnel/compare/v0.7.3...v0.7.4) (2015-12-11)

### Build Changes

* [#42]: Use ES6 imports and exports in source files
* [#43]: Require D3.js for CommonJS environments

## [v0.7.3](https://github.com/jakezatecky/d3-funnel/compare/v0.7.2...v0.7.3) (skipped)

D3Funnel v0.7.3 is an NPM-only hotfix that adds in missing compiled files.

## [v0.7.2](https://github.com/jakezatecky/d3-funnel/compare/v0.7.1...v0.7.2) (2015-11-18)

### Bug Fixes

* [#41]: Fix issue where `events.click.block` would error on `null`

## [v0.7.1](https://github.com/jakezatecky/d3-funnel/compare/v0.7.0...v0.7.1) (2015-10-28)

### Behavior Changes

* Errors thrown on data validation are now more descriptive and context-aware

### Bug Fixes

* [#35]: Fix issue where gradient background would not persist after mouse out
* [#36]: Fix issue where non-SVG entities were not being removed from container

## [v0.7.0](https://github.com/jakezatecky/d3-funnel/compare/v0.6.13...v0.7.0) (2015-10-04)

D3Funnel v0.7 is a **backwards-incompatible** release that resolves some
outstanding bugs, standardizes several option names and formats, and introduces
a few new features.

No new features will be added to the v0.6 series, but minor patches will be
available for a few months.

### Behavior Changes

* [#29]: Dynamic block heights are no longer determined by their weighted area, but by their weighted height
	* Heights determined by weighted area: http://jsfiddle.net/zq4L82kv/2/ (legacy v0.6.x)
	* Heights determined by weighted height: http://jsfiddle.net/bawv6m0j/3/ (v0.7+)

### New Features

* [#9]: Block can now have their color scale specified in addition to data points
* [#34]: Default options are now statically available and overridable

### Bug Fixes

* [#25]: Fix issues with `isInverted` and `dynamicArea` producing odd pyramids
* [#32]: Fix issue where pinched blocks were not having the same width as `bottomWidth`

### Upgrading from v0.6.x

Several options have been renamed for standardization. Please refer to the table
below for the new equivalent option:

| Old option     | New option            | Notes           |
| -------------- | --------------------- | --------------- |
| `animation`    | `chart.animate`       |                 |
| `bottomPinch`  | `chart.bottomPinch`   |                 |
| `bottomWidth`  | `chart.bottomWidth`   |                 |
| `curveHeight`  | `chart.curve.height`  |                 |
| `dynamicArea`  | `block.dynamicHeight` | See change #29. |
| `fillType`     | `block.fill.type`     |                 |
| `height`       | `chart.height`        |                 |
| `hoverEffects` | `block.hightlight`    |                 |
| `isCurved`     | `chart.curve.enabled` |                 |
| `isInverted`   | `chart.inverted`      |                 |
| `onItemClick`  | `events.click.block`  |                 |
| `minHeight`    | `block.minHeight`     |                 |
| `width`        | `chart.width`         |                 |

In addition, please refer to change #29.

## [v0.6.13](https://github.com/jakezatecky/d3-funnel/compare/v0.6.12...v0.6.13) (2015-10-02)

### Bug Fixes

* [#33]: Fix issue where `package.json` pointed to the incorrect main file

## [v0.6.12](https://github.com/jakezatecky/d3-funnel/compare/0.6.11...v0.6.12) (2015-09-25)

### New Features

* [#16]: Add support for formatted labels

### Bug Fixes

* [#26]: Fix issues with closed range intervals in `bottomWidth`
* [#28]: Fix issue where short hex colors did not translate properly in color manipulations
