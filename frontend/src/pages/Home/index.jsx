import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import {useTeamsWithAthletes } from '../../hooks/useApi';
import AddTeamModal from '../../components/AddTeamModal';
import AthleteRoutinesModal from '../../components/AthleteRoutinesModal';
import { Avatar } from '@mui/material';
import api from '../../api';

const Home = () => {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [routinesModalOpen, setRoutinesModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athletePhotos, setAthletePhotos] = useState({});
  const { data: teams = [], isLoading: loading, error } = useTeamsWithAthletes();
  const navigate = useNavigate();
  
  const userName = "Derek";

  // Load athlete photos as blob URLs
  useEffect(() => {
    const loadAthletePhotos = async () => {
      const photos = {};
      for (const team of teams) {
        if (team.athletes) {
          for (const athlete of team.athletes) {
            try {
              const response = await api.get(`/athletes/${athlete.id}/photo`, {
                responseType: 'blob'
              });
              const imageUrl = URL.createObjectURL(response.data);
              photos[athlete.id] = imageUrl;
            } catch (err) {
              console.error(`Error loading photo for athlete ${athlete.id}:`, err);
            }
          }
        }
      }
      setAthletePhotos(photos);
    };

    if (teams.length > 0) {
      loadAthletePhotos();
    }

    // Cleanup: revogar URLs de blob quando o componente desmontar
    return () => {
      Object.values(athletePhotos).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [teams]);
  const toggleTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleViewRoutines = (athlete) => {
    setSelectedAthlete(athlete);
    setRoutinesModalOpen(true);
  };

  const handleCloseRoutines = () => {
    setRoutinesModalOpen(false);
    setSelectedAthlete(null);
  };

  return (
    <div className="home">
      <div className="home-header">
        <div className="user-greeting">
          <div className="user-avatar"></div>
          <h2>Bom dia, {userName}</h2>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-card" onClick={() => navigate('/routines')}>Routines</button>
        <button className="action-card">Sports</button>
        <button className="action-card">Exercises</button>
        <button className="action-card">Dashboard</button>
      </div>

      <div className="teams-section">
        <h3 className="section-title">TEAMS</h3>
        
        {loading && (
          <div className="loading-message">Loading teams...</div>
        )}
        
        {error && (
          <div className="error-message">
            {error?.message || 'Unable to load teams. Please try again later.'}
          </div>
        )}
        
        {!loading && !error && teams.length === 0 && (
          <div className="empty-message">No teams found</div>
        )}
        
        {!loading && !error && teams.map((team) => (
          <div key={team.id} className="team-card">
            <div 
              className="team-header"
              onClick={() => toggleTeam(team.id)}
            >
              <span className="team-name">{team.name}</span>
              <span
                className="team-toggle"
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Chevron icon — rotates smoothly when expanded */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  style={{
                    transform: expandedTeam === team.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 160ms ease',
                    display: 'block',
                    color: '#555'
                  }}
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="currentColor" />
                </svg>
              </span>
            </div>
            
            {expandedTeam === team.id && (
              <div className="team-content">
                {team.athletes && team.athletes.length > 0 ? (
                  team.athletes.map((athlete) => (
                    <div key={athlete.id} className="athlete-item">
                      <Avatar
                        src={athletePhotos[athlete.id]}
                        alt={athlete.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        {athlete.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <span className="athlete-name">{athlete.name}</span>
                      <button 
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRoutines(athlete);
                        }}
                      >
                        view
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-athletes">No athletes enrolled</div>
                )}
              </div>
            )}
          </div>
        ))}

        <button 
          className="add-team-btn"
          onClick={() => setModalOpen(true)}
        >
          Add Team
        </button>
      </div>

      <AddTeamModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AthleteRoutinesModal
        open={routinesModalOpen}
        onClose={handleCloseRoutines}
        athlete={selectedAthlete}
        userName={userName}
      />
    </div>
  );
};

export default Home;
