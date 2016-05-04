## v0.7.6 (TBA)

### New Features

* [#23]: Add ability to change chart orientation from vertical to horizontal
* [#53]: Add `label.fontSize` option

## v0.7.5 (December 19, 2015)

### New Features

* [#44]: Pass DOM node to event data

## v0.7.4 (December 11, 2015)

### Build Changes

* [#42]: Use ES6 imports and exports in source files
* [#43]: Require D3.js for CommonJS environments

## v0.7.3 (skipped)

D3Funnel v0.7.3 is an NPM-only hotfix that adds in missing compiled files.

## v0.7.2 (November 18, 2015)

### Bug Fixes

* [#41]: Fix issue where `events.click.block` would error on `null`

## v0.7.1 (October 28, 2015)

### Behavior Changes

* Errors thrown on data validation are now more descriptive and context-aware

### Bug Fixes

* [#35]: Fix issue where gradient background would not persist after mouse out
* [#36]: Fix issue where non-SVG entities were not being removed from container

## v0.7.0 (October 4, 2015)

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

## v0.6.13 (October 2, 2015)

### Bug Fixes

* [#33]: Fix issue where `package.json` pointed to the incorrect main file

## v0.6.12 (September 25, 2015)

### New Features

* [#16]: Add support for formatted labels

### Bug Fixes

* [#26]: Fix issues with closed range intervals in `bottomWidth`
* [#28]: Fix issue where short hex colors did not translate properly in color manipulations
