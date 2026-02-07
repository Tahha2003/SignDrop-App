import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LawyerDashboard from './components/LawyerDashboard';
import SignPage from './components/SignPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LawyerDashboard />} />
        <Route path="/sign/:token" element={<SignPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
