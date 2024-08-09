import React from 'react';
import axios from 'axios';

const GeneratePDFButton = () => {
    // Function to download the generated HTML file (optional)
    const download = (filename, content) => {
        console.log('Downloading HTML file:', filename);
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Function to scroll the page to ensure all dynamic content is loaded
    const scrollPage = () => {
        console.log('Scrolling page to load dynamic content...');
        return new Promise((resolve) => {
            let currentPosition = 0;
            const scrollStep = 100; // Define how much to scroll each step
            const scrollDelay = 100; // Define delay between scroll steps

            const scrollInterval = setInterval(() => {
                if (currentPosition >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(scrollInterval);
                    resolve();
                } else {
                    currentPosition += scrollStep;
                    window.scrollTo(0, currentPosition);
                }
            }, scrollDelay);
        });
    };

    // Function to extract HTML and CSS from the page
    const extractHTMLAndCSS = async () => {
        console.log('Extracting HTML and CSS...');
        // Wait for the page to fully load
        await new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        // Scroll the page to load all dynamic content
        await scrollPage();

        // Wait additional time to ensure all content is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Function to get computed styles of an element
        const getComputedStyles = (element) => {
            const computedStyle = window.getComputedStyle(element);
            let style = "";
            for (let i = 0; i < computedStyle.length; i++) {
                const key = computedStyle[i];
                style += `${key}: ${computedStyle.getPropertyValue(key)}; `;
            }
            return style;
        };

        // Function to apply computed styles inline to an element
        const applyInlineStyles = (element) => {
            if (element && element.style) {
                element.style.cssText = getComputedStyles(element);
            }
            for (const child of element.children) {
                applyInlineStyles(child);
            }
        };

        // Function to extract CSS rules from stylesheets
        const extractCSSRules = () => {
            let css = '';
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        css += rule.cssText + '\n';
                    }
                } catch (e) {
                    console.warn('Access to stylesheet is restricted:', e);
                }
            }
            return css;
        };

        // Function to convert images to Base64 data URLs
        const convertImagesToBase64 = async (element) => {
            console.log('Converting images to Base64...');
            const images = element.querySelectorAll('img');
            for (const img of images) {
                const currentSrc = img.getAttribute('src');
                if (currentSrc) {
                    try {
                        const response = await fetch(currentSrc);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result; // Set image src to Base64 string
                        };
                        reader.readAsDataURL(blob);
                    } catch (error) {
                        console.error('Error converting image to Base64', error);
                    }
                }
            }
        };

        // Clone the body element to avoid messing up the current page's styles
        const originalBodyContent = document.body;

        // Add page breaks after each .home-section div
        const homeSections = originalBodyContent.querySelectorAll('.home-section');
        homeSections.forEach((section) => {
            // Get the direct children of the .home-section div
            const directChildren = Array.from(section.children);

            directChildren.forEach((child) => {
                // Create a new div for the page break
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break-after';

                // Insert the page break after the current direct child
                child.parentNode.insertBefore(pageBreak, child.nextSibling);
            });
        });

        const bodyContent = originalBodyContent.cloneNode(true);
        // Apply computed styles inline to all elements in the body
        applyInlineStyles(bodyContent);

        // Convert images to Base64
        await convertImagesToBase64(bodyContent);

        // Get the outer HTML of the cloned body
        const bodyContentHtml = bodyContent.outerHTML;

        // Extract CSS rules from stylesheets
        const extractedCSS = extractCSSRules();

        // Get all meta tags from the head
        const metaTags = Array.from(document.querySelectorAll('head meta'))
            .map(meta => meta.outerHTML)
            .join('\n');

        // Get all external stylesheet links
        const externalStylesheets = Array.from(document.querySelectorAll('head link[rel="stylesheet"]'))
            .map(link => link.outerHTML)
            .join('\n');

        // Get all external script tags
        const externalScripts = Array.from(document.querySelectorAll('script[src]'))
            .map(script => script.outerHTML)
            .join('\n');

        // Create the new HTML content
        const newHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Extracted Content</title>
   ${metaTags}
   ${externalStylesheets}
   <style>
       ${extractedCSS}
   </style>
</head>
<body>
   ${bodyContentHtml}
   ${externalScripts}
</body>
</html>`;

        // Optional: Download the new HTML file
        download('extracted_page_content.html', newHtmlContent);

        console.log('HTML and CSS extraction completed');
        return newHtmlContent;
    };

    // Function to generate PDF from extracted HTML and CSS
    const handleGeneratePDF = async () => {
        try {
            console.log('Starting PDF generation...');
            // Extract HTML and CSS from the current page
            const htmlContent = await extractHTMLAndCSS();

            // Send the extracted content to the backend to generate the PDF
            const response = await axios.post('http://localhost:3001/generate-pdf', { html: htmlContent }, { responseType: 'blob' });

            // Create a Blob from the PDF response
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

            // Create a download link for the generated PDF
            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.setAttribute('download', 'generated.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();

            console.log('PDF generation completed successfully');
        } catch (error) {
            console.error('Error generating PDF', error);
        }
    };

    // Return a button that triggers the PDF generation process when clicked
    return (
        <p onClick={handleGeneratePDF}>Generate PDF</p>
    );
};

export default GeneratePDFButton;
