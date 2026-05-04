import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getSymptomAnalysis(symptoms: string, petType: string) {
  try {
    const prompt = `You are a helpful veterinary AI assistant. A user has reported the following symptoms for their ${petType}: "${symptoms}". 
    Please provide:
    1. Possible causes (strictly mention these are suggestions and not a diagnosis).
    2. Urgency level (Low, Medium, High, Emergency).
    3. Recommended next steps (e.g., Book a video call, visit an emergency clinic).
    Keep the response concise and formatted in markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "I'm sorry, I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I couldn't analyze the symptoms at this time. Please consult a licensed veterinarian immediately.";
  }
}
