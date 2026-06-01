const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF DETAILED:', error.message, error.stack);
    throw new Error('Failed to extract text from PDF');
  }
};

export { extractTextFromPDF };