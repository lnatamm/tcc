import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home/index';
import TodayRoutines from './pages/TodayRoutines/index';
import RoutinesPage from './pages/RoutinesPage/index';
import Dashboard from './pages/Dashboard/index';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/today" element={<TodayRoutines />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;