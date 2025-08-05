import puppeteer from 'puppeteer';

export const generatePDFFeedback = async (feedback) => {
  const { analysis, resumeText, jobDescription, timestamp } = feedback;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
            .score { font-size: 24px; color: #27ae60; }
            .warning { color: #e74c3c; }
            .improvement { color: #2980b9; }
            .rewrite { background: #f9f9f9; padding: 10px; margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>Resume Analysis Report</h1>
        <p>Generated on: ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}</p>

        <div class="section">
            <h2 class="section-title">Overall Score</h2>
            <div class="score">${analysis.score}/100</div>
            <p>${analysis.summary}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Key Strengths</h2>
            <ul>
                ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Areas for Improvement</h2>
            <ul>
                ${analysis.weaknesses.map(weakness => `<li class="warning">${weakness}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Suggested Improvements</h2>
            <ul>
                ${analysis.improvementSuggestions.map(suggestion => 
                  `<li class="improvement">${suggestion}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Bullet Point Improvements</h2>
            ${analysis.bulletPointRewrites.map(rewrite => `
                <div class="rewrite">
                    <p><strong>Before:</strong> ${rewrite.before}</p>
                    <p><strong>After:</strong> ${rewrite.after}</p>
                    <p><em>Why:</em> ${rewrite.explanation}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">ATS Analysis</h2>
            <p><strong>ATS Score:</strong> ${analysis.atsAnalysis.score}/100</p>
            
            <h3>Formatting Issues:</h3>
            <ul>
                ${analysis.atsAnalysis.formatWarnings.map(warning => 
                  `<li class="warning">${warning}</li>`).join('')}
            </ul>

            <h3>Missing Keywords:</h3>
            <ul>
                ${analysis.atsAnalysis.missingKeywords.map(keyword => 
                  `<li>${keyword}</li>`).join('')}
            </ul>
        </div>
    </body>
    </html>
  `;
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
