import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper to query Google Gemini API.
 *
 * @param {string} prompt - Prompt query string
 * @param {string} systemInstruction - Optional system context/instruction
 * @param {string} modelName - Gemini model to use
 * @returns {Promise<string>} Response text from Gemini
 */
export const queryGemini = async (prompt, systemInstruction = '', modelName = 'gemini-1.5-flash') => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const modelsToTry = [modelName];
  if (modelName !== 'gemini-1.5-flash') modelsToTry.push('gemini-1.5-flash');

  for (const model of modelsToTry) {
    try {
      console.log(`Gemini: Sending request to model ${model}...`);
      const genModel = genAI.getGenerativeModel({
        model,
        ...(systemInstruction ? { systemInstruction } : {})
      });
      const result = await genModel.generateContent(prompt);
      const text = (await result.response).text().trim();
      console.log(`Gemini: Request successful (${model}).`);
      return text;
    } catch (error) {
      console.warn(`Gemini model ${model} failed: ${error.message}`);
      if (model === modelsToTry[modelsToTry.length - 1]) throw error;
    }
  }
};

/**
 * Generate rich educational course content using OpenAI.
 *
 * @param {string} prompt - Content generation prompt
 * @returns {Promise<string>} Rich markdown educational content
 */
export const queryOpenAI = async (prompt) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error('OPENAI_API_KEY is not configured in .env');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  console.log(`Course Gen (OpenAI): Sending content request to ${model}...`);

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        {
          role: 'system',
          content: 'You write clear, practical LMS course modules in well-structured Markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3500
    },
    {
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    }
  );

  const text = response.data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI returned an empty course response');
  }

  console.log(`Course Gen (OpenAI ${model}): Content generated (${text.length} chars).`);
  return text;
};
