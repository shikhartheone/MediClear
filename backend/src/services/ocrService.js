import { createWorker } from "tesseract.js";

export const performOCR = async (imageBuffer) => {
  console.log("--- Real OCR Service Called ---");
  let worker;
  try {
    worker = await createWorker("eng");

    // ADD THIS LINE to improve table recognition.
    // This tells Tesseract to assume a single uniform block of text.
    await worker.setParameters({
      tessedit_pageseg_mode: "6",
    });

    console.log("Recognizing text from image with improved settings...");
    const result = await worker.recognize(imageBuffer);
    console.log("OCR finished.");
    console.log(result);

    return result.data.text;
  } catch (error) {
    console.error("Error during OCR processing:", error);
    throw error;
  } finally {
    if (worker) {
      await worker.terminate();
      console.log("OCR worker terminated.");
    }
  }
};
