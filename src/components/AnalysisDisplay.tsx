import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, AlertTriangle, Target, Edit, Download, RotateCcw, 
  TrendingUp, FileText, Award, Lightbulb 
} from 'lucide-react';

interface ScoreGaugeProps {
  score: number | null;
  size?: 'small' | 'large';
}

const ScoreGauge = ({ score, size = 'large' }: ScoreGaugeProps) => {
  const radius = size === 'large' ? 50 : 35;
  const strokeWidth = size === 'large' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const displayScore = score || 0;
  const offset = circumference - (displayScore / 100) * circumference;
  
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBackgroundColor = (score: number | null) => {
    if (!score) return 'text-gray-200';
    if (score >= 80) return 'text-green-100';
    if (score >= 60) return 'text-yellow-100';
    return 'text-red-100';
  };

  const dimension = size === 'large' ? 120 : 80;

  return (
    <div className={`relative ${size === 'large' ? 'w-32 h-32' : 'w-20 h-20'}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${dimension} ${dimension}`}>
        <circle
          className={getBackgroundColor(score)}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={dimension / 2}
          cy={dimension / 2}
        />
        <circle
          className={getScoreColor(score)}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={dimension / 2}
          cy={dimension / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-lg'} text-slate-700 dark:text-slate-200`}>
          {score ? displayScore : '—'}
        </span>
        <span className={`text-xs text-slate-500 ${size === 'large' ? '' : 'hidden'}`}>
          {score ? '/100' : 'N/A'}
        </span>
      </div>
    </div>
  );
};

interface Analysis {
  overallScore?: number;
  score?: number; // fallback for compatibility
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions?: string[];
  improvementSuggestions?: string[]; // fallback for compatibility
  keywordMatch?: {
    matchedKeywords: string[];
    missingKeywords: string[];
    matchPercentage: number;
  };
  bulletPointRewrites?: {
    before: string;
    after: string;
    explanation: string;
  }[];
  atsAnalysis?: {
    score: number;
    issues: string[];
    missingKeywords: string[];
    formatWarnings: string[];
  };
}

interface AnalysisDisplayProps {
  analysis: Analysis;
  onReset: () => void;
  onExport: () => void;
}

const AnalysisDisplay = ({ analysis, onReset, onExport }: AnalysisDisplayProps) => {
  const score = analysis.overallScore || analysis.score || 0;
  const suggestions = analysis.suggestions || analysis.improvementSuggestions || [];
  const { summary, strengths, weaknesses, keywordMatch, bulletPointRewrites, atsAnalysis } = analysis;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 text-sm font-semibold">
              ✅ Analysis Complete
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Resume Analysis
          </CardTitle>
          {!score && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ AI scoring is temporarily unavailable. Basic analysis provided below.
              </p>
            </div>
          )}
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {summary}
          </p>
        </CardHeader>
      </Card>

      {/* Performance Scores */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-blue-500" />
              Overall Score
            </h3>
            <ScoreGauge score={score} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {score >= 80 ? 'Excellent resume!' : score >= 60 ? 'Good resume with room for improvement' : 'Needs significant improvement'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              {keywordMatch ? 'Keyword Match' : 'ATS Score'}
            </h3>
            <ScoreGauge score={keywordMatch?.matchPercentage || atsAnalysis?.score || null} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {keywordMatch ? 'Job description alignment' : 'Applicant Tracking System compatibility'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths?.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/80 dark:bg-green-800/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-800 dark:text-green-200 text-sm">{strength}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weaknesses?.map((weakness, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/80 dark:bg-yellow-800/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">{weakness}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Actionable Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/80 dark:bg-blue-800/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 dark:text-blue-200 text-sm">{suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bullet Point Improvements */}
      {bulletPointRewrites && bulletPointRewrites.length > 0 && (
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Edit className="w-6 h-6" />
              Bullet Point Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bulletPointRewrites.map((rewrite, index) => (
              <div key={index} className="p-4 bg-white/80 dark:bg-purple-800/20 rounded-lg space-y-3">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Before:</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">{rewrite.before}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">After:</span>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{rewrite.after}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/30 p-2 rounded">
                  💡 {rewrite.explanation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ATS Analysis */}
      {atsAnalysis && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              ATS Compatibility Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {atsAnalysis.issues?.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/80 dark:bg-red-800/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200 text-sm">{issue}</p>
              </div>
            ))}
            
            {atsAnalysis.missingKeywords?.length > 0 && (
              <div className="p-3 bg-white/80 dark:bg-red-800/20 rounded-lg">
                <h4 className="font-semibold text-red-700 dark:text-red-300 text-sm mb-2">Missing Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {atsAnalysis.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-red-600 border-red-300">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onExport}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF Report
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Analyze New Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisDisplay;
