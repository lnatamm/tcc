import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { useTeamsWithAthletes, useAthletes, useEnrollments, useCreateAthlete } from '../../hooks/useApi';
import { Avatar, IconButton, Popover, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddAthleteModal from '../../components/AddAthleteModal';
import AddAthleteToTeamModal from '../../components/AddAthleteToTeamModal';
import AddTeamModal from '../../components/AddTeamModal';

const getAthleteStatusLabel = (status) => {
  if (status === 'Ativo') return 'Active';
  if (status === 'Inativo') return 'Inactive';
  return status || 'Active';
};

const AthleteControl = () => {
  const navigate = useNavigate();
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeamsWithAthletes();
  const { data: athletes = [], isLoading, error } = useAthletes();
  const { data: enrollments = [] } = useEnrollments();
  const createAthlete = useCreateAthlete();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('athletes');

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
      statusLabel: getAthleteStatusLabel(athlete.status || 'Ativo'),
    }));
  }, [athletes, athleteTeams]);

  const teamList = useMemo(() => {
    return teams.map((team) => ({
      ...team,
      athleteCount: Array.isArray(team.athletes) ? team.athletes.length : 0,
      athletes: Array.isArray(team.athletes) ? team.athletes : [],
    }));
  }, [teams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [expandedTeams, setExpandedTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);

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

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return teamList;
    }

    return teamList.filter((team) => {
      const matchesTeam = team.name?.toLowerCase().includes(query);
      const matchesId = String(team.id).includes(query);
      const matchesAthlete = team.athletes.some((athlete) =>
        athlete?.name?.toLowerCase().includes(query)
      );

      return matchesTeam || matchesId || matchesAthlete;
    });
  }, [search, teamList]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredAthletes]);

  React.useEffect(() => {
    setTeamPage(1);
  }, [filteredTeams]);

  const pagedAthletes = filteredAthletes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pagedTeams = filteredTeams.slice(
    (teamPage - 1) * ITEMS_PER_PAGE,
    teamPage * ITEMS_PER_PAGE
  );

  const totalStudents = athletes.length;
  const totalTeams = teams.length;
  const activeStudents = athletes.filter((a) => a.status === 'Ativo').length;


  const activeListLength = viewMode === 'athletes' ? filteredAthletes.length : filteredTeams.length;
  const totalPages = Math.max(1, Math.ceil(activeListLength / ITEMS_PER_PAGE));
  const activePage = viewMode === 'athletes' ? currentPage : teamPage;

  const getPageNumbers = () => {
    const pages = [];
    const maxTabs = 5;
    const start = Math.max(1, activePage - 2);
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

  const handleAddAthlete = (athleteName) => {
    createAthlete.mutate(
      {
        name: athleteName,
      },
      {
        onSuccess: () => {
          setAddModalOpen(false);
        },
      }
    );
  };

  const toggleExpandedTeam = (teamId) => {
    setExpandedTeams((previous) =>
      previous.includes(teamId)
        ? previous.filter((id) => id !== teamId)
        : [...previous, teamId]
    );
  };

  return (
    <div className="athlete-control">
      <div className="athlete-summary-card">
        <div className="athlete-summary-title">Athlete and Team Management</div>

        <div className="athlete-summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total athletes</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Active athletes</div>
            <div className="stat-value">{activeStudents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total teams</div>
            <div className="stat-value">{totalTeams}</div>
          </div>
        </div>
      </div>

    <div className='Search-table-card'>

      <section className="athlete-controls">
        <div className="athlete-controls-left">
          <div className="view-switch" role="tablist" aria-label="Athlete control views">
            <button
              type="button"
              className={`view-switch-button ${viewMode === 'athletes' ? 'active' : ''}`}
              onClick={() => setViewMode('athletes')}
            >
              Athletes
            </button>
            <button
              type="button"
              className={`view-switch-button ${viewMode === 'teams' ? 'active' : ''}`}
              onClick={() => setViewMode('teams')}
            >
              Teams
            </button>
          </div>

          <div className="search-row">
            <div className="search-wrapper">
              <SearchIcon className="search-icon" fontSize="small" />
              <input
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  viewMode === 'athletes'
                    ? 'Search by athlete name or ID'
                    : 'Search by team name, ID or athlete'
                }
              />
              {viewMode === 'athletes' && (
                <IconButton
                  className="filter-button"
                  size="small"
                  onClick={(event) => {
                    setFiltersOpen(true);
                    setFiltersAnchor(event.currentTarget);
                  }}
                  aria-label="Filters"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              )}

              <Popover
                open={filtersOpen && viewMode === 'athletes'}
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
                        <option value="all">All</option>
                        <option value="Ativo">Active</option>
                        <option value="Inativo">Inactive</option>
                      </select>
                    </label>

                    <label className="filter-label">
                      Team
                      <input
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        placeholder="Team name"
                      />
                    </label>

                    <label className="filter-label">
                      Sport
                      <input
                        value={filterSport}
                        onChange={(e) => setFilterSport(e.target.value)}
                        placeholder="Sport name"
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
                      Clear filters
                    </button>
                  </div>
                </Box>
              </Popover>
            </div>

            <div className="search-actions">
              {viewMode === 'teams' && (
                <button
                  type="button"
                  className="add-athlete-btn add-team-btn"
                  onClick={() => setAddTeamModalOpen(true)}
                >
                  Add team
                </button>
              )}

              {viewMode === 'athletes' && (
                <button
                  type="button"
                  className="add-athlete-btn"
                  onClick={() => setAddModalOpen(true)}
                >
                  Add athlete
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="athlete-table-wrapper">
        {viewMode === 'athletes' ? (
          <table className="athlete-table">
            <thead>
              <tr>
                <th>ATHLETE</th>
                <th>TEAM</th>
                <th>SPORT</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Loading data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Unable to load data. Please try again.
                  </td>
                </tr>
              ) : filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    No athletes found.
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
                        <div className="student-sub">Athlete ID: {athlete.id}</div>
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
                        {athlete.statusLabel}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-athlete-btn"
                        onClick={() => navigate(`/athletes/${athlete.id}`)}
                      >
                        View athlete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="athlete-table team-table">
            <thead>
              <tr>
                <th>TEAM</th>
                <th>ATHLETES</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {teamsLoading ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    Loading teams...
                  </td>
                </tr>
              ) : teamsError ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    Unable to load teams. Please try again.
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    No teams found.
                  </td>
                </tr>
              ) : (
                pagedTeams.map((team) => {
                  const expanded = expandedTeams.includes(team.id);

                  return (
                    <React.Fragment key={team.id}>
                      <tr>
                        <td className="student-cell">
                          <Avatar className="student-avatar">
                            {team.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="student-text">
                            <div className="student-name">{team.name}</div>
                            <div className="student-sub">Team ID: {team.id}</div>
                          </div>
                        </td>
                        <td>
                          <span className="team-count-badge">
                            {team.athleteCount} athlete{team.athleteCount === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="team-expand-cell">
                          <div className="team-actions">
                            <button
                              type="button"
                              className="add-team-athlete-btn"
                              onClick={() => setSelectedTeam(team)}
                            >
                              Add athlete
                            </button>
                            <button
                              type="button"
                              className={`expand-team-btn ${expanded ? 'expanded' : ''}`}
                              onClick={() => toggleExpandedTeam(team.id)}
                              aria-label={expanded ? 'Hide team athletes' : 'Show team athletes'}
                            >
                              <ExpandMoreIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="team-members-row">
                          <td colSpan={3}>
                            {team.athletes.length > 0 ? (
                              <div className="team-members-list">
                                {team.athletes.map((athlete) => (
                                  <div key={athlete.id} className="team-member-card">
                                    <div className="student-cell">
                                      <Avatar className="student-avatar team-member-avatar">
                                        {athlete.name?.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <div className="student-text">
                                        <div className="student-name">{athlete.name}</div>
                                        <div className="student-sub">Athlete ID: {athlete.id}</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="view-athlete-btn"
                                      onClick={() => navigate(`/athletes/${athlete.id}`)}
                                    >
                                      View athlete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="team-members-empty">No athletes enrolled.</div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination-tabs">
            <button
              className="pagination-button"
              type="button"
              onClick={() =>
                viewMode === 'athletes'
                  ? setCurrentPage((prev) => Math.max(1, prev - 1))
                  : setTeamPage((prev) => Math.max(1, prev - 1))
              }
              disabled={activePage === 1}
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
                  className={`pagination-button ${activePage === page ? 'active' : ''}`}
                  onClick={() =>
                    viewMode === 'athletes' ? setCurrentPage(page) : setTeamPage(page)
                  }
                >
                  {page}
                </button>
              )
            )}

            <button
              className="pagination-button"
              type="button"
              onClick={() =>
                viewMode === 'athletes'
                  ? setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  : setTeamPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={activePage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </section>
            
    </div>

      <AddAthleteModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddAthlete}
        loading={createAthlete.isPending}
        submitError={createAthlete.isError ? 'Unable to add athlete. Please try again.' : ''}
      />

      <AddTeamModal
        open={addTeamModalOpen}
        onClose={() => setAddTeamModalOpen(false)}
      />

      <AddAthleteToTeamModal
        open={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
        existingAthleteIds={(selectedTeam?.athletes || []).map((athlete) => athlete?.id).filter(Boolean)}
      />

    </div>
  );
};

export default AthleteControl;
