$(function() {
	$('input').change(function() {
		var data = [];

		if ($('[value="color"]').is(':not(:checked)')) {
			data = [
				['Applicants',   12000],
				['Pre-screened', 4000],
				['Interviewed',  2500],
				['Hired',        1500],
			];
		} else {
			data = [
				['Teal',      12000, '#008080'],
				['Byzantium', 4000,  '#702963'],
				['Persimmon', 2500,  '#ff634d'],
				['Azure',     1500,  '#007fff'],
			];
		}

		var options = {};
		var settings = {
			curved: {
				chart: {
					enabled: true,
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
						block: function(d, i) {
							alert('<' + d.label.raw + '> selected.');
						},
					},
				},
			},
			dynamic: {
				block: {
					dynamicHeight: true,
				},
			},
			animation: {
				chart: {
					animate: 200,
				},
			},
			label: {
				label: {
					fontSize: '15px',
					fill: '#ffeb81',
				},
			},
		};

		$('input[type="checkbox"]:checked').each(function() {
			options = $.extend(options, settings[$(this).val()]);
		});

		// Inversion with pinch looks bad
		// Change bottom width to make it look slightly better
		if (options.isInverted && options.bottomPinch) {
			options.bottomWidth = 1 / 2;
		}

		(new D3Funnel('#funnel')).draw(data, options);
	}).trigger('change');
});
