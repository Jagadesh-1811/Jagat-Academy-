import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const testGeminiChatbot = async () => {
  console.log("=== Testing Gemini Chatbot (gemini-2.0-flash) ===");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent("Say hello as the Jagat Academy AI assistant in one sentence.");
    const text = (await result.response).text().trim();
    console.log("✅ Chatbot Response:", text);
  } catch (err) {
    console.error("❌ Chatbot failed:", err.message);
    // Try fallback
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent("Say hello as the Jagat Academy AI assistant in one sentence.");
      const text = (await result.response).text().trim();
      console.log("✅ Chatbot Fallback (1.5-flash) Response:", text);
    } catch (err2) {
      console.error("❌ Chatbot fallback also failed:", err2.message);
    }
  }
};

const testGeminiCourseGen = async () => {
  console.log("\n=== Testing Gemini Course Generation (gemini-1.5-pro) ===");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
    });
    const result = await model.generateContent("Write 3 bullet points about what JavaScript is. Be concise.");
    const text = (await result.response).text().trim();
    console.log("✅ Course Gen Response (1.5-pro):", text.substring(0, 300) + "...");
  } catch (err) {
    console.error("❌ gemini-1.5-pro failed:", err.message);
    // Try flash
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent("Write 3 bullet points about what JavaScript is. Be concise.");
      const text = (await result.response).text().trim();
      console.log("✅ Course Gen Fallback (1.5-flash):", text.substring(0, 300) + "...");
    } catch (err2) {
      console.error("❌ Course gen fallback also failed:", err2.message);
    }
  }
};

const testYouTube = async () => {
  console.log("\n=== Testing YouTube API (with server headers) ===");
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        q: `JavaScript tutorial educational`,
        part: 'snippet',
        maxResults: 3,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY
      },
      headers: {
        'Referer': 'https://localhost',
        'Origin': 'https://localhost'
      }
    });
    console.log("✅ YouTube success! Items found:", response.data.items?.length);
    response.data.items?.forEach((item, index) => {
      console.log(`  Video ${index + 1}: ${item.snippet.title} (ID: ${item.id.videoId})`);
    });
  } catch (err) {
    const code = err.response?.data?.error?.code;
    const msg = err.response?.data?.error?.message || err.message;
    console.error(`❌ YouTube failed [${code}]: ${msg}`);
    if (code === 403) {
      console.log("\n⚠️  ACTION NEEDED: Fix YouTube API Key in Google Cloud Console:");
      console.log("   1. Go to https://console.cloud.google.com/apis/credentials");
      console.log("   2. Click on your YouTube API key");
      console.log("   3. Under 'Application restrictions' → select 'None' or 'IP addresses'");
      console.log("   4. Save and wait ~2 minutes for changes to propagate");
    }
  }
};

const run = async () => {
  await testGeminiChatbot();
  await testGeminiCourseGen();
  await testYouTube();
  console.log("\n=== Diagnosis Complete ===");
};

run();
