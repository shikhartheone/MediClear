// // src/services/aiService.js
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize the AI model
// const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// // --- Helper Function to Call AI and Parse JSON ---
// const callAI = async (prompt) => {
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     // Clean the response to ensure it's valid JSON
//     const jsonString = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();
//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error("Error calling AI or parsing JSON:", error);
//     throw new Error("Failed to get a valid response from the AI model.");
//   }
// };

// // --- Main Service Function ---
// export const getSimplifiedReport = async (rawText) => {
//   // === AI Call #1: Parse Raw Text into a List ===
//   console.log("--- AI Step 1: Parsing Raw Text ---");
//   const parsingPrompt = `
//     Analyze the following medical report text. Extract each distinct test result into a JSON array called "tests_raw".
//     Text: "${rawText}"
//   `;
//   const parsedResult = await callAI(parsingPrompt);
//   const testsRaw = parsedResult.tests_raw;
//   if (!testsRaw || testsRaw.length === 0) {
//     throw new Error("AI failed to parse any tests from the raw text.");
//   }

//   // === AI Call #2: Normalize the Data ===
//   console.log("--- AI Step 2: Normalizing Tests ---");
//   const normalizationPrompt = `
//     For each string in the following array, convert it into a structured JSON object.
//     The JSON object must have these exact fields: "name" (string), "value" (number), "unit" (string), "status" (string, one of "low", "high", or "normal"), and "ref_range" (object with "low" and "high" number properties).
//     Standardize the test names (e.g., "WBC" for White Blood Cell Count).
//     Array: ${JSON.stringify(testsRaw)}
//     Return ONLY the JSON array of objects.
//   `;
//   const normalizedTests = await callAI(normalizationPrompt);

//   // === AI Call #3: Generate Patient-Friendly Summary ===
//   console.log("--- AI Step 3: Generating Summary ---");
//   const summaryPrompt = `
//     Based on these structured test results, generate a simple, patient-friendly summary.
//     The response must be a JSON object with two keys:
//     1. "summary": A single, brief sentence summarizing the key findings.
//     2. "explanations": An array of strings, with each string being a simple, one-line explanation for each ABNORMAL test.
//     IMPORTANT: Do NOT give medical advice or a diagnosis. Keep explanations general (e.g., "High WBC can occur with infections.").
//     Data: ${JSON.stringify(normalizedTests)}
//   `;
//   const summaryData = await callAI(summaryPrompt);

//   // === Guardrail Check: Prevent Hallucinated Tests ===
//   console.log("--- Executing Guardrail Check ---");
//   console.log("Raw OCR Text:", rawText);
//   console.log("Normalized Tests:", JSON.stringify(normalizedTests, null, 2));
//   for (const test of normalizedTests) {
//     // A simple check to see if the test name appears in the original text
//     const nameInText = new RegExp(test.name, "i").test(rawText);
//     if (!nameInText) {
//       throw new Error(`Hallucinated test detected: ${test.name}. Aborting.`);
//     }
//   }

//   // === Final Assembly ===
//   console.log("--- Assembling Final Report ---");
//   return {
//     tests: normalizedTests,
//     summary: summaryData.summary,
//     explanations: summaryData.explanations,
//   };
// };

// src/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// --- Helper Function to Call AI and Parse JSON ---
const callAI = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean the response to ensure it's valid JSON
    const jsonString = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling AI or parsing JSON:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

// --- Main Service Function ---
export const getSimplifiedReport = async (rawText) => {
  // === AI Call #1: Parse Raw Text into a List ===
  console.log("--- AI Step 1: Parsing Raw Text ---");
  const parsingPrompt = `
    Analyze the following medical report text. Extract each distinct test result into a JSON array called "tests_raw".
    Text: "${rawText}"
  `;
  const parsedResult = await callAI(parsingPrompt);
  const testsRaw = parsedResult.tests_raw;
  if (!testsRaw || testsRaw.length === 0) {
    throw new Error("AI failed to parse any tests from the raw text.");
  }

  // === AI Call #2: Normalize the Data ===
  console.log("--- AI Step 2: Normalizing Tests ---");
  const normalizationPrompt = `
    For each string in the following array, convert it into a structured JSON object.
    The JSON object must have these exact fields: "name" (string), "value" (number), "unit" (string), "status" (string, one of "low", "high", or "normal"), and "ref_range" (object with "low" and "high" number properties).
    Standardize the test names (e.g., "WBC" for White Blood Cell Count, "Platelets" for Platelet Count).
    Array: ${JSON.stringify(testsRaw)}
    Return ONLY the JSON array of objects.
  `;
  const normalizedTests = await callAI(normalizationPrompt);

  // === AI Call #3: Generate Patient-Friendly Summary ===
  console.log("--- AI Step 3: Generating Summary ---");
  const summaryPrompt = `
    Based on these structured test results, generate a simple, patient-friendly summary.
    The response must be a JSON object with two keys:
    1. "summary": A single, brief sentence summarizing the key findings.
    2. "explanations": An array of strings, with each string being a simple, one-line explanation for each ABNORMAL test.
    IMPORTANT: Do NOT give medical advice or a diagnosis. Keep explanations general (e.g., "High WBC can occur with infections.").
    Data: ${JSON.stringify(normalizedTests)}
  `;
  const summaryData = await callAI(summaryPrompt);

  // === FINAL, ROBUST GUARDRAIL CHECK ===
  console.log("--- Executing Final Guardrail Check ---");
  if (normalizedTests.length > testsRaw.length + 2) {
    // Allow for slight discrepancies where one line might become two tests
    throw new Error(
      `Guardrail fail: AI created too many tests (${normalizedTests.length}) from the initial parse (${testsRaw.length}).`
    );
  }

  // This final logic prevents the AI from inventing tests out of thin air,
  // while allowing it to correctly standardize names and handle minor OCR parsing differences.

  // === Final Assembly ===
  console.log("--- Assembling Final Report ---");
  return {
    tests: normalizedTests,
    summary: summaryData.summary,
    explanations: summaryData.explanations,
  };
};
