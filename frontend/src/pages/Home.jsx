import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [expandedTurma, setExpandedTurma] = useState(null);
  
  const userName = "Derek";
  
  const turmas = [
    {
      id: 1,
      nome: "Nome da turma",
      caras: [
        { id: 1, nome: "Nome do cara" },
        { id: 2, nome: "Nome do cara" },
        { id: 3, nome: "Nome do cara" }
      ]
    },
    {
      id: 2,
      nome: "Nome da turma",
      caras: []
    }
  ];

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
        
        {turmas.map((turma) => (
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
                {turma.caras.map((cara) => (
                  <div key={cara.id} className="cara-item">
                    <div className="cara-avatar"></div>
                    <span className="cara-nome">{cara.nome}</span>
                    <button className="visualizar-btn">visualizar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button className="adicionar-turma-btn">Adicionar turma</button>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn">
          <span className="nav-icon">🏠</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">💬</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">👤</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
