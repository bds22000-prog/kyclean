
import { GoogleGenAI } from "@google/genai";

export async function generateOperationalSummary(data: any, lang: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following landfill operational data and provide a professional summary in ${lang}: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "You are an expert landfill operations consultant. Provide concise, data-driven insights.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI analysis unavailable at the moment.";
  }
}

export async function translateContent(text: string, targetLang: string) {
  if (!text || text.length < 2) return text;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text into ${targetLang === 'ko' ? 'Korean' : 'Russian'}. Keep the technical terms and tone professional: "${text}"`,
      config: {
        systemInstruction: "You are a professional translator for a waste management company. Translate accurately and concisely.",
        temperature: 0.3,
      },
    });
    return response.text?.replace(/"/g, '') || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
}
