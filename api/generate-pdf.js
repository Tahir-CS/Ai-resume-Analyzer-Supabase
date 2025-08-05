import puppeteer from 'puppeteer';

// CORS headers for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Generate PDF feedback with improved resume template
async function generatePDFFeedback(analysis, resumeData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Resume Analysis & Improved Template</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #4A90E2;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .title {
                color: #4A90E2;
                font-size: 28px;
                font-weight: bold;
                margin: 0;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
                margin: 10px 0 0 0;
            }
            .page-break {
                page-break-before: always;
            }
            .section {
                margin-bottom: 30px;
            }
            .section-title {
                color: #4A90E2;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                border-left: 4px solid #4A90E2;
                padding-left: 15px;
            }
            .score-section {
                background: linear-gradient(135deg, #4A90E2, #5BA3F5);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
            }
            .score {
                font-size: 48px;
                font-weight: bold;
                margin: 0;
            }
            .improvement-item {
                background: #f8fff9;
                border-left: 4px solid #28a745;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
            }
            .before-after {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 15px 0;
            }
            .before, .after {
                padding: 15px;
                border-radius: 5px;
            }
            .before {
                background: #fff8f8;
                border: 1px solid #dc3545;
            }
            .after {
                background: #f8fff9;
                border: 1px solid #28a745;
            }
            .resume-template {
                background: #ffffff;
                border: 2px solid #4A90E2;
                padding: 30px;
                margin: 20px 0;
                border-radius: 10px;
            }
            .resume-header {
                text-align: center;
                border-bottom: 2px solid #4A90E2;
                padding-bottom: 20px;
                margin-bottom: 25px;
            }
            .resume-name {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin: 0;
            }
            .resume-contact {
                color: #666;
                margin-top: 10px;
            }
            .resume-section {
                margin-bottom: 25px;
            }
            .resume-section h3 {
                color: #4A90E2;
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .bullet-point {
                margin: 8px 0;
                padding-left: 20px;
                position: relative;
            }
            .bullet-point::before {
                content: '•';
                color: #4A90E2;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            .highlight {
                background: #fff3cd;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 500;
            }
            .tip {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Analysis Section -->
            <div class="header">
                <h1 class="title">Resume Analysis & Improvement Guide</h1>
                <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="score-section">
                <div class="score">${analysis.overallScore || 'N/A'}/100</div>
                <div>Overall Resume Score</div>
            </div>

            <div class="section">
                <div class="section-title">Executive Summary</div>
                <p>${analysis.summary || 'No summary available'}</p>
            </div>

            <!-- Key Improvements Section -->
            <div class="section">
                <div class="section-title">Priority Improvements</div>
                ${(analysis.suggestions || analysis.improvementSuggestions || []).map(suggestion => 
                    `<div class="improvement-item">💡 ${suggestion}</div>`
                ).join('')}
            </div>

            <!-- Before/After Examples -->
            ${analysis.bulletPointRewrites && analysis.bulletPointRewrites.length > 0 ? `
            <div class="section">
                <div class="section-title">Bullet Point Improvements</div>
                ${analysis.bulletPointRewrites.map(rewrite => `
                    <div class="before-after">
                        <div class="before">
                            <strong>❌ Before:</strong><br>
                            ${rewrite.before}
                        </div>
                        <div class="after">
                            <strong>✅ After:</strong><br>
                            ${rewrite.after}
                        </div>
                    </div>
                    <div class="tip">
                        <strong>💡 Why this works:</strong> ${rewrite.explanation}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Page Break for Resume Template -->
            <div class="page-break"></div>
            
            <!-- Improved Resume Template -->
            <div class="header">
                <h1 class="title">Your Improved Resume Template</h1>
                <p class="subtitle">Apply these improvements to enhance your resume</p>
            </div>

            <div class="resume-template">
                <div class="resume-header">
                    <div class="resume-name">[Your Full Name]</div>
                    <div class="resume-contact">
                        [Your Email] • [Your Phone] • [Your City, State] • [LinkedIn Profile] • [Portfolio/Website]
                    </div>
                </div>

                <div class="resume-section">
                    <h3>Professional Summary</h3>
                    <div class="tip">
                        <strong>Improvement:</strong> Add a compelling 2-3 line summary that highlights your key value proposition and career achievements.
                    </div>
                    <p><em>Example: Results-driven [Your Title] with [X] years of experience in [Key Skills]. Proven track record of [Key Achievement] and expertise in [Core Competencies]. Seeking to leverage [Strengths] to drive [Company Value] at [Target Company Type].</em></p>
                </div>

                <div class="resume-section">
                    <h3>Core Competencies</h3>
                    <div class="tip">
                        <strong>Improvement:</strong> Organize skills by category and include both technical and soft skills relevant to your target role.
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <strong>Technical Skills:</strong><br>
                            • [Skill 1] • [Skill 2] • [Skill 3]<br>
                            • [Software/Tools] • [Programming Languages]
                        </div>
                        <div>
                            <strong>Leadership & Soft Skills:</strong><br>
                            • [Leadership Skill] • [Communication]<br>
                            • [Problem Solving] • [Team Collaboration]
                        </div>
                    </div>
                </div>

                <div class="resume-section">
                    <h3>Professional Experience</h3>
                    <div class="tip">
                        <strong>Improvement:</strong> Use the STAR method (Situation, Task, Action, Result) and include quantifiable achievements.
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>[Job Title] | [Company Name] | [Location] | [Start Date - End Date]</strong>
                        <div class="bullet-point">Led [specific project/initiative] resulting in <span class="highlight">[quantifiable result, e.g., 25% increase in efficiency]</span></div>
                        <div class="bullet-point">Managed [scope of responsibility] and collaborated with <span class="highlight">[team size/departments]</span> to achieve [specific outcome]</div>
                        <div class="bullet-point">Implemented [solution/process] that reduced <span class="highlight">[metric] by [percentage/amount]</span></div>
                        <div class="bullet-point">Recognized for <span class="highlight">[specific achievement/award]</span> among [context, e.g., team of 50+]</div>
                    </div>

                    <div>
                        <strong>[Previous Job Title] | [Company Name] | [Location] | [Start Date - End Date]</strong>
                        <div class="bullet-point">Developed [project/system] that generated <span class="highlight">[revenue/savings amount]</span></div>
                        <div class="bullet-point">Streamlined [process] reducing <span class="highlight">[time/cost] by [percentage]</span></div>
                        <div class="bullet-point">Trained and mentored <span class="highlight">[number] team members</span> in [relevant skills/processes]</div>
                    </div>
                </div>

                <div class="resume-section">
                    <h3>Education & Certifications</h3>
                    <div>
                        <strong>[Degree] in [Field] | [University Name] | [Year]</strong><br>
                        ${analysis.keywordMatch && analysis.keywordMatch.missingKeywords ? 
                            `<em>Consider adding: ${analysis.keywordMatch.missingKeywords.slice(0, 3).join(', ')} certifications</em>` : 
                            '<em>Add relevant certifications for your target role</em>'
                        }
                    </div>
                </div>

                <div class="resume-section">
                    <h3>Key Projects & Achievements</h3>
                    <div class="tip">
                        <strong>Improvement:</strong> Highlight 2-3 major projects that demonstrate your impact and skills.
                    </div>
                    <div class="bullet-point"><strong>[Project Name]:</strong> [Brief description] resulting in <span class="highlight">[measurable impact]</span></div>
                    <div class="bullet-point"><strong>[Achievement]:</strong> [Context and result with specific metrics]</div>
                </div>
            </div>

            <!-- Action Items -->
            <div class="section" style="margin-top: 30px;">
                <div class="section-title">Next Steps - Action Checklist</div>
                <div class="improvement-item">✅ Update your professional summary with a compelling value proposition</div>
                <div class="improvement-item">✅ Add quantifiable metrics to all bullet points (numbers, percentages, dollar amounts)</div>
                <div class="improvement-item">✅ Include relevant keywords from job descriptions in your target field</div>
                <div class="improvement-item">✅ Organize skills by category (Technical, Leadership, Industry-specific)</div>
                <div class="improvement-item">✅ Ensure consistent formatting and remove any graphics/tables for ATS compatibility</div>
                ${analysis.keywordMatch && analysis.keywordMatch.missingKeywords && analysis.keywordMatch.missingKeywords.length > 0 ? 
                    `<div class="improvement-item">✅ Consider adding these missing keywords: ${analysis.keywordMatch.missingKeywords.join(', ')}</div>` : ''
                }
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #666;">
                <p><strong>💡 Pro Tip:</strong> Customize this template for each job application by incorporating specific keywords and requirements from the job description.</p>
                <p>Generated by AI Resume Analyzer - Transform your career with data-driven insights!</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html);
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      bottom: '20px',
      left: '20px',
      right: '20px'
    }
  });
  
  await browser.close();
  return pdf;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { analysis, resumeData } = req.body;

    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: 'Analysis data is required'
      });
    }

    const pdfBuffer = await generatePDFFeedback(analysis, resumeData);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-feedback-${Date.now()}.pdf`);
    
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
}
