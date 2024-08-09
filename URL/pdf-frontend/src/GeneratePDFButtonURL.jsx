import React from 'react';
import axios from 'axios';


const GeneratePDFButtonURL = () => {
   const handleGeneratePDF = async () => {
       try {
           const response = await axios.post('http://localhost:3002/generate-pdf', { url: 'https://alkaison.github.io/Health-Plus//' }, { responseType: 'blob' });
           const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
           const pdfUrl = window.URL.createObjectURL(pdfBlob);
           const link = document.createElement('a');
           link.href = pdfUrl;
           link.setAttribute('download', 'generated.pdf');
           document.body.appendChild(link);
           link.click();
           link.remove();
       } catch (error) {
           console.error('Error generating PDF', error);
       }
   };


   return (
       <button onClick={handleGeneratePDF}>Generate PDF </button>
   );
};

export default GeneratePDFButtonURL;