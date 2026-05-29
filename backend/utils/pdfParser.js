// import pdf from 'pdf-parse';

// const extractTextFromPDF = async (pdfBuffer) => {
//   try {
//     const data = await pdf(pdfBuffer);
//     return data.text;
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     throw new Error('Failed to extract text from PDF');
//   }
// };

// export { extractTextFromPDF };


// ❌ Remove this top-level import
// import pdf from 'pdf-parse';

const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const { default: pdf } = await import('pdf-parse'); // ✅ lazy import
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export { extractTextFromPDF };