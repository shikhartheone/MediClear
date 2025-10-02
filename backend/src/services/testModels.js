import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const testModels = async () => {
  const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

  try {
    const models = await genAI.listModels();
    console.log("Available models:", models);
  } catch (error) {
    console.error("Error listing models:", error);
  }
};

testModels();
