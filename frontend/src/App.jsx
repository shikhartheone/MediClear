import { useState } from 'react';
import axios from 'axios'; 
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  setError('');
  setReport(null);

  const formData = new FormData();
  let config = {};
  let data = {};

  if (selectedFile) {
    formData.append('reportImage', selectedFile);
    config = { headers: { 'Content-Type': 'multipart/form-data' } };
    data = formData;
  } else if (pastedText) {
    config = { headers: { 'Content-Type': 'application/json' } };
    data = { text: pastedText };
  } else {
    setError('Please select a file or paste text.');
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/reports/simplify', data, config);
    setReport(response.data.report);
  } catch (err) {
    setError('An error occurred. Please check the console and make sure your backend is running.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <h1>Medical Report Simplifier</h1>
      <p>Upload an image of a medical report or paste its text below.</p>

      <form className="upload-form">
        <div className="input-group">
          <label htmlFor="file-upload">Upload Image</label>
          <input id="file-upload" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
        </div>
        <div className="separator">OR</div>
        <div className="input-group">
          <label htmlFor="text-paste">Paste Text</label>
          <textarea
            id="text-paste"
            rows="10"
            placeholder="Paste medical report text here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Simplify Report'}
        </button>
      </form>
    </div>
  );
}

export default App;
