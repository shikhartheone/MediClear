import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const callAI = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
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

/**
 * Main service function to orchestrate the AI-powered simplification of a medical report.
 */
export const getSimplifiedReport = async (rawText) => {
  // === AI Call #1: Parse Raw Text ===
  console.log("--- AI Step 1: Parsing Raw Text ---");
  const parsingPrompt = `
    You are an expert data extraction system specialized in parsing messy OCR text from medical reports.
    Your task is to identify and extract every distinct line that represents a medical test result.

    RULES:
    - Correct obvious OCR spelling errors (e.g., "Hemglobin" -> "Hemoglobin").
    - Ignore all irrelevant text, headers, footers, and patient information.
    - The output MUST be a JSON object with a single key: "tests_raw", which is an array of strings.

    EXAMPLE INPUT TEXT: "CBC: Hemglobin 10.2 g/dL (Low) WBC 11200/uL (Hgh)"
    EXAMPLE OUTPUT JSON: {"tests_raw": ["Hemoglobin 10.2 g/dL (Low)", "WBC 11200/uL (High)"]}

    Text to process:
    """${rawText}"""
  `;
  const parsedResult = await callAI(parsingPrompt);
  const testsRaw = parsedResult.tests_raw;
  if (!testsRaw || !Array.isArray(testsRaw) || testsRaw.length === 0) {
    throw new Error("AI failed to parse any tests from the raw text.");
  }

  // === AI Call #2: Normalize Data (without status) ===
  console.log("--- AI Step 2: Normalizing Tests ---");
  const normalizationPrompt = `
    You are a laboratory data normalization engine.
    For each raw string in the input array, convert it into a structured JSON object.

    RULES:
    - The object MUST have these exact fields: "name" (standardized string), "value" (number), "unit" (string), and "ref_range" (object with "low" and "high" number properties).
    - CRITICAL: DO NOT include a "status" field in your output. The status will be calculated separately.
    - Pay close attention to decimal points.
    - Standardize common test names (e.g., "Total Leucocyte Count" -> "WBC").
    - The final output must be a single JSON object with a key "tests".

    Input Array: ${JSON.stringify(testsRaw)}
  `;
  const normalizedResult = await callAI(normalizationPrompt);
  let testsWithoutStatus = normalizedResult.tests;
  if (!testsWithoutStatus || !Array.isArray(testsWithoutStatus)) {
    throw new Error(
      "AI normalization step did not return a valid 'tests' array."
    );
  }

  // === Code Logic: Determine Status (Most Reliable Method) ===
  console.log("--- Post-Processing: Determining Test Statuses ---");
  const normalizedTests = testsWithoutStatus.map((test) => {
    let status = "normal";
    // Only determine status if we have the necessary data
    if (test.ref_range && typeof test.value === "number") {
      if (test.value < test.ref_range.low) {
        status = "low";
      } else if (test.value > test.ref_range.high) {
        status = "high";
      }
    }
    return { ...test, status }; // Add the correctly calculated status
  });

  // === AI Call #3: Generate Patient-Friendly Summary ===
  console.log("--- AI Step 3: Generating Summary ---");
  const summaryPrompt = `
    You are a compassionate medical scribe who explains complex results to patients in simple, empathetic terms.
    Based on the provided structured test data, generate a patient-friendly summary.
    
    CRITICAL SAFETY RULES:
    - DO NOT provide any diagnosis, medical advice, or treatment recommendations.
    - Your language must be reassuring and easy for a non-medical person to understand.
    - The output MUST be a JSON object with two keys: "summary" and "explanations".
    - "summary": A single, brief sentence that mentions the key ABNORMAL findings.
    - "explanations": An array of one-line strings, where each string explains a single abnormal result in simple terms.

    Data: ${JSON.stringify(normalizedTests)}
  `;
  const summaryData = await callAI(summaryPrompt);

  // === Guardrail Check ===
  if (normalizedTests.length > testsRaw.length + 2) {
    throw new Error(`Guardrail fail: AI created too many tests.`);
  }

  // === Final Assembly ===
  console.log("--- Assembling Final Report ---");
  return {
    tests: normalizedTests,
    summary: summaryData.summary,
    explanations: summaryData.explanations,
  };
};
