# AI Resume Analyzer - Vercel Deployment Guide

This project has been converted to use Vercel serverless functions instead of a traditional Express.js backend.

## 🚀 Quick Deploy to Vercel

1. **Fork or Clone this repository**

2. **Sign up for Vercel** at [vercel.com](https://vercel.com)

3. **Get your Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for the next step

4. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add the environment variable:
     - `GEMINI_API_KEY` = your_actual_api_key_here
   - Deploy!

## 🛠 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env.local` file:**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Test the API endpoints:**
   - Resume analysis: `POST /api/analyze-resume`
   - PDF generation: `POST /api/generate-pdf`

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── analyze-resume.js   # Resume analysis endpoint
│   └── generate-pdf.js     # PDF generation endpoint
├── src/                    # Frontend React app
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## 🔧 API Endpoints

### POST /api/analyze-resume
Analyzes uploaded resume files (PDF or DOCX) using Google's Gemini AI.

**Request:**
- `file`: Resume file (PDF or DOCX)
- `jobDescription`: Optional job description for targeted analysis

**Response:**
```json
{
  "success": true,
  "feedbackId": "timestamp_id",
  "analysis": {
    "overallScore": 85,
    "summary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "suggestions": [...],
    "keywordMatch": {...},
    "sectionAnalysis": {...}
  }
}
```

### POST /api/generate-pdf
Generates a PDF report from analysis data.

**Request:**
```json
{
  "analysis": { /* analysis object */ },
  "resumeData": { /* optional metadata */ }
}
```

**Response:** PDF file download

## 🌟 Features

- ✅ **Serverless Architecture**: No backend server management
- ✅ **AI-Powered Analysis**: Uses Google Gemini AI
- ✅ **File Support**: PDF and DOCX resume uploads
- ✅ **PDF Reports**: Beautiful formatted feedback reports
- ✅ **Modern UI**: Built with React and Tailwind CSS
- ✅ **Responsive Design**: Works on all devices
- ✅ **Zero Configuration**: Deploy with one click

## 🔒 Security & Privacy

- Files are processed temporarily and not stored permanently
- All processing happens on Vercel's secure infrastructure
- API keys are stored securely in Vercel environment variables

## 📝 Environment Variables

Required environment variables for deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |

## 🚨 Important Notes

1. **File Size Limits**: Vercel has a 5MB limit for serverless function payloads
2. **Execution Time**: Functions timeout after 10 seconds on free tier
3. **API Costs**: Monitor your Gemini API usage to avoid unexpected charges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
