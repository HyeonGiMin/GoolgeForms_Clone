import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import Responses from './pages/Responses';

const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7',
    },
    secondary: {
      main: '#4caf50',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form/:id" element={<FormBuilder />} />
          <Route path="/form/edit/:id" element={<FormBuilder />} />
          <Route path="/preview/:id" element={<FormPreview />} />
          <Route path="/form/:id/responses" element={<Responses />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
