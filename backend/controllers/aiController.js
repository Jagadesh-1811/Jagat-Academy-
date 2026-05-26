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
    console.error("askDoubt error:", error);
    return res.status(500).json({ message: "Failed to answer doubt" });
  }
};