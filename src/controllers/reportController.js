import { performOCR } from "../services/ocrService.js";
import { getSimplifiedReport } from "../services/aiService.js";

export const simplifyReport = async (req, res) => {
  try {
    let rawText;

    // 1. Determine input and get raw text
    if (req.file) {
      console.log("Image received. Processing with OCR service...");
      // We will build this service next. For now, it's a placeholder.
      rawText = await performOCR(req.file.buffer);
    } else if (req.body && req.body.text) {
      console.log("Raw text received.");
      rawText = req.body.text;
    } else {
      // If no valid input, send an error
      return res.status(400).json({
        status: "error",
        message:
          'No file uploaded or text provided. Please use the "reportImage" key for files or a "text" key in the JSON body.',
      });
    }

    // 2. Pass the raw text to the AI service (placeholder for now)
    console.log("Sending text to AI service...");
    const simplifiedReport = await getSimplifiedReport(rawText);

    // 3. Send the final report back to the client
    res.status(200).json({
      status: "success",
      report: simplifiedReport,
    });
  } catch (error) {
    console.error("Error in simplifyReport controller:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
