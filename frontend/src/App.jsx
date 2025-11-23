import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TodayRoutines from './pages/TodayRoutines';
import RoutinesPage from './pages/RoutinesPage';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/today" element={<TodayRoutines />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;