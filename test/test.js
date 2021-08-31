const path = require('path');
// Use Firefox because it has the most consumable console pass through
const { firefox } = require('playwright');

function outputStream(out, stream) {
    stream.forEach((message) => {
        const formatted = `${message}\n`;
        out.write(formatted);
    });
}

const stream = [];

(async () => {
    const browser = await firefox.launch();
    const page = await browser.newPage();
    let hasError = false;

    // Capture Mocha spec reporter messages
    page.on('console', (message) => {
        const type = message.type();
        const text = message.text();

        // Pass message as-is to output stream
        stream.push(text);

        // Identify failures
        if (type === 'error' || text.includes('failing')) {
            hasError = true;
        }
    });

    // Identity hard runtime errors
    page.on('pageerror', (error) => {
        outputStream(process.stderr, [error]);
        process.exit(1);
    });

    // Visit the page for any errors
    await page.goto(`file:${path.join(__dirname, 'index.html')}`, { waitUntil: 'networkidle' });
    await browser.close();

    // Output log stream;
    // If the exit is non-zero, all output must go to stderr to be seen in Gulp
    if (hasError) {
        outputStream(process.stderr, stream);
        process.exitCode = 1;
    } else {
        outputStream(process.stdout, stream);
    }
})();
