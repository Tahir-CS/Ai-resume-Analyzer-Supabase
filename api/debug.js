// Simple debug endpoint to test basic functionality
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const envCheck = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      nodeVersion: process.version,
      platform: process.platform
    };

    console.log('Environment check:', envCheck);

    res.status(200).json({
      success: true,
      message: 'Debug endpoint working',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
