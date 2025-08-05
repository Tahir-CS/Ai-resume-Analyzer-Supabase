import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Import the analyze function from Vercel API
import analyzeResume from './analyze-resume.js';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Local resume analyzer server is running',
    timestamp: new Date().toISOString(),
    env: {
      gemini_key: !!process.env.GEMINI_API_KEY,
      supabase_url: !!process.env.VITE_SUPABASE_URL,
      supabase_key: !!process.env.VITE_SUPABASE_ANON_KEY
    }
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Debug endpoint working',
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
});

// Resume analysis endpoint
app.post('/api/analyze-resume', upload.single('file'), async (req, res) => {
  try {
    // Create a mock request object similar to Vercel's format
    const mockReq = {
      method: 'POST',
      headers: req.headers,
      body: req.file ? {
        file: [{
          filepath: req.file.path,
          originalFilename: req.file.originalname,
          mimetype: req.file.mimetype
        }]
      } : {}
    };

    // Create a mock response object
    const mockRes = {
      headers: {},
      statusCode: 200,
      setHeader: (key, value) => {
        mockRes.headers[key] = value;
      },
      status: (code) => {
        mockRes.statusCode = code;
        return mockRes;
      },
      json: (data) => {
        res.status(mockRes.statusCode).json(data);
      }
    };

    // Call the Vercel analyze function
    await analyzeResume(mockReq, mockRes);

  } catch (error) {
    console.error('Error in local analyze-resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local resume analyzer server running on http://localhost:${PORT}`);
  console.log(`📊 Debug endpoint: http://localhost:${PORT}/api/debug`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Analyze endpoint: http://localhost:${PORT}/api/analyze-resume`);
});
