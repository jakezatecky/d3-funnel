import { merge } from 'lodash';
import D3Funnel from 'd3-funnel';

const chart = new D3Funnel('#funnel');
const clickStatus = document.querySelector('#click-status');
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
            pinchedBlocks: 1,
        },
    },
    horizontal: {
        label: {
            overflow: 'ellipsis',
        },
    },
    gradient: {
        block: {
            fill: {
                type: 'gradient',
            },
        },
    },
    proportionalLength: {
        block: {
            proportionalLength: true,
        },
    },
    gap: {
        chart: {
            curve: {
                depth: 10,
            },
        },
        block: {
            gap: 2,
        },
    },
    barOverlay: {
        block: {
            barOverlay: {
                enabled: true,
            },
        },
    },
    animation: {
        chart: {
            animation: {
                duration: 200,
            },
        },
    },
    hover: {
        block: {
            highlight: {
                enabled: true,
            },
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
                    clickStatus.textContent = `Clicked: ${d.label.raw}`;

                    // Flash the status so that repeated clicks on the same block are noticeable.
                    // Unlike toggling a CSS class, `animate()` restarts the flash on rapid repeat
                    // clicks.
                    clickStatus.animate(
                        [{ backgroundColor: '#fff3b0' }, { backgroundColor: 'transparent' }],
                        { duration: 600 },
                    );
                },
            },
        },
    },
    accessibleColors: {
        block: {
            fill: {
                // A palette where every color has at least a 4.5:1 contrast with white labels
                colors: [
                    '#2e78be',
                    '#a63c0c',
                    '#32844a',
                    '#7f387a',
                    '#a76616',
                    '#564597',
                    '#07837e',
                    '#a6344f',
                    '#727a23',
                    '#2e5263',
                ],
            },
        },
    },
    styleLabels: {
        label: {
            fontFamily: '"Reem Kufi", sans-serif',
            fontSize: '16px',
        },
    },
};

const checkboxes = [...document.querySelectorAll('input')];
const horizontal = document.querySelector('[value="horizontal"]');
const reverse = document.querySelector('[value="reverse"]');
const blockLevelColors = document.querySelector('[value="blockLevelColors"]');
const click = document.querySelector('[value="click"]');
const funnel = document.querySelector('#funnel');

function onChange() {
    // Combine the two direction checkboxes into one of the four directions
    let direction = horizontal.checked ? 'right' : 'down';

    if (reverse.checked) {
        direction = horizontal.checked ? 'left' : 'up';
    }

    const data = !blockLevelColors.checked ?
        [
            { label: 'Applicants', value: 12000 },
            { label: 'Pre-screened', value: 4000 },
            { label: 'Interviewed', value: 2500 },
            { label: 'Hired', value: 1500 },
        ] :
        [
            { label: 'Teal', value: 12000, fillColor: '#008080' },
            { label: 'Byzantium', value: 4000, fillColor: '#702963' },
            { label: 'Persimmon', value: 2500, fillColor: '#ff634d' },
            { label: 'Azure', value: 1500, fillColor: '#007fff' },
        ];

    let options = {
        chart: {
            direction,
        },
        block: {
            minLength: 40,
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

    // Horizontal funnels need a wider, shorter container, which the chart sizes itself to
    funnel.classList.toggle('demo-funnel-horizontal', horizontal.checked);

    clickStatus.hidden = !click.checked;
    chart.draw(data, options);
}

// Bind event listeners
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', onChange);
});
// Trigger change event for initial render
checkboxes[0].dispatchEvent(new CustomEvent('change'));
