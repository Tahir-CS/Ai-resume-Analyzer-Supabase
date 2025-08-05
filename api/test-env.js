export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      gemini_api_key_available: !!process.env.GEMINI_API_KEY,
      supabase_url_available: !!process.env.VITE_SUPABASE_URL,
      supabase_anon_key_available: !!process.env.VITE_SUPABASE_ANON_KEY,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
