import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { authService } from '../services/apiService';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/perfil');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <img src="https://via.placeholder.com/120" alt="User Profile" />
          </div>
          <button 
            className="edit-profile-btn"
            onClick={handleEditProfile}
            title="Editar perfil"
          >
            <EditIcon sx={{ fontSize: 16 }} />
            Editar perfil
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <Link 
            to="/routines" 
            className={`sidebar-link ${location.pathname === '/routines' ? 'active' : ''}`}
          >
            <EventNoteIcon sx={{ fontSize: 24 }} />
            <span>Rotinas e exercícios</span>
          </Link>
          
          <Link 
            to="/" 
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <DashboardIcon sx={{ fontSize: 24 }} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/athletes" 
            className={`sidebar-link ${location.pathname === '/athletes' ? 'active' : ''}`}
          >
            <PeopleIcon sx={{ fontSize: 24 }} />
            <span>Alunos e turmas</span>
          </Link>
          
          <Link 
            to="/today" 
            className={`sidebar-link ${location.pathname === '/today' ? 'active' : ''}`}
          >
            <TodayIcon sx={{ fontSize: 24 }} />
            <span>Exercícios do dia</span>
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Sair da conta"
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
