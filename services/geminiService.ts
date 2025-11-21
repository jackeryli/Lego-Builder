import { GoogleGenAI, Type } from "@google/genai";
import { BrickType, LEGO_COLORS } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Define schema for structured output
const brickSchema = {
  type: Type.OBJECT,
  properties: {
    bricks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Brick type (e.g., '2x4', '1x1')" },
          color: { type: Type.STRING, description: "Hex color code" },
          position: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "x, y, z coordinates (y is up, units are studs)"
          },
          rotation: { type: Type.INTEGER, description: "0, 1, 2, 3 (90 degree increments)" }
        },
        required: ["type", "color", "position", "rotation"]
      }
    }
  }
};

export const generateBricksFromPrompt = async (prompt: string): Promise<any[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are a master LEGO builder.
    I will describe an object, and you will generate a JSON list of bricks to build it.
    
    Coordinate System:
    - Y is UP. 0 is the ground.
    - One unit = 1 stud width.
    - Standard brick height = 1.2 units.
    - Plate height = 0.4 units.
    - Start building at Y=0.
    
    Available Brick Types: '1x1', '1x2', '1x4', '2x2', '2x3', '2x4', '2x6', 'plate1x1', 'plate2x4'.
    Use official Lego colors provided in the prompt context or infer reasonable ones.
    
    Make sure the structure is stable and bricks overlap correctly.
    Keep the part count under 100 for performance.
    Center the build around X=0, Z=0.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: brickSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return data.bricks || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
