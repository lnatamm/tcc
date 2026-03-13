import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { useTeamsWithAthletes } from '../../hooks/useApi';
import { Avatar } from '@mui/material';

const AthleteControl = () => {
  const navigate = useNavigate();
  const { data: teams = [], isLoading, error } = useTeamsWithAthletes();
  const [search, setSearch] = useState('');

  const athletes = useMemo(() => {
    const list = [];

    teams.forEach((team) => {
      (team.athletes || []).forEach((athlete) => {
        list.push({
          ...athlete,
          teamName: team.name || '—',
          sportName: team.sport_name || '—',
          status: athlete.status || 'Ativo',
        });
      });
    });

    return list;
  }, [teams]);

  const filteredAthletes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return athletes;

    return athletes.filter((athlete) => {
      return (
        athlete.name?.toLowerCase().includes(query) ||
        String(athlete.id).includes(query) ||
        athlete.teamName?.toLowerCase().includes(query) ||
        athlete.sportName?.toLowerCase().includes(query)
      );
    });
  }, [search, athletes]);

  const totalStudents = athletes.length;
  const totalTeams = teams.length;
  const activeStudents = athletes.filter((a) => a.status === 'Ativo').length;

  return (
    <div className="athlete-control">
      <header className="athlete-header">
        <div className="athlete-title">Controle de alunos e turmas</div>

        <div className="athlete-cards">
          <div className="stat-card">
            <div className="stat-label">Total de alunos</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Alunos ativos</div>
            <div className="stat-value">{activeStudents}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total de turmas</div>
            <div className="stat-value">{totalTeams}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total de alunos</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
        </div>
      </header>

      <section className="athlete-controls">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquise por nome ou ID do atleta"
          />
        </div>
        <button className="add-athlete-btn" onClick={() => navigate('/register')}>
          Adicionar aluno
        </button>
      </section>

      <section className="athlete-table-wrapper">
        <table className="athlete-table">
          <thead>
            <tr>
              <th>ALUNO</th>
              <th>TURMA</th>
              <th>MODALIDADE</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  Carregando dados...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  Falha ao carregar dados. Tente novamente.
                </td>
              </tr>
            ) : filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filteredAthletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="student-cell">
                    <Avatar className="student-avatar">
                      {athlete.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="student-text">
                      <div className="student-name">{athlete.name}</div>
                      <div className="student-sub">ID do aluno: {athlete.id}</div>
                    </div>
                  </td>
                  <td>{athlete.teamName}</td>
                  <td>{athlete.sportName}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        athlete.status === 'Ativo' ? 'active' : 'inactive'
                      }`}
                    >
                      {athlete.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-athlete-btn"
                      onClick={() => navigate(`/athletes/${athlete.id}`)}
                    >
                      Visualizar aluno
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AthleteControl;
