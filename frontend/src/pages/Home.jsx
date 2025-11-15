import React, { useState, useEffect } from 'react';
import './Home.css';
import { useTurmasComAtletas } from '../hooks/useApi';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import AdicionarTurmaModal from '../components/AdicionarTurmaModal';
import { Avatar } from '@mui/material';
import api from '../api';

const Home = () => {
  const [expandedTurma, setExpandedTurma] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [atletaFotos, setAtletaFotos] = useState({});
  const { data: turmas = [], isLoading: loading, error } = useTurmasComAtletas();
  
  const userName = "Derek";

  // Carregar fotos dos atletas como blob URLs
  useEffect(() => {
    const loadAtletaFotos = async () => {
      const fotos = {};
      for (const turma of turmas) {
        if (turma.atletas) {
          for (const atleta of turma.atletas) {
            try {
              const response = await api.get(`/atletas/${atleta.id}/foto`, {
                responseType: 'blob'
              });
              const imageUrl = URL.createObjectURL(response.data);
              fotos[atleta.id] = imageUrl;
            } catch (err) {
              console.error(`Erro ao carregar foto do atleta ${atleta.id}:`, err);
            }
          }
        }
      }
      setAtletaFotos(fotos);
    };

    if (turmas.length > 0) {
      loadAtletaFotos();
    }

    // Cleanup: revogar URLs de blob quando o componente desmontar
    return () => {
      Object.values(atletaFotos).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [turmas]);

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
                      <Avatar
                        src={atletaFotos[atleta.id]}
                        alt={atleta.nome}
                        sx={{ width: 40, height: 40 }}
                      >
                        {atleta.nome.charAt(0).toUpperCase()}
                      </Avatar>
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

        <button 
          className="adicionar-turma-btn"
          onClick={() => setModalOpen(true)}
        >
          Adicionar turma
        </button>
      </div>

      <AdicionarTurmaModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

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
