// import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export const extractTextFromPDF = async (filePath) => {
  // PDF extraction disabled for now
  return '';
  /*
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
  */
};

export const extractTextFromDOCX = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};
