import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
