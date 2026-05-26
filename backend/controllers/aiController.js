import { queryGemini } from "../utils/aiHelper.js";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
dotenv.config();

export const searchWithAi = async (req, res) => {

  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const prompt = `You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${input}
`;

    let keyword = input; // Fallback to raw input
    try {
      const text = await queryGemini(prompt);
      if (text) {
        keyword = text.replace(/[*_#`]/g, '').trim();
      }
    } catch (geminiError) {
      console.warn("Gemini API failed or rate limited. Falling back to raw keyword search.", geminiError.message);
    }

    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: input, $options: 'i' } },
        { subTitle: { $regex: input, $options: 'i' } },
        { description: { $regex: input, $options: 'i' } },
        { category: { $regex: input, $options: 'i' } },
        { level: { $regex: input, $options: 'i' } }
      ]
    });

    if (courses.length > 0) {
      return res.status(200).json(courses);
    } else {
      const fallbackCourses = await Course.find({
        isPublished: true,
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { subTitle: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } },
          { level: { $regex: keyword, $options: 'i' } }
        ]
      });
      return res.status(200).json(fallbackCourses);
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Search failed" });
  }
}

export const askDoubt = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const prompt = `You are an expert tutor for Jagat Academy. A student has asked a doubt:
    
Question: ${question}

Provide a clear, concise, and helpful explanation to solve the doubt. Use a friendly and encouraging tone. Keep it under 150 words.`;

    const answer = await queryGemini(prompt);
    
    return res.status(200).json({ answer: answer || "I'm sorry, I couldn't find an answer to your doubt at the moment." });
  } catch (error) {
    console.error("askDoubt error, activating smart fallback:", error);
    
    const msg = req.body.question.toLowerCase();
    let fallbackAnswer = "";

    if (msg.includes("javascript") || msg.includes("js")) {
      fallbackAnswer = "JavaScript is a powerful client-side and server-side language. For most doubts, check your bracket closures, variable scope (let/const), and make sure async code uses async/await or .then(). If you have an error, double check your browser console!";
    } else if (msg.includes("react")) {
      fallbackAnswer = "In React, make sure your hooks (useState, useEffect) are called at the top level of your component. Never mutate state directly; always use the setter function (e.g., setState). Don't forget that list items need unique 'key' props!";
    } else if (msg.includes("html") || msg.includes("css")) {
      fallbackAnswer = "For CSS doubts: check if your selector specificity is correct, and consider using Flexbox (display: flex) or Grid for layouts. For HTML doubts: ensure all tags are closed properly and that your script tags have defer/async attributes if needed.";
    } else {
      fallbackAnswer = "I'm currently operating in high-traffic fallback mode (rate limit reached), but I encourage you to post this query in our 'Course Discussion' tab to get prompt assistance from peer students and course mentors!";
    }

    return res.status(200).json({ 
      answer: fallbackAnswer,
      isFallback: true 
    });
  }
};