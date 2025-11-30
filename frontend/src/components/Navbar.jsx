import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TodayIcon from '@mui/icons-material/Today';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo"></div>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <HomeIcon sx={{ fontSize: 24 }} />
          </Link>
          <Link 
            to="/today" 
            className={`navbar-link ${location.pathname === '/today' ? 'active' : ''}`}
          >
            <TodayIcon sx={{ fontSize: 24 }} />
          </Link>
          <Link 
            to="/chat" 
            className={`navbar-link ${location.pathname === '/chat' ? 'active' : ''}`}
          >
            <ChatIcon sx={{ fontSize: 24 }} />
          </Link>
          <Link 
            to="/perfil" 
            className={`navbar-link ${location.pathname === '/perfil' ? 'active' : ''}`}
          >
            <PersonIcon sx={{ fontSize: 24 }} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
