import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (only if credentials are provided)
let supabase = null;
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
}

// Test Supabase connection
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(500).json({ 
        error: 'Supabase not configured', 
        details: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
      });
    }

    // Test Supabase connection
    console.log('Testing Supabase connection...')
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase auth error:', error)
      return res.status(500).json({ 
        error: 'Supabase connection failed', 
        details: error.message 
      })
    }

    console.log('Supabase connection successful')
    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection working',
      session: data.session ? 'Session found' : 'No session'
    })

  } catch (error) {
    console.error('Test error:', error)
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    })
  }
}
