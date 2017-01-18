(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["D3Funnel"] = factory();
	else
		root["D3Funnel"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/* global _, D3Funnel */

	var settings = {
		curved: {
			chart: {
				curve: {
					enabled: true
				}
			}
		},
		pinched: {
			chart: {
				bottomPinch: 1
			}
		},
		gradient: {
			block: {
				fill: {
					type: 'gradient'
				}
			}
		},
		inverted: {
			chart: {
				inverted: true
			}
		},
		hover: {
			block: {
				highlight: true
			}
		},
		click: {
			events: {
				click: {
					block: function block(d) {
						alert('<' + d.label.raw + ' selected.');
					}
				}
			}
		},
		dynamicHeight: {
			block: {
				dynamicHeight: true
			}
		},
		barOverlay: {
			block: {
				barOverlay: true
			}
		},
		animation: {
			chart: {
				animate: 200
			}
		},
		label: {
			label: {
				fontFamily: '"Reem Kufi", sans-serif',
				fontSize: '16px'
			}
		}
	};

	var chart = new D3Funnel('#funnel');
	var checkboxes = [].concat(_toConsumableArray(document.querySelectorAll('input')));
	var color = document.querySelector('[value="color"]');

	function onChange() {
		var data = [];

		if (color.checked === false) {
			data = [['Applicants', 12000], ['Pre-screened', 4000], ['Interviewed', 2500], ['Hired', 1500]];
		} else {
			data = [['Teal', 12000, '#008080'], ['Byzantium', 4000, '#702963'], ['Persimmon', 2500, '#ff634d'], ['Azure', 1500, '#007fff']];
		}

		var options = {
			chart: {
				bottomWidth: 3 / 8
			},
			block: {
				minHeight: 25
			},
			label: {
				format: '{l}\n{f}'
			}
		};

		checkboxes.forEach(function (checkbox) {
			if (checkbox.checked) {
				options = _.merge(options, settings[checkbox.value]);
			}
		});

		// Reverse data for inversion
		if (options.chart.inverted) {
			options.chart.bottomWidth = 1 / 3;
			data = data.reverse();
		}

		chart.draw(data, options);
	}

	// Bind event listeners
	checkboxes.forEach(function (checkbox) {
		checkbox.addEventListener('change', onChange);
	});

	// Trigger change event for initial render
	checkboxes[0].dispatchEvent(new CustomEvent('change'));

/***/ }
/******/ ])
});
;