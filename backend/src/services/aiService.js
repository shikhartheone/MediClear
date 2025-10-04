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

export const getSimplifiedReport = async (rawText) => {
  // === AI Call #1: Parse Raw Text (with Few-Shot Example) ===
  console.log("--- AI Step 1: Parsing Raw Text ---");
  const parsingPrompt = `
    You are an expert data extraction system specialized in parsing messy OCR text from medical reports.
    Your task is to identify and extract every distinct line that represents a medical test result, ignoring noise and watermarks.

    Here is an example of how to handle messy text:
    - EXAMPLE INPUT TEXT: "Lymphocytes\\n' + '31\\n' + 'Drlogy.c\\n' + '20-40"
    - EXAMPLE CORRECT OUTPUT: "Lymphocytes 31 20-40"

    RULES:
    - Correct obvious OCR spelling errors.
    - Ignore irrelevant text, headers, footers, and watermarks like "Drlogy.c".
    - Combine broken lines into a single, coherent test result line.
    - The output MUST be a JSON object with a single key: "tests_raw", which is an array of strings.

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
    You are a laboratory data normalization engine. For each raw string in the input array, convert it into a structured JSON object.

    RULES:
    - The object MUST have these fields: "name", "value" (number), "unit", and "ref_range" (object with "low" and "high" numbers).
    - CRITICAL: DO NOT include a "status" field.
    - Pay close attention to decimal points in values and reference ranges.
    - Standardize test names (e.g., "Total WBC count" -> "WBC").
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
    if (
      test.ref_range &&
      typeof test.value === "number" &&
      test.ref_range.low != null &&
      test.ref_range.high != null
    ) {
      if (test.value < test.ref_range.low) {
        status = "low";
      } else if (test.value > test.ref_range.high) {
        status = "high";
      }
    }
    return { ...test, status };
  });

  // === AI Call #3: Generate Patient-Friendly Summary ===
  console.log("--- AI Step 3: Generating Summary ---");
  const summaryPrompt = `
    You are a compassionate medical scribe. Based on the data, generate a patient-friendly summary.
    
    CRITICAL SAFETY RULES:
    - DO NOT provide any diagnosis or medical advice.
    - Keep the language simple and reassuring.
    - The output MUST be a JSON object with two keys: "summary" and "explanations".
    - "summary": A single sentence summarizing the key ABNORMAL findings.
    - "explanations": An array of one-line strings explaining each abnormal result in simple terms.

    Data: ${JSON.stringify(normalizedTests)}
  `;
  const summaryData = await callAI(summaryPrompt);

  // === Final Assembly ===
  console.log("--- Assembling Final Report ---");
  return {
    tests: normalizedTests,
    summary: summaryData.summary,
    explanations: summaryData.explanations,
  };
};
