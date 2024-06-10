// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataForm from './components/dataForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DataForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;