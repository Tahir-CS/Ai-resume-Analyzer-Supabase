import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// CORS headers for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

// Initialize Supabase (only if credentials are provided)
let supabase = null;
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
}

// Simple in-memory rate limiting (resets on server restart)
const uploadTracker = new Map();

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const dataBuffer = readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Build analysis prompt
function buildAnalysisPrompt(resumeText, jobDescription) {
  return `
You are an expert HR professional and career advisor. Analyze the following resume against the provided job description and provide comprehensive feedback.

**Resume Content:**
${resumeText}

**Job Description:**
${jobDescription || 'General analysis (no specific job description provided)'}

Please provide a detailed analysis in the following JSON format:

{
  "overallScore": number (0-100),
  "summary": "Brief overall assessment",
  "strengths": [
    "List of candidate's strong points"
  ],
  "weaknesses": [
    "Areas that need improvement"
  ],
  "suggestions": [
    "Specific actionable recommendations"
  ],
  "keywordMatch": {
    "matchedKeywords": ["keywords found in resume"],
    "missingKeywords": ["important keywords missing from resume"],
    "matchPercentage": number (0-100)
  },
  "sectionAnalysis": {
    "professionalSummary": {
      "score": number (0-100),
      "feedback": "Detailed feedback on professional summary"
    },
    "experience": {
      "score": number (0-100),
      "feedback": "Detailed feedback on work experience"
    },
    "education": {
      "score": number (0-100),
      "feedback": "Detailed feedback on education"
    },
    "skills": {
      "score": number (0-100),
      "feedback": "Detailed feedback on skills section"
    }
  },
  "improvementPriority": [
    {
      "area": "Area to improve",
      "impact": "High/Medium/Low",
      "suggestion": "Specific improvement suggestion"
    }
  ]
}

Ensure the response is valid JSON only, with no additional text or formatting.
`;
}

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please contact support.',
        error: 'MISSING_API_KEY'
      });
    }

    console.log('Starting resume analysis...');
    console.log('Gemini API Key available:', !!process.env.GEMINI_API_KEY);
    // Get user IP for rate limiting
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Check rate limit (1 upload per hour per IP)
    if (uploadTracker.has(userIP)) {
      const lastUpload = uploadTracker.get(userIP);
      if (now - lastUpload < oneHour) {
        const waitTime = Math.ceil((oneHour - (now - lastUpload)) / 60000); // minutes
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. Please wait ${waitTime} minutes before uploading another resume.`,
          error: 'RATE_LIMIT_EXCEEDED'
        });
      }
    }

    // Update rate limit tracker
    uploadTracker.set(userIP, now);

    // Clean up old entries (older than 1 hour)
    for (const [ip, timestamp] of uploadTracker.entries()) {
      if (now - timestamp > oneHour) {
        uploadTracker.delete(ip);
      }
    }
    // Parse form data
    const form = formidable({
      uploadDir: tmpdir(),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    const jobDescription = fields.jobDescription?.[0] || '';

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract text based on file type
    let resumeText;
    if (file.mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(file.filepath);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      resumeText = await extractTextFromDOCX(file.filepath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload PDF or DOCX files only.'
      });
    }

    // Build and send prompt to Gemini
    const prompt = buildAnalysisPrompt(resumeText, jobDescription);
    
    let analysis;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let raw = response.text().trim();
      
      // Clean up JSON response
      if (raw.startsWith('```json')) {
        raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      analysis = JSON.parse(raw);
    } catch (aiError) {
      console.error('Gemini API Error:', aiError);
      
      // Check if it's a quota/limit error
      if (aiError.message?.includes('quota') || 
          aiError.message?.includes('limit') || 
          aiError.message?.includes('exceeded') ||
          aiError.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Gemini API quota exceeded. Please try again later.',
          error: 'GEMINI_QUOTA_EXCEEDED'
        });
      }
      
      // Try to repair JSON if it's a parsing error
      try {
        const { jsonrepair } = await import('jsonrepair');
        const repairedRaw = await result.response.text().trim();
        analysis = JSON.parse(jsonrepair(repairedRaw));
      } catch (repairErr) {
        // If all AI attempts fail, return a fallback response
        return res.status(503).json({
          success: false,
          message: 'AI service is temporarily unavailable. Please try again later.',
          error: 'AI_SERVICE_UNAVAILABLE',
          fallback: {
            overallScore: null,
            summary: "AI analysis is currently unavailable. Please try uploading your resume again in a few minutes.",
            strengths: ["Resume uploaded successfully"],
            weaknesses: ["AI analysis temporarily unavailable"],
            suggestions: ["Please try again later when the AI service is restored"],
            keywordMatch: {
              matchedKeywords: [],
              missingKeywords: [],
              matchPercentage: 0
            }
          }
        });
      }
    }

    // Generate unique feedback ID
    const feedbackId = Date.now().toString();

    // Try to store in database if Supabase is available
    if (supabase) {
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('resume_analyses')
          .insert({
            id: feedbackId,
            user_ip: userIP,
            file_name: file.originalFilename || 'unknown',
            file_type: file.mimetype,
            analysis_result: analysis,
            job_description: jobDescription,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.warn('Failed to store analysis in database:', insertError);
          // Continue without database storage
        } else {
          console.log('Analysis stored in database successfully');
        }
      } catch (dbError) {
        console.warn('Database operation failed:', dbError);
        // Continue without database storage
      }
    }

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(200).json({
      success: true,
      feedbackId,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
}
