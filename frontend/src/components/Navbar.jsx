import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TodayIcon from '@mui/icons-material/Today';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventIcon from '@mui/icons-material/Event';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const normalizeUserTypeName = (raw) => {
  const value = String(raw || '').trim().toLowerCase();

  if (['athlete', 'atleta', 'aluno'].includes(value)) return 'athlete';
  if (['coach', 'treinador', 'professor'].includes(value)) return 'coach';

  return value;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAthlete = normalizeUserTypeName(user?.user_type_name) === 'athlete';

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
        <div className="sidebar-name">{user?.nome || 'My Profile'}</div>
      </div>

      <nav className="sidebar-nav">
        {isAthlete && (
          <Link
            to="/home"
            className={`sidebar-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <HomeIcon sx={{ fontSize: 20 }} />
            <span>Home</span>
          </Link>
        )}

        {!isAthlete && (
          <>
            <Link
              to="/athlete-control"
              className={`sidebar-link ${location.pathname === '/athlete-control' ? 'active' : ''}`}
            >
              <PersonIcon sx={{ fontSize: 20 }} />
              <span>Athletes & Teams</span>
            </Link>

            <Link
              to="/routines"
              className={`sidebar-link ${location.pathname === '/routines' ? 'active' : ''}`}
            >
              <TodayIcon sx={{ fontSize: 20 }} />
              <span>Routines & Exercises</span>
            </Link>

            <Link
              to="/today"
              className={`sidebar-link ${location.pathname === '/today' ? 'active' : ''}`}
            >
              <CalendarTodayIcon sx={{ fontSize: 20 }} />
              <span>Today</span>
            </Link>

            <Link
              to="/dashboard"
              className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <DashboardIcon sx={{ fontSize: 20 }} />
              <span>Dashboard</span>
            </Link>
          </>
        )}

        <Link
          to="/physical-tests"
          className={`sidebar-link ${location.pathname === '/physical-tests' ? 'active' : ''}`}
        >
          <FactCheckIcon sx={{ fontSize: 20 }} />
          <span>Physical Tests</span>
        </Link>

        {!isAthlete && (
          <>
            <Link
              to="/events"
              className={`sidebar-link ${location.pathname === '/events' ? 'active' : ''}`}
            >
              <EventIcon sx={{ fontSize: 20 }} />
              <span>Events</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ fontWeight: 700, borderRadius: 2, py: 1, textTransform: 'none' }}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Navbar;
