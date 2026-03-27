import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import AthleteControl from './pages/AthleteControl';
import TodayRoutines from './pages/TodayRoutines';
import RoutinesPage from './pages/RoutinesPage';
import PhysicalTestsPage from './pages/PhysicalTestsPage';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="App-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/athlete-control"
                element={
                  <PrivateRoute>
                    <AthleteControl />
                  </PrivateRoute>
                }
              />
              <Route
                path="/routines"
                element={
                  <PrivateRoute>
                    <RoutinesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/today"
                element={
                  <PrivateRoute>
                    <TodayRoutines />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/physical-tests"
                element={
                  <PrivateRoute>
                    <PhysicalTestsPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;