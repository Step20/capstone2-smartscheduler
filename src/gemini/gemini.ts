import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getChatResponse(userMessage: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(userMessage);
        const text = result.response.text();
        return text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw error;
    }
}