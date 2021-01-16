import { merge } from 'lodash';
import D3Funnel from 'd3-funnel';

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
    tooltip: {
        tooltip: {
            enabled: true,
        },
    },
    click: {
        events: {
            click: {
                block(event, d) {
                    alert(d.label.raw);
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
            { label: 'Applicants', value: 12000 },
            { label: 'Pre-screened', value: 4000 },
            { label: 'Interviewed', value: 2500 },
            { label: 'Hired', value: 1500 },
        ];
    } else {
        data = [
            { label: 'Teal', value: 12000, backgroundColor: '#008080' },
            { label: 'Byzantium', value: 4000, backgroundColor: '#702963' },
            { label: 'Persimmon', value: 2500, backgroundColor: '#ff634d' },
            { label: 'Azure', value: 1500, backgroundColor: '#007fff' },
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
            options = merge(options, settings[checkbox.value]);
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
