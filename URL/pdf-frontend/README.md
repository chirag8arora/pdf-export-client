# PDF Generator with Puppeteer and React

This project demonstrates how to generate a PDF from a given URL using a Node.js backend with Puppeteer and a React frontend.

## Prerequisites
- Node.js and npm installed on your machine

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/chirag8arora/pdf-export-client.git
```

```bash
cd URL
```
#### Step Up Backend

Install Backend Dependencies

```bash
npm install puppeteer express cors
```

Start the Backend Server

```bash
node serverURL.js
```

Your backend server will be running on http://localhost:3001.

#### Set Up and Start the React Frontend. Open another terminal and navigate to the pdf-frontend folder:

```bash
cd pdf-frontend
```


Install the frontend dependencies:

```bash
npm install
npm install axios
```

Start the React development server:

```bash
npm start
```

Your React application will be running on http://localhost:3000.


Click the "Generate PDF" button to download a PDF of the specified URL.