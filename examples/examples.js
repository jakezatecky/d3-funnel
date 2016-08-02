/* global D3Funnel */

const data = {
	normal: [
		['Applicants', 12000],
		['Pre-screened', 4000],
		['Interviewed', 2500],
		['Hired', 1500],
	],
	dynamicSlope: [
		['Applicants', 10],
		['Pre-screened', 8],
		['Interviewed', 6],
		['Hired', 2],
	],
	minHeight: [
		['Applicants', 12000],
		['Pre-screened', 4000],
		['Interviewed', 2500],
		['Hired', 100],
	],
	color: [
		['Teal', 12000, '#008080'],
		['Byzantium', 4000, '#702963'],
		['Persimmon', 2500, '#ff634d'],
		['Azure', 1500, '#007fff'],
	],
	labelsColor: [
		['Teal', 12000, '#008080', '#00cdcd'],
		['Byzantium', 4000, '#702963', '#c86cb8'],
		['Persimmon', 2500, '#ff634d', '#b31600'],
		['Azure', 1500, '#007fff', '#003367'],
	],
};
const options = {
	basic: [data.normal, {}],
	formatted: [
		data.normal, {
			label: {
				format: '{l}\n+{f}',
			},
		},
	],
	curved: [
		data.normal, {
			chart: {
				curve: {
					enabled: true,
				},
			},
		},
	],
	pinch: [
		data.normal, {
			chart: {
				bottomPinch: 1,
			},
		},
	],
	gradient: [
		data.normal, {
			block: {
				fill: {
					type: 'gradient',
				},
			},
		},
	],
	inverted: [
		data.normal, {
			chart: {
				inverted: true,
			},
		},
	],
	hover: [
		data.normal, {
			block: {
				highlight: true,
			},
		},
	],
	dynamicHeight: [
		data.normal, {
			chart: {
				bottomWidth: 1 / 3,
			},
			block: {
				dynamicHeight: true,
			},
		},
	],
	dynamicSlope: [
		data.dynamicSlope, {
			block: {
				dynamicSlope: true,
			},
		},
	],
	minHeight: [
		data.minHeight, {
			block: {
				dynamicHeight: true,
				minHeight: 20,
			},
		},
	],
	animation: [
		data.normal, {
			chart: {
				animate: 200,
			},
		},
	],
	clickEvent: [
		data.normal, {
			events: {
				click: {
					block: (d) => {
						alert(`<${d.label.raw}> selected.`);
					},
				},
			},
		},
	],
	label: [
		data.normal, {
			label: {
				fontFamily: 'Open Sans',
				fontSize: '16px',
				fill: '#000',
			},
		},
	],
	color: [data.color, {}],
	labelsColor: [data.labelsColor, {}],
	valueOverlay: [
		data.normal, {
			block: {
				barOverlay: true,
			},
		},
	],
	works: [
		data.normal, {
			chart: {
				bottomPinch: 2,
				bottomWidth: 1 / 2,
				animate: 200,
				curve: {
					enabled: false,
				},
			},
			block: {
				dynamicHeight: true,
				fill: {
					type: 'gradient',
				},
				highlight: true,
			},
			events: {
				click: {
					block: (d) => {
						alert(`<${d.label.raw}> selected.`);
					},
				},
			},
		},
	],
};

const chart = new D3Funnel('#funnel');
const picker = document.getElementById('picker');

picker.addEventListener('change', () => {
	const index = picker.value;

	// Reverse the dataset if the isInverted option is present
	// Otherwise, just use the regular data
	if ('isInverted' in options[index][1]) {
		chart.draw(options[index][0].reverse(), options[index][1]);
	} else {
		chart.draw(options[index][0], options[index][1]);
	}
});

// Trigger change event for initial render
picker.dispatchEvent(new CustomEvent('change'));
