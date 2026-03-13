import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TodayIcon from '@mui/icons-material/Today';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Hide the sidebar on the login / register pages
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}</div>
        <div className="sidebar-name">{user?.nome || 'Meu perfil'}</div>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/home"
          className={`sidebar-link ${location.pathname === '/home' ? 'active' : ''}`}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
          <span>Home</span>
        </Link>

        <Link
          to="/routines"
          className={`sidebar-link ${location.pathname === '/routines' ? 'active' : ''}`}
        >
          <TodayIcon sx={{ fontSize: 20 }} />
          <span>Rotinas e exercícios</span>
        </Link>

        <Link
          to="/today"
          className={`sidebar-link ${location.pathname === '/today' ? 'active' : ''}`}
        >
          <CalendarTodayIcon sx={{ fontSize: 20 }} />
          <span>Hoje</span>
        </Link>

        <Link
          to="/dashboard"
          className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <DashboardIcon sx={{ fontSize: 20 }} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/athlete-control"
          className={`sidebar-link ${location.pathname === '/athlete-control' ? 'active' : ''}`}
        >
          <PersonIcon sx={{ fontSize: 20 }} />
          <span>Alunos e turmas</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" type="button" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
