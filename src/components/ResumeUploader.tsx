import { useState, useCallback } from 'react';
import { Upload, FileText, File, CheckCircle, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';

interface ResumeUploaderProps {
  onAnalyze: (file: File) => void;
  onSignInClick: () => void;
}

const ResumeUploader = ({ onAnalyze, onSignInClick }: ResumeUploaderProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Require authentication for uploads
  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign In to Analyze Your Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create an account or sign in to upload your resume and get personalized AI-powered feedback.
            </p>
          </div>
          <Button 
            onClick={onSignInClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105' 
            : file 
              ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <label 
          htmlFor="resume-upload" 
          className="flex flex-col items-center justify-center space-y-4 cursor-pointer w-full h-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className={`
            border-4 border-dashed rounded-full p-6 transition-all duration-300
            ${isDragging 
              ? 'border-blue-400 bg-blue-100 dark:bg-blue-800/30' 
              : file 
                ? 'border-green-400 bg-green-100 dark:bg-green-800/30' 
                : 'border-slate-300 dark:border-slate-600'
            }
          `}>
            {file ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-slate-400'} transition-colors duration-300`} />
            )}
          </div>
          
          <input 
            id="resume-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.txt" 
          />
          
          <div className="space-y-2">
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              {file ? 'File Selected!' : isDragging ? 'Drop your resume here' : 'Drag & drop your resume here'}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {file ? 'Ready to analyze' : 'or click to browse'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Supports PDF, DOC, DOCX, TXT (Max 5MB)
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ Limit: 1 upload per hour per user
            </p>
          </div>
        </label>
      </div>

      {file && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {getFileIcon(file.name)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
        </div>
      )}

      <Button 
        size="lg" 
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
        disabled={!file} 
        onClick={() => file && onAnalyze(file)}
      >
        Analyze Resume with AI
      </Button>
    </div>
  );
};

export default ResumeUploader;
