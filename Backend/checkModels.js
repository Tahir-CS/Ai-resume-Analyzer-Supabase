import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const models = await genAI.models.list();

    console.log("Raw response:");
    console.dir(models, { depth: null }); // show everything

    // Try to access the model list safely
    if (Array.isArray(models?.models)) {
      console.log("\nAvailable models:");
      models.models.forEach((model) => {
        console.log("–", model.name);
      });
    } else {
      console.log("\nNo models found or unexpected structure.");
    }

  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();
