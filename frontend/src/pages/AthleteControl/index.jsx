import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { useTeamsWithAthletes, useAthletes, useEnrollments } from '../../hooks/useApi';
import { Avatar, IconButton, Popover, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const AthleteControl = () => {
  const navigate = useNavigate();
  const { data: teams = [] } = useTeamsWithAthletes();
  const { data: athletes = [], isLoading, error } = useAthletes();
  const { data: enrollments = [] } = useEnrollments();
  const [search, setSearch] = useState('');

  const teamNamesById = useMemo(() => {
    const map = new Map();
    teams.forEach((team) => {
      if (team.id) map.set(team.id, team.name || '—');
    });
    return map;
  }, [teams]);

  const athleteTeams = useMemo(() => {
    const map = new Map();

    enrollments.forEach((en) => {
      const teamName = teamNamesById.get(en.id_team) || '—';
      const existing = map.get(en.id_athlete);
      const names = existing ? [...existing, teamName] : [teamName];
      map.set(en.id_athlete, Array.from(new Set(names)));
    });

    return map;
  }, [enrollments, teamNamesById]);

  const list = useMemo(() => {
    return athletes.map((athlete) => ({
      ...athlete,
      teamName: (athleteTeams.get(athlete.id) || ['—']).join(', '),
      sportName: athlete.sportName || '—',
      status: athlete.status || 'Ativo',
    }));
  }, [athletes, athleteTeams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSport, setFilterSport] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const filteredAthletes = useMemo(() => {
    const query = search.trim().toLowerCase();

    const base = query
      ? list.filter((athlete) => {
          return (
            athlete.name?.toLowerCase().includes(query) ||
            String(athlete.id).includes(query) ||
            athlete.teamName?.toLowerCase().includes(query) ||
            athlete.sportName?.toLowerCase().includes(query)
          );
        })
      : list;

    return base.filter((athlete) => {
      const matchesStatus =
        filterStatus === 'all' || athlete.status === filterStatus;
      const matchesTeam =
        !filterTeam ||
        athlete.teamName?.toLowerCase().includes(filterTeam.trim().toLowerCase());
      const matchesSport =
        !filterSport ||
        athlete.sportName?.toLowerCase().includes(filterSport.trim().toLowerCase());

      return matchesStatus && matchesTeam && matchesSport;
    });
  }, [search, list, filterStatus, filterTeam, filterSport]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredAthletes]);

  const pagedAthletes = filteredAthletes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalStudents = athletes.length;
  const totalTeams = teams.length;
  const activeStudents = athletes.filter((a) => a.status === 'Ativo').length;


  const totalPages = Math.max(1, Math.ceil(filteredAthletes.length / ITEMS_PER_PAGE));

  const getPageNumbers = () => {
    const pages = [];
    const maxTabs = 5;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxTabs - 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (end < totalPages) {
      pages.push('...');
      pages.push(totalPages);
    }

    if (start > 1) {
      pages.unshift('...');
      pages.unshift(1);
    }

    return pages;
  };

  return (
    <div className="athlete-control">
      <div className="athlete-summary-card">
        <div className="athlete-summary-title">Controle de alunos e turmas</div>

        <div className="athlete-summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total de alunos</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Alunos ativos</div>
            <div className="stat-value">{activeStudents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total de turmas</div>
            <div className="stat-value">{totalTeams}</div>
          </div>
        </div>
      </div>

    <div className='Search-table-card'>

      <section className="athlete-controls">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" fontSize="small" />
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquise por nome ou ID do atleta"
          />
          <IconButton
            className="filter-button"
            size="small"
            onClick={(event) => {
              setFiltersOpen(true);
              setFiltersAnchor(event.currentTarget);
            }}
            aria-label="Filtros"
          >
            <FilterListIcon fontSize="small" />
          </IconButton>

          <Popover
            open={filtersOpen}
            anchorEl={filtersAnchor}
            onClose={() => setFiltersOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ className: 'filter-popover' }}
          >
            <Box className="filter-panel">
              <div className="filter-row">
                <label className="filter-label">
                  Status
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </label>

                <label className="filter-label">
                  Turma
                  <input
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    placeholder="Nome da turma"
                  />
                </label>

                <label className="filter-label">
                  Modalidade
                  <input
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    placeholder="Nome da modalidade"
                  />
                </label>

                <button
                  className="filter-clear-btn"
                  type="button"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterTeam('');
                    setFilterSport('');
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            </Box>
          </Popover>
        </div>

        <button type="button" className="add-athlete-btn" onClick={() => navigate('/register')}>
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
              pagedAthletes.map((athlete) => (
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

        {totalPages > 1 && (
          <div className="pagination-tabs">
            <button
              className="pagination-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`dots-${index}`} className="pagination-dots">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              className="pagination-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </section>
            
    </div>

    </div>
  );
};

export default AthleteControl;
