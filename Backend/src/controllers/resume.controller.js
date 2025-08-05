import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromPDF, extractTextFromDOCX } from '../utils/fileExtractor.js';
import { buildAnalysisPrompt } from '../utils/promptBuilder.js';
import { generatePDFFeedback } from '../utils/pdfGenerator.js';
import dotenv from 'dotenv';
import { jsonrepair } from 'jsonrepair';
dotenv.config();

console.log('Gemini API Key:', process.env.GEMINI_API_KEY); // Debug print

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a free, widely available model (gemini-1.5-flash is typically free and fast)
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
// In-memory storage for feedback (replace with a database in production)
const feedbackStore = new Map();

export const analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jobDescription;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract text based on file type
    let resumeText;
    if (file.mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(file.path);
    } else {
      resumeText = await extractTextFromDOCX(file.path);
    }

    // Build and send prompt to Gemini
    const prompt = buildAnalysisPrompt(resumeText, jobDescription);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let raw = response.text().trim();
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch (err) {
      console.error('Error parsing resume JSON:', err.message);
      console.error('Problematic JSON:', raw);
      try {
        analysis = JSON.parse(jsonrepair(raw));
      } catch (err2) {
        console.error('Failed to repair and parse Gemini JSON:', raw);
        return res.status(400).json({ error: 'Invalid resume format.' });
      }
    }

    // Store feedback
    const feedbackId = Date.now().toString();
    feedbackStore.set(feedbackId, {
      analysis,
      resumeText,
      jobDescription,
      timestamp: new Date()
    });

    res.json({
      success: true,
      feedbackId,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = feedbackStore.get(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      feedback: feedback.analysis
    });

  } catch (error) {
    console.error('Error retrieving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback',
      error: error.message
    });
  }
};

export const downloadFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = feedbackStore.get(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const pdfBuffer = await generatePDFFeedback(feedback);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-feedback-${id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};
