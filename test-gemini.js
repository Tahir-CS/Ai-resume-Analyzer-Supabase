// Quick test script to check Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBGByKMT2Yf8gOBIg3ZHv2OXASFniwwL_s';

async function testGeminiAPI() {
  try {
    console.log('🔍 Testing Gemini API...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const prompt = "Hello! Just testing if the API is working. Please respond with 'API is working!'";
    
    console.log('📤 Sending test prompt...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Response:', text);
    console.log('🎉 Gemini API is working correctly!');
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      console.log('🔑 Your API key might be invalid or expired');
    } else if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      console.log('📊 API quota exceeded - you might need to wait or upgrade');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      console.log('🚫 Permission denied - check if Gemini API is enabled in your Google Cloud project');
    } else {
      console.log('🌐 Network or other error occurred');
    }
  }
}

testGeminiAPI();
