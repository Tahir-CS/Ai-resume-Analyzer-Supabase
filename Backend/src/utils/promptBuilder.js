export const buildAnalysisPrompt = (resumeText, jobDescription = '') => {
  return `You're an expert resume coach and ATS specialist. Analyze the following resume text:

${resumeText}

${jobDescription ? `For the following job description:\n${jobDescription}\n` : ''}

Provide a comprehensive analysis including:

1. Identify key strengths and weaknesses
2. Suggest improvements to content, grammar, and formatting
3. Check for ATS-friendliness and list missing keywords ${jobDescription ? 'relevant to the provided job description' : 'for general professional roles'}
4. For weak or generic bullet points, provide before/after rewrites
5. Output a structured JSON response with these sections:
   {
     "summary": "Overall assessment of the resume",
     "score": "A number between 0-100 indicating overall quality",
     "strengths": ["Array of identified strengths"],
     "weaknesses": ["Array of identified weaknesses"],
     "improvementSuggestions": ["Array of specific suggestions"],
     "bulletPointRewrites": [
       {
         "before": "Original text",
         "after": "Improved version",
         "explanation": "Why this is better"
       }
     ],
     "atsAnalysis": {
       "score": "ATS-friendliness score 0-100",
       "issues": ["Array of ATS issues"],
       "missingKeywords": ["Array of missing important keywords"],
       "formatWarnings": ["Array of formatting warnings"]
     }
   }

ONLY return valid JSON. Do not include any explanations, markdown, code fences, or extra text. Respond with a single JSON object, no comments, no extra formatting.`;
};
