// IMPORTANT: This uses the ES Module version of the SDK.
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash"; // Or "gemini-pro", "gemini-1.0-pro"

class GeminiQuestionGenerator {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: MODEL_NAME
        });
    }

    async generateQuestions() {
        const prompt = `
Generate a set of questions suitable for assessing a candidate. The set should contain exactly:
1. Two (2) distinct theory questions related to computer science or software development concepts.
2. Two (2) distinct coding questions (provide a clear problem statement, possibly suggesting a language or asking for pseudocode).
3. One (1) aptitude question (e.g., logical reasoning, pattern recognition, or problem-solving).

Please format the output as a JSON object with the following structure:
{
  "theory": [
    "Question 1 text...",
    "Question 2 text..."
  ],
  "coding": [
    "Question 1 text...",
    "Question 2 text..."
  ],
  "aptitude": [
    "Question 1 text..."
  ]
}
Ensure the output is only the JSON object and nothing else.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            let rawJsonText = response.text();

            // Clean potential markdown ```json blocks
            rawJsonText = rawJsonText.trim();
            if (rawJsonText.startsWith('```json')) {
                rawJsonText = rawJsonText.substring(7);
            }
            if (rawJsonText.endsWith('```')) {
                rawJsonText = rawJsonText.substring(0, rawJsonText.length - 3);
            }
            rawJsonText = rawJsonText.trim();

            // Parse the JSON response
            const questions = JSON.parse(rawJsonText);
            return questions;
        } catch (error) {
            console.error("Error generating questions:", error);
            throw error;
        }
    }
}

// Helper function to prevent basic HTML injection from the AI response
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export { GeminiQuestionGenerator, escapeHtml }; 