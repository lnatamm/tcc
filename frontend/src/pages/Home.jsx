import React, { useState } from 'react';
import './Home.css';
import { useTurmasComAtletas } from '../hooks/useApi';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';

const Home = () => {
  const [expandedTurma, setExpandedTurma] = useState(null);
  const { data: turmas = [], isLoading: loading, error } = useTurmasComAtletas();
  
  const userName = "Derek";

  const toggleTurma = (turmaId) => {
    setExpandedTurma(expandedTurma === turmaId ? null : turmaId);
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
        <button className="action-card">Oto canto</button>
        <button className="action-card">Oto canto</button>
        <button className="action-card">Oto canto</button>
        <button className="action-card">Oto canto</button>
      </div>

      <div className="turmas-section">
        <h3 className="section-title">TURMAS</h3>
        
        {loading && (
          <div className="loading-message">Carregando turmas...</div>
        )}
        
        {error && (
          <div className="error-message">
            {error?.message || 'Não foi possível carregar as turmas. Tente novamente mais tarde.'}
          </div>
        )}
        
        {!loading && !error && turmas.length === 0 && (
          <div className="empty-message">Nenhuma turma encontrada</div>
        )}
        
        {!loading && !error && turmas.map((turma) => (
          <div key={turma.id} className="turma-card">
            <div 
              className="turma-header"
              onClick={() => toggleTurma(turma.id)}
            >
              <span className="turma-nome">{turma.nome}</span>
              <span className="turma-toggle">
                {expandedTurma === turma.id ? '∧' : '∨'}
              </span>
            </div>
            
            {expandedTurma === turma.id && (
              <div className="turma-content">
                {turma.atletas && turma.atletas.length > 0 ? (
                  turma.atletas.map((atleta) => (
                    <div key={atleta.id} className="cara-item">
                      <div className="cara-avatar"></div>
                      <span className="cara-nome">{atleta.nome}</span>
                      <button className="visualizar-btn">visualizar</button>
                    </div>
                  ))
                ) : (
                  <div className="empty-atletas">Nenhum atleta matriculado</div>
                )}
              </div>
            )}
          </div>
        ))}

        <button className="adicionar-turma-btn">Adicionar turma</button>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn">
          <HomeIcon sx={{ fontSize: 28 }} />
        </button>
        <button className="nav-btn">
          <ChatIcon sx={{ fontSize: 28 }} />
        </button>
        <button className="nav-btn">
          <PersonIcon sx={{ fontSize: 28 }} />
        </button>
      </div>
    </div>
  );
};

export default Home;
