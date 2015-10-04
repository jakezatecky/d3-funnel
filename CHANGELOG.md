## v0.7.0 (TBA)

D3Funnel v0.7 is a **backwards-incompatible** release that resolves several
outstanding bugs, standardizing several option names and formats, and introduces
a few new features.

No new features will be added to the v0.6 series, but minor patches will be
available for a few months.

### Major Changes

* [#29]: Dynamic block heights are no longer determined by their weighted area, but by their weighted height
	* Heights determined by weighted area: http://jsfiddle.net/zq4L82kv/2/ (legacy v0.6.12)
	* Heights determined by weighted height: (v0.7+)

### New Features

### Bug Fixes

* [#25]: Fix issues with `isInverted` and `dynamicArea` producing odd pyramids
* [#32]: Fix issue where pinched blocks were not having the same width as `bottomWidth`

### Upgrading from v0.6.12

Several options have been renamed for standardization. Please refer to the table
below for the new equivalent option:

| Old option    | New option            | Notes           |
| ------------- | --------------------- | --------------- |
| `width`       | `chart.width`         |                 |
| `height`      | `chart.height`        |                 |
| `bottomWidth` | `chart.bottomWidth`   |                 |
| `bottomPinch` | `chart.bottomPinch`   |                 |
| `isInverted`  | `chart.inverted`      |                 |
| `dynamicArea` | `block.dynamicHeight` | See change #29. |
| `fillType`    | `block.fill.type`     |                 |
| `minHeight`   | `block.minHeight`     |                 |
| `onItemClick` | `events.click.block`  |                 |

## v0.6.12 (September 25, 2015)

### New Features

* [#16]: Add support for formatted labels

### Bug Fixes

* [#26]: Fix issues with closed range intervals in `bottomWidth`
* [#28]: Fix issue where short hex colors did not translate properly in color manipulations
