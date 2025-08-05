import { useState, useEffect } from 'react';
import { useToast } from "../components/ui/use-toast";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ResumeUploader from '../components/ResumeUploader';
import AnalysisDisplay from '../components/AnalysisDisplay';
import { AuthModal } from '../components/AuthModal';
import { Target, Lightbulb, FileText, Loader2 } from 'lucide-react';

const mockAnalysis = {
  score: 88,
  summary: "Your resume demonstrates strong professional experience with quantifiable achievements, but could benefit from some structural improvements and ATS optimization.",
  strengths: [
    "Clearly articulated project impacts with quantifiable results",
    "Strong action verbs used throughout the experience section",
    "Well-structured and easy to read format"
  ],
  weaknesses: [
    "Missing professional summary section",
    "Skills section needs better organization",
    "Some bullet points lack specific metrics"
  ],
  improvementSuggestions: [
    "Add a compelling professional summary at the top",
    "Group skills by category (e.g., Technical, Soft Skills, Tools)",
    "Include more quantifiable achievements in work experience",
    "Use industry-specific keywords throughout"
  ],
  bulletPointRewrites: [
    {
      before: "Managed team projects and improved efficiency",
      after: "Led 5-person development team to increase sprint velocity by 40% through agile process optimization",
      explanation: "Added specific numbers and clear outcome metrics"
    }
  ],
  atsAnalysis: {
    score: 75,
    issues: [
      "Resume uses some graphical elements that may not parse correctly",
      "Complex formatting in header could cause issues"
    ],
    missingKeywords: [
      "project management",
      "agile methodologies",
      "cross-functional collaboration"
    ],
    formatWarnings: [
      "Remove header images and use plain text",
      "Avoid tables for skills section"
    ]
  }
};

const Index = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Close auth modal when user signs in
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
    }
  }, [user, showAuth]);

  const handleAnalyze = async (file: File) => {
    console.log("Analyzing file:", file.name);
    setIsLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('Raw response:', textResponse);
        
        toast({
          title: "Server Error",
          description: "Invalid response from server. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      if (!response.ok || !data.success) {
        // Handle specific error types
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
          toast({
            title: "Upload Limit Reached",
            description: data.message,
            variant: "destructive",
          });
        } else if (data.error === 'GEMINI_QUOTA_EXCEEDED') {
          toast({
            title: "AI Service Busy",
            description: "Gemini API quota exceeded. Please try again later.",
            variant: "destructive",
          });
        } else if (data.error === 'MISSING_API_KEY') {
          toast({
            title: "Configuration Error",
            description: "AI service not properly configured. Please contact support.",
            variant: "destructive",
          });
        } else if (data.error === 'AI_SERVICE_UNAVAILABLE') {
          // Show fallback analysis if available
          if (data.fallback) {
            setAnalysis(data.fallback);
            toast({
              title: "AI Service Unavailable",
              description: "Showing basic analysis. Full AI features will return shortly.",
              variant: "default",
            });
          } else {
            throw new Error(data.message || 'AI service unavailable');
          }
        } else {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
        return;
      }
      
      setAnalysis(data.analysis);
      setFeedbackId(data.feedbackId);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setFeedbackId(null);
  };

  // PDF Export Handler
  const handleExport = async () => {
    if (!analysis) {
      toast({
        title: 'Export Failed',
        description: 'No analysis data found. Please analyze your resume first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis,
          resumeData: {
            timestamp: new Date().toISOString()
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI-Resume-Feedback.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header onSignInClick={() => setShowAuth(true)} />
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuth && !user}
        onClose={() => setShowAuth(false)}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!analysis ? (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
                ✨ AI-Powered Resume Analysis
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                Transform Your Resume with AI
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Get instant, professional feedback on your resume with our advanced AI analysis. 
                Improve your chances of landing your dream job with personalized insights and recommendations.
              </p>
              
              {/* Feature Grid */}
              <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Smart Scoring</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Get detailed scores for different sections of your resume
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">AI Insights</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Receive actionable suggestions to improve your resume
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Export PDF</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Download a professional report with all recommendations
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border shadow-xl">
                <CardContent className="p-8">
                  {isLoading ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-2 border-2 border-purple-400 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Analyzing Your Resume</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Our AI is carefully reviewing your resume and generating personalized insights...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ResumeUploader 
                      onAnalyze={handleAnalyze} 
                      onSignInClick={() => setShowAuth(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="max-w-6xl mx-auto">
            <AnalysisDisplay 
              analysis={analysis} 
              onReset={handleReset} 
              onExport={handleExport}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
