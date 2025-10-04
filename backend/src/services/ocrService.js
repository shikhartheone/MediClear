// src/services/ocrService.js
import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initializes a client. It will automatically use the credentials you just set up.
const client = new ImageAnnotatorClient();

export const performOCR = async (imageBuffer) => {
  console.log("--- OCR Service Called with Google Cloud Vision ---");

  // Prepare the request for the Vision API
  const request = {
    image: {
      content: imageBuffer,
    },
  };

  try {
    // This specific method is designed to read text from documents
    const [result] = await client.documentTextDetection(request);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      throw new Error("Google Cloud Vision could not detect any text.");
    }

    console.log("Google Cloud Vision OCR finished successfully.");
    console.log(result);
    return fullTextAnnotation.text;
  } catch (error) {
    console.error("Error during Google Cloud Vision OCR:", error);
    throw new Error("Failed to process image with Cloud Vision API.");
  }
};
