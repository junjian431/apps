import { GoogleGenAI, Type } from "@google/genai";
import { DigitizeResponseSchema } from "../types";

const parseJSON = (text: string): any => {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
};

export const digitizeDiagram = async (base64Image: string): Promise<DigitizeResponseSchema> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use Gemini 2.5 Flash for fast and accurate multimodal reasoning
  const modelId = "gemini-2.5-flash";

  const systemPrompt = `
    You are an expert mathematician, SVG artist, and frontend engineer.
    Your goal is to take a hand-drawn, fuzzy, or low-quality image of a geometry diagram (or any mathematical diagram) and convert it into a pristine, publication-quality SVG.

    Rules:
    1. Accuracy: Identify every shape, line, arrow, and text label. Preserve the mathematical relationships.
    2. Coordinate System: Use a logical coordinate system. If a line is labeled "4", make it 4 units long (scaled, e.g., 1 unit = 50px).
    3. Style: 
       - Use 'stroke="black"' and 'stroke-width="2"' for main lines.
       - Use 'fill="white"' for unshaded shapes.
       - Use 'fill="#cbd5e1"' (light gray) for shaded shapes present in the original.
       - Use a clean sans-serif font for text labels. Ensure text is legible.
    4. Arrows: Recreate any motion indicators or dimension arrows clearly.
    5. Output: Return the SVG code within the JSON response. The SVG must have a proper 'viewBox' to be responsive.
    6. Language: If the original text is in Chinese (e.g., "单位"), preserve it or translate it if it improves clarity (but preserving is usually safer for context).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", // Assuming PNG for generic base64 handling, or adjust based on input
              data: base64Image,
            },
          },
          {
            text: "Analyze this image and generate a high-quality SVG representation of the diagram.",
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        // We use a high thinking budget to ensure the model carefully measures dimensions and layout
        thinkingConfig: { thinkingBudget: 2048 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the diagram (e.g. 'Right Triangle Motion Problem')."
            },
            explanation: {
              type: Type.STRING,
              description: "A brief explanation of what was detected in the image (shapes, values, labels)."
            },
            svgContent: {
              type: Type.STRING,
              description: "The complete, valid SVG string starting with <svg> and ending with </svg>."
            }
          },
          required: ["title", "explanation", "svgContent"]
        }
      },
    });

    const result = parseJSON(response.text);
    if (!result) {
      throw new Error("Failed to parse the generated diagram data.");
    }
    return result as DigitizeResponseSchema;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
