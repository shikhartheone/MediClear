import { createWorker } from "tesseract.js";

export const performOCR = async (imageBuffer) => {
  console.log("--- Real OCR Service Called ---");
  let worker;
  try {
    // 1. Create and initialize the Tesseract worker
    // The first run will be slow as it downloads the language model.
    worker = await createWorker("eng");

    // 2. Perform OCR on the image buffer
    console.log("Recognizing text from image...");
    const result = await worker.recognize(imageBuffer);
    console.log("OCR finished.");

    // 3. Return the extracted text
    return result.data.text;
  } catch (error) {
    console.error("Error during OCR processing:", error);
    throw error; // Propagate the error to the controller
  } finally {
    // 4. Terminate the worker to free up resources
    if (worker) {
      await worker.terminate();
      console.log("OCR worker terminated.");
    }
  }
};
