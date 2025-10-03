// src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Card, Button, TextField, CircularProgress,
  Box, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, List, ListItem, ListItemText
} from '@mui/material';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';
import './App.css'; // We'll keep this for a few custom styles

import Lottie from 'react-lottie-player';
import lottieJson from './assets/animation.json';



function App() {
  const [tabValue, setTabValue] = useState(0); // 0 for upload, 1 for paste
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedFile(null);
    setPastedText('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setReport(null);

    const formData = new FormData();
    let config = {};
    let data = {};

    if (tabValue === 0 && selectedFile) {
      formData.append('reportImage', selectedFile);
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
      data = formData;
    } else if (tabValue === 1 && pastedText) {
      config = { headers: { 'Content-Type': 'application/json' } };
      data = { text: pastedText };
    } else {
      setError('Please provide an input.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/reports/simplify', data, config);
      setReport(response.data.report);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ my: 5 }}>
      <Box textAlign="center" mb={5}>
        <Typography
  variant="h3"
  component="h1"
  fontWeight="bold"
sx={{
  background: 'linear-gradient(90deg, rgba(138, 43, 226, 0.9), rgba(72, 61, 139, 0.9))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}

>
  MediClear
</Typography>
        <Typography variant="h6" color="text.secondary">
          Your AI-Powered Medical Report Simplifier
        </Typography>
      </Box>

      <Card sx={{ p: 4, borderRadius: 4 }}>
        {report ? (
          // --- RESULTS DISPLAY ---
          <Box>
            <Typography variant="h4" color="primary" textAlign="center" mb={3}>Simplified Report</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Typography>{report.summary}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Key Explanations</Typography>
              <List dense>
                {report.explanations.map((exp, index) => (
                  <ListItem key={index}><ListItemText primary={exp} /></ListItem>
                ))}
              </List>
            </Paper>
            <Typography variant="h6" gutterBottom>Full Test Results</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.tests.map((test, index) => (
                    <TableRow key={index} sx={{
                      backgroundColor: (test.status === 'low' || test.status === 'high') ? '#fffbe6' : 'inherit'
                    }}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.value}</TableCell>
                      <TableCell>{test.unit}</TableCell>
                      <TableCell>{test.status}</TableCell>
                      <TableCell>{`${test.ref_range.low} - ${test.ref_range.high}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="outlined" onClick={handleReset} fullWidth sx={{ mt: 4 }}>
              Analyze Another Report
            </Button>
          </Box>
        ) : (
          // --- INPUT FORM ---
          <Box component="form" onSubmit={handleSubmit}>
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
              <Tab icon={<FiUploadCloud />} iconPosition="start" label="Upload Image" />
              <Tab icon={<FiFileText />} iconPosition="start" label="Paste Text" />
            </Tabs>

            {tabValue === 0 && (
              <Box textAlign="center" my={4}>
                <Button component="label" variant="outlined" startIcon={<FiUploadCloud />}>
                  Select File
                  <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                </Button>
                {selectedFile && <Typography mt={1}>{selectedFile.name}</Typography>}
              </Box>
            )}

            {tabValue === 1 && (
              <TextField
                multiline
                rows={10}
                fullWidth
                label="Pasted Report Text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                sx={{ my: 2 }}
              />
            )}
            
            {/* {loading ? (
              <Box textAlign="center" my={2}><CircularProgress /></Box>
            ) : (
              <Button type="submit" variant="contained" size="large" fullWidth>
                Simplify Report
              </Button>
            )} */}

            {loading ? (
  <Box textAlign="center" my={2}>
    {/* Replace CircularProgress with this */}
    <Lottie
      loop
      animationData={lottieJson}
      play
      style={{ width: 150, height: 100, margin: 'auto' }}
    />
    <Typography>Analyzing your report...</Typography>
  </Box>
) : (
  <Button type="submit" variant="contained" size="large" fullWidth>
                Simplify Report
              </Button>
            )}

            {error && <Typography color="error" mt={2}>{error}</Typography>}
          </Box>
        )}
      </Card>
    </Container>
  );
}

export default App;