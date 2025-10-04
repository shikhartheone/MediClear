# MediClear: AI Medical Report Simplifier

This is a full-stack web application designed to demystify complex medical lab reports. It leverages an OCR engine and a multi-step AI pipeline to transform dense, jargon-filled reports (from images or text) into simple, patient-friendly summaries.

![MediClear UI Screenshot]
*(Suggestion: Add a screenshot of your final application UI here.)*

## Features

- **Full-Stack Architecture**: A complete application with a React frontend and a Node.js backend.
- **OCR Integration**: Utilizes **Tesseract.js** to perform Optical Character Recognition, extracting text directly from uploaded report images.
- **Multi-Step AI Pipeline**: Employs the **Google Gemini API** in a three-step chain to parse, normalize, and summarize the extracted medical data.
- **Robust Logic & Safety**: The backend uses deterministic code for logical checks and includes safety guardrails to prevent AI hallucinations.
- **Polished UI/UX**: The entire application is built with **MUI** and themed to provide a professional and intuitive user experience.

## Tech Stack

| Area          | Technologies                                                    |
| :------------ | :-------------------------------------------------------------- |
| **Frontend** | React, Vite, MUI (Material-UI), Axios, Lottie                   |
| **Backend** | Node.js, Express.js, Tesseract.js                               |
| **Cloud/AI** | Google Gemini API                                               |
| **Tools** | Git, GitHub, VS Code, Postman                                   |

## Architecture

The project is structured as a monorepo with separate `frontend` and `backend` directories. The backend service processes requests in a sequential pipeline:

1.  **Request Received**: The `reportController` receives a request.
2.  **OCR Processing**: If an image is provided, the `ocrService` uses Tesseract.js to extract text.
3.  **AI Pipeline**: The `aiService` runs its three-step process (Parse -> Normalize -> Summarize) using the Gemini API.
4.  **Response Sent**: The final, complete report is sent back to the client.

## Local Setup and Installation

### Prerequisites
* Node.js (v18 or later)
* A Google AI API Key

### Backend Setup
1.  **Clone the repository.**
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create an environment file:** Create a file named `.env` in the `backend` folder and add your Google AI API key:
    ```
    AI_API_KEY="your_google_ai_api_key_here"
    ```
5.  **Start the backend server:**
    ```bash
    node index.js
    ```
    The server will be running at `http://localhost:3000`.

### Frontend Setup
1.  **Open a new terminal.**
2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the frontend server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## API Usage Examples

The API has a single endpoint for processing reports.

* **Endpoint**: `POST /api/reports/simplify`

### Submitting Raw Text
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"text": "HEMOGLOBIN 15 g/dl 13 - 17"}' \
http://localhost:3000/api/reports/simplify

### Submitting Image
curl -X POST -F "reportImage=@/path/to/your/report.jpg" \
http://localhost:3000/api/reports/simplify
