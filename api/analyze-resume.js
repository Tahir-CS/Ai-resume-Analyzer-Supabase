import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { formidable } from 'formidable';
import fs from 'fs';

// Initialize the GoogleGenerativeAI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to extract text from a PDF buffer
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// Function to extract text from a DOCX buffer
async function extractTextFromDOCX(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return res.status(500).json({ success: false, message: 'Server configuration error: Missing API key.' });
  }

  try {
    const form = formidable({ 
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    if (!files.file || files.file.length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const file = files.file[0];
    const filePath = file.filepath;
    const mimeType = file.mimetype;

    console.log(`Processing file: ${file.originalFilename}, path: ${filePath}, mime: ${mimeType}`);

    const fileBuffer = fs.readFileSync(filePath);

    let extractedText = '';
    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(fileBuffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(fileBuffer);
    } else {
      console.warn(`Unsupported file type: ${mimeType}`);
      return res.status(400).json({ success: false, message: `Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.` });
    }

    if (!extractedText.trim()) {
        console.warn('Could not extract text from the resume.');
        return res.status(400).json({ success: false, message: 'Could not extract text from the resume. The file might be empty or corrupted.' });
    }

    console.log('Successfully extracted text from resume.');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze the following resume and provide a detailed analysis covering these sections: Summary, Contact Information, Skills, and Experience. The analysis should be in JSON format. Here is the resume text: \n\n${extractedText}`;

    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('Received response from Gemini AI.');

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const jsonResponse = JSON.parse(cleanedText);
        console.log('Successfully parsed Gemini response.');
        return res.status(200).json({ success: true, analysis: jsonResponse });
    } catch (jsonError) {
        console.error('Error parsing Gemini response as JSON:', jsonError);
        console.error('Raw response from Gemini:', cleanedText);
        return res.status(500).json({ success: false, message: 'Failed to parse the analysis from the AI service.', raw_response: cleanedText });
    }

  } catch (error) {
    console.error('Error in analyze-resume handler:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during resume analysis.', error: error.message });
  }
}
  