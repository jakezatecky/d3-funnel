$(function() {
	$('#picker').change(function() {
		var index = $(this).val();

		var data = {
			normal: [
				['Applicants',   12000],
				['Pre-screened', 4000],
				['Interviewed',  2500],
				['Hired',        1500],
			],
			minHeight: [
				['Applicants',   12000],
				['Pre-screened', 4000],
				['Interviewed',  2500],
				['Hired',        100],
			],
			color:  [
				['Teal',      12000, '#008080'],
				['Byzantium', 4000,  '#702963'],
				['Persimmon', 2500,  '#ff634d'],
				['Azure',     1500,  '#007fff'],
			],
			labelsColor: [
				['Teal',      12000, '#008080', '#00cdcd'],
				['Byzantium', 4000,  '#702963', '#c86cb8'],
				['Persimmon', 2500,  '#ff634d', '#b31600'],
				['Azure',     1500,  '#007fff', '#003367'],
			],
		};

		var options = {
			basic: [data.normal, {}],
			formatted: [
				data.normal, {
					label: {
						format: '{l}: ${f}',
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
			dynamic: [
				data.normal, {
					chart: {
						bottomWidth: 1 / 3,
					},
					block: {
						dynamicHeight: true,
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
							block: function(d) {
								alert('<' + d.label.raw + '> selected.');
							},
						},
					},
				},
			],
			label: [
				data.normal, {
					label: {
						fontSize: '16px',
						fill: '#000',
					},
				},
			],
			color: [data.color, {}],
			labelsColor: [data.labelsColor, {}],
			works: [
				data.normal, {
					chart: {
						bottomPinch: 2,
						bottomWidth: 1 / 2,
						animate: 200,
						curve: {
							enabled: true,
						},
					},
					block : {
						dynamicHeight: true,
						fill: {
							type: 'gradient',
						},
						highlight: true,
					},
					events: {
						click: {
							block: function(d) {
								alert('<' + d.label.raw + '> selected.');
							},
						},
					},
				},
			],
		};

		var chart = new D3Funnel('#funnel');

		// Reverse the dataset if the isInverted option is present
		if (options[index][1].hasOwnProperty('isInverted')) {
			chart.draw(options[index][0].reverse(), options[index][1]);
			// Otherwise, just use the regular data
		} else {
			chart.draw(options[index][0], options[index][1]);
		}
	}).trigger('change');
});
