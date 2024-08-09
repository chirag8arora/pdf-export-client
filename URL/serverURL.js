

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();
const port = 3002;


app.use(cors());
app.use(express.json());


app.post('/generate-pdf', async (req, res) => {
   const { url } = req.body;


   if (!url) {
       return res.status(400).send('URL is required');
   }


   try {
       const browser = await puppeteer.launch();
       const page = await browser.newPage();
       await page.goto(url, { waitUntil: 'networkidle2' });
       const pdf = await page.pdf({ format: 'A4' });
       await browser.close();


       res.contentType('application/pdf');
       res.send(pdf);
   } catch (error) {
       console.error(error);
       res.status(500).send('Error generating PDF');
   }
});


app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
