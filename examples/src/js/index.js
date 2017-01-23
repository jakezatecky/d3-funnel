/* global _ */

import D3Funnel from '../../../src/index';

const settings = {
	curved: {
		chart: {
			curve: {
				enabled: true,
			},
		},
	},
	pinched: {
		chart: {
			bottomPinch: 1,
		},
	},
	gradient: {
		block: {
			fill: {
				type: 'gradient',
			},
		},
	},
	inverted: {
		chart: {
			inverted: true,
		},
	},
	hover: {
		block: {
			highlight: true,
		},
	},
	click: {
		events: {
			click: {
				block(d) {
					alert(`<${d.label.raw} selected.`);
				},
			},
		},
	},
	dynamicHeight: {
		block: {
			dynamicHeight: true,
		},
	},
	barOverlay: {
		block: {
			barOverlay: true,
		},
	},
	animation: {
		chart: {
			animate: 200,
		},
	},
	label: {
		label: {
			fontFamily: '"Reem Kufi", sans-serif',
			fontSize: '16px',
		},
	},
};

const chart = new D3Funnel('#funnel');
const checkboxes = [...document.querySelectorAll('input')];
const color = document.querySelector('[value="color"]');

function onChange() {
	let data = [];

	if (color.checked === false) {
		data = [
			['Applicants', 12000],
			['Pre-screened', 4000],
			['Interviewed', 2500],
			['Hired', 1500],
		];
	} else {
		data = [
			['Teal', 12000, '#008080'],
			['Byzantium', 4000, '#702963'],
			['Persimmon', 2500, '#ff634d'],
			['Azure', 1500, '#007fff'],
		];
	}

	let options = {
		chart: {
			bottomWidth: 3 / 8,
		},
		block: {
			minHeight: 25,
		},
		label: {
			format: '{l}\n{f}',
		},
	};

	checkboxes.forEach((checkbox) => {
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
checkboxes.forEach((checkbox) => {
	checkbox.addEventListener('change', onChange);
});

// Trigger change event for initial render
checkboxes[0].dispatchEvent(new CustomEvent('change'));
