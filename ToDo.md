# To-Do List

A list of ideas to add to the D3Funnel.

* Add the following configuration options:
	* `width`: The chart's initial width.
	* `height`: The chart's total height.
	* `bottomWidth`: The width of the bottom of the chart.
	* `bottomPinch`: How many sections at the bottom to be "pinched" to the `bottomWidth`.
	* `isCurved`: Whether or not the chart should appear curved.
		* `curveHeight`: How "curvy" the chart should be. Only valid when `isCurved` set.
	* `fillType`: Whether the background of the sections should be solid or gradient. Possibly should also allow custom
	  colors or gradient definitions for each section to be set as part of the data initialization.
	* `isPyramid`: Whether to invert the funnel chart to be a pyramid (or a flask in case of pinch!).

# Goals

* Fully cross platform for latest two major browser revisions.
* jQuery independent.
* JSHint compliant.
* Unit testable (later).
