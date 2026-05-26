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

    // Generate response using Gemini 2.0 Flash
    const text = await queryGemini(prompt, '', 'gemini-2.0-flash');
    const resultText = text || "I am the Jagat Academy AI assistant. I'm here to support your learning journey. Please try your question again or let me know how I can help!";

    return res.status(200).json({
      success: true,
      response: resultText,
    });
  } catch (error) {
    console.error('Error in chatWithAI, activating smart educational fallback:', error);
    
    // Generate a high-quality educational fallback response based on keywords
    const msg = message.toLowerCase();
    let fallbackText = "";

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("greetings")) {
      fallbackText = "Hello! I am the Jagat Academy Assistant. The AI model is currently experiencing high traffic (free-tier quota reached), but I am here and ready to help! What topic or course concept are you working on today?";
    } else if (msg.includes("javascript") || msg.includes("js")) {
      fallbackText = "It looks like you're asking about JavaScript! JavaScript is a versatile, dynamic programming language primarily used to make websites interactive. Common topics include variables (let, const), functions, loops, and promises for asynchronous operations. Please let me know which specific JS concept you'd like to dive into!";
    } else if (msg.includes("react")) {
      fallbackText = "React is a popular JavaScript library for building user interfaces using component-driven design. It uses a virtual DOM to optimize rendering and implements state (useState) and lifecycle hooks (useEffect) to manage dynamic data. Tell me more about what you're trying to build in React!";
    } else if (msg.includes("html") || msg.includes("css")) {
      fallbackText = "HTML provides the structure of a webpage (like headings, paragraphs, and buttons), while CSS styles it (layout, colors, fonts, and responsiveness). Let me know if you need help with CSS Flexbox, Grid, semantic HTML, or positioning elements!";
    } else if (msg.includes("python")) {
      fallbackText = "Python is a clean, readable language used extensively in web development (Django/Flask), data science, AI/ML, and automation scripts. Key concepts include lists, dictionaries, functions, and standard libraries. What Python topic or script can I assist you with?";
    } else if (msg.includes("db") || msg.includes("database") || msg.includes("sql") || msg.includes("mongodb")) {
      fallbackText = "Databases store and manage application data. SQL databases (like PostgreSQL or MySQL) are relational and use tables with schemas, while NoSQL databases (like MongoDB) are document-oriented and highly scalable. Let me know if you need help writing a query or structuring your database schema!";
    } else {
      fallbackText = `Thanks for asking! I'm the Jagat Academy AI Assistant. The primary AI API is currently running at maximum capacity or has reached its daily free limit, but I am still online to guide you. 
      
If you're stuck on a coding doubt:
1. Double-check your syntax and console errors.
2. Ask in the Course Discussion tab to collaborate with classmates and mentors.
3. Try asking your doubt again shortly. I'm always here to support your learning journey!`;
    }

    return res.status(200).json({
      success: true,
      response: fallbackText,
      isFallback: true
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
    console.error('Error in chatWithImage, activating fallback:', error);
    return res.status(200).json({
      success: true,
      response: "I received your image! However, my image analysis service is currently experiencing high load (free tier rate limits reached). If you are facing an error or need code feedback, please write a brief description of the code or concept in text, and I'll do my absolute best to help you solve it!",
      isFallback: true
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
