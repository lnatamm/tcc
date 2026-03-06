import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TodayRoutines from './pages/TodayRoutines';
import RoutinesPage from './pages/RoutinesPage';
import AthletesControl from './pages/AthletesControl';
import Perfil from './pages/Perfil';
import Login from './pages/Login';
import Register from './pages/Register';
import { authService } from './services/apiService';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a app
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <div className="App">
        <AppContent
          isAuthenticated={isAuthenticated}
          setAuth={setIsAuthenticated}
        />
      </div>
    </Router>
  );
};

function AppContent({ isAuthenticated, setAuth }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  return (
    <>
      {isAuthenticated && !isAuthPage && <Sidebar />}
      <div className={`main-content ${isAuthenticated && !isAuthPage ? 'with-sidebar' : ''}`}>
        <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register setAuth={setAuth} />} />
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/routines" element={<PrivateRoute element={<RoutinesPage />} />} />
        <Route path="/today" element={<PrivateRoute element={<TodayRoutines />} />} />
        <Route path="/athletes" element={<PrivateRoute element={<AthletesControl />} />} />
        <Route path="/perfil" element={<PrivateRoute element={<Perfil />} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;