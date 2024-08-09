const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001; // Ensure this matches the port you're using

// Configure CORS to allow requests from your frontend's origin
app.use(cors({
    origin: 'http://localhost:3000' // Allow only this origin
}));

// Set up body parser with a larger limit to handle large HTML content
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Route to generate PDF from provided HTML content
app.post('/generate-pdf', async (req, res) => {
    const { html } = req.body;

    // Check if HTML content is provided in the request
    if (!html) {
        return res.status(400).send('HTML content is required');
    }

    try {
        // Launch Puppeteer browser instance
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the HTML content of the page and wait until all network requests are finished
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Scroll to the end of the page to load all dynamic content
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                const scrollStep = 100; // Define how much to scroll each step
                const scrollInterval = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, scrollStep);

                    // Stop scrolling when the bottom is reached
                    if (window.scrollY + window.innerHeight >= scrollHeight) {
                        clearInterval(scrollInterval);
                        resolve();
                    }
                }, 100); // Define delay between scroll steps
            });
        });

        // Inject CSS for page breaks and other styling
        await page.addStyleTag({
            content: `
               @media print {
                   h1, h2, h3, h4, h5, h6 {
                       page-break-after: avoid;
                   }
                   p, div {
                       page-break-inside: avoid;
                   }
                   .page-break-before {
                       page-break-before: always;
                   }
                   .page-break-after {
                       page-break-after: always;
                   }
                   .page-break-inside-avoid {
                       page-break-inside: avoid;
                   }
               }
           `
        });

        // Get the HTML content after processing by Puppeteer
        const finalHtml = await page.content();

        // Save the processed HTML to a file
        const outputPath = path.join(__dirname, 'output.html');
        fs.writeFileSync(outputPath, finalHtml, 'utf8');

        console.log(`Processed HTML saved to ${outputPath}`);

        // Generate PDF from the loaded page
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        // Close the browser instance
        await browser.close();

        // Set response headers and send the PDF buffer as a response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
