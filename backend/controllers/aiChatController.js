import { GoogleGenerativeAI } from '@google/generative-ai';
import { queryGemini } from '../utils/aiHelper.js';

// Initialize Google Generative AI (retained for fallback and vision analysis)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with AI (text only)
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Create a context-aware prompt for educational assistance
    const prompt = `Welcome to Jagat Academy! You are the official AI assistant for Jagat Academy. 
Your role is to help students with their courses, assignments, and learning journey.
Be helpful, encouraging, and provide clear explanations.

Student's question: ${message}

Please provide a helpful and educational response:`;

    // Generate response using Gemini 2.0 Flash model (optimized for chatbot)
    let text;
    try {
      text = await queryGemini(prompt, '', 'gemini-2.0-flash');
    } catch (geminiError) {
      console.warn(`⚠️ Chatbot Router: Falling back to Gemini 1.5 Flash...`);
      text = await queryGemini(prompt, '', 'gemini-1.5-flash');
    }
    const resultText = text || "I am the Jagat Academy AI assistant. I'm here to support your learning journey. Please try your question again or let me know how I can help!";

    return res.status(200).json({
      success: true,
      response: resultText,
    });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process AI request',
    });
  }
};

// Chat with AI (text + image)
export const chatWithImage = async (req, res) => {
  try {
    const { message } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    // Get the vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Convert buffer to base64
    const imageData = {
      inlineData: {
        data: image.buffer.toString('base64'),
        mimeType: image.mimetype,
      },
    };

    // Create prompt
    const prompt = message && message.trim()
      ? `Welcome to Jagat Academy! You are the official AI assistant for Jagat Academy. 
The student has uploaded an image and asked: "${message}"

Please analyze the image and provide a helpful educational response:`
      : `Welcome to Jagat Academy! You are the official AI assistant for Jagat Academy.
The student has uploaded an image for analysis.

Please describe what you see in the image and provide any relevant educational insights or explanations:`;

    // Generate response with image
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error('Error in chatWithImage:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image with AI',
    });
  }
};

// Combined chat handler (text or image)
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const image = req.file;

    // If image is provided, use vision model
    if (image) {
      return chatWithImage(req, res);
    }

    // Otherwise, use text-only model
    return chatWithAI(req, res);
  } catch (error) {
    console.error('Error in chat:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat request',
    });
  }
};
