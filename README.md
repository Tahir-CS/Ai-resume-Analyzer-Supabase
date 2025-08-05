# 🚀 AI Resume Analyzer

A powerful AI-driven resume analysis tool that provides comprehensive feedback using Google's Gemini AI. Built with React, Tailwind CSS, and deployed on Vercel.

![AI Resume Analyzer](https://img.shields.io/badge/AI-Powered-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Google Gemini AI evaluation
- 📄 **Multi-Format Support** - PDF and DOCX uploads
- 📊 **Detailed Scoring** - Section-by-section analysis
- 💡 **Smart Suggestions** - Actionable recommendations
- 🔍 **Keyword Analysis** - Job description matching
- 📑 **PDF Reports** - Downloadable feedback reports
- ⚡ **Serverless** - Fast Vercel deployment

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-resume-analyzer&env=GEMINI_API_KEY)

1. Click deploy button above
2. Get [Gemini API Key](https://makersuite.google.com/app/apikey)
3. Add `GEMINI_API_KEY` environment variable
4. Deploy! 🎉

## 🛠 Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer
npm install

# Setup environment
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development
npm run dev
```

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── analyze-resume.js   # Resume analysis endpoint
│   └── generate-pdf.js     # PDF generation endpoint
├── src/                    # React frontend
└── vercel.json            # Vercel configuration
```

## 🔧 API Endpoints

### POST `/api/analyze-resume`
- **Input**: Resume file (PDF/DOCX)
- **Output**: AI analysis with scoring and suggestions

### POST `/api/generate-pdf`
- **Input**: Analysis data
- **Output**: Downloadable PDF report

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini AI
- **UI**: shadcn/ui components

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI analysis
- [Vercel](https://vercel.com/) for hosting
- [shadcn/ui](https://ui.shadcn.com/) for UI components

---

**⭐ Star this repository if you found it helpful!**
