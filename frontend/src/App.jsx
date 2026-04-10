import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import HomeGate from './pages/HomeGate';
import AthleteControl from './pages/AthleteControl';
import AthleteDetails from './pages/AthleteDetails';
import TodayRoutines from './pages/TodayRoutines';
import RoutinesPage from './pages/RoutinesPage';
import PhysicalTestsPage from './pages/PhysicalTestsPage';
import EventsPage from './pages/EventsPage';
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
                    <HomeGate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/athlete-control"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
                    <AthleteControl />
                  </PrivateRoute>
                }
              />
              <Route
                path="/athletes/:athleteId"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
                    <AthleteDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/routines"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
                    <RoutinesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/today"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
                    <TodayRoutines />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
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
              <Route
                path="/events"
                element={
                  <PrivateRoute allowUserTypes={['coach']}>
                    <EventsPage />
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