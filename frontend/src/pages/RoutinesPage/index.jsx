import React, { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  useAthletes,
  useEnrollments,
  useRoutinesByAthlete,
  useTeamsWithAthletes,
} from '../../hooks/useApi';
import AthleteRoutinesModal from '../../components/AthleteRoutinesModal';
import './style.css';

const ITEMS_PER_PAGE = 10;

const AthleteRoutineSummary = ({ athleteId }) => {
  const { data: routines = [], isLoading, error } = useRoutinesByAthlete(athleteId);

  if (isLoading) {
    return <span className="routine-summary">Loading routines...</span>;
  }

  if (error) {
    return <span className="routine-summary">Unable to load routines</span>;
  }

  const routineCount = routines.length;
  const routineLabel = routineCount === 1 ? '1 routine' : `${routineCount} routines`;

  return <span className="routine-summary">{routineLabel}</span>;
};

const RoutinesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [routinesModalOpen, setRoutinesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [filterTeam, setFilterTeam] = useState('');
  const { data: athletes = [], isLoading, error } = useAthletes();
  const { data: teams = [] } = useTeamsWithAthletes();
  const { data: enrollments = [] } = useEnrollments();

  const userName = 'Derek';

  const teamNamesById = useMemo(() => {
    const map = new Map();

    teams.forEach((team) => {
      if (team.id) {
        map.set(team.id, team.name || '-');
      }
    });

    return map;
  }, [teams]);

  const athleteTeams = useMemo(() => {
    const map = new Map();

    enrollments.forEach((enrollment) => {
      const teamName = teamNamesById.get(enrollment.id_team) || '-';
      const existing = map.get(enrollment.id_athlete);
      const names = existing ? [...existing, teamName] : [teamName];
      map.set(enrollment.id_athlete, Array.from(new Set(names)));
    });

    return map;
  }, [enrollments, teamNamesById]);

  const athletesWithTeams = useMemo(() => {
    return athletes.map((athlete) => ({
      ...athlete,
      teamName: (athleteTeams.get(athlete.id) || ['-']).join(', '),
    }));
  }, [athletes, athleteTeams]);

  const filteredAthletes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const base = query
      ? athletesWithTeams.filter((athlete) => {
          return (
            athlete.name?.toLowerCase().includes(query) ||
            String(athlete.id).includes(query) ||
            athlete.teamName?.toLowerCase().includes(query)
          );
        })
      : athletesWithTeams;

    return base.filter((athlete) => {
      if (!filterTeam) {
        return true;
      }

      return athlete.teamName?.toLowerCase().includes(filterTeam.trim().toLowerCase());
    });
  }, [athletesWithTeams, filterTeam, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredAthletes.length]);

  const pagedAthletes = filteredAthletes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  const handleViewRoutines = (athlete) => {
    setSelectedAthlete(athlete);
    setRoutinesModalOpen(true);
  };

  const handleCloseRoutines = () => {
    setRoutinesModalOpen(false);
    setSelectedAthlete(null);
  };

  return (
    <div className="routines-page">
      <div className="routines-summary-card">
        <div className="routines-summary-title">Training Routines</div>
        <div className="routines-summary-subtitle">
          Review and open each athlete's routine panel from a single list.
        </div>
      </div>

      <div className="routines-table-card">
        <section className="routines-controls">
          <div className="search-wrapper">
            <SearchIcon className="search-icon" fontSize="small" />
            <input
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by athlete name or ID"
            />
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
                    Team
                    <input
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      placeholder="Team name"
                    />
                  </label>

                  <button
                    className="filter-clear-btn"
                    type="button"
                    onClick={() => {
                      setFilterTeam('');
                      setFiltersOpen(false);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </Box>
            </Popover>
          </div>

          <button
            type="button"
            className="routines-action-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterTeam('');
            }}
            disabled={!searchTerm && !filterTeam}
          >
            Clear search
          </button>
        </section>

        {error && (
          <div className="routines-message error">
            Unable to load athletes. Please try again.
          </div>
        )}

        <section className="routines-table-wrapper">
          <table className="routines-table">
            <thead>
              <tr>
                <th>ATHLETE</th>
                <th>ROUTINES</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    Loading athletes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    Unable to load athletes. Please try again.
                  </td>
                </tr>
              ) : filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    {searchTerm || filterTeam
                      ? 'No athletes matched your filters.'
                      : 'No athletes are available to display routines.'}
                  </td>
                </tr>
              ) : (
                pagedAthletes.map((athlete) => (
                  <tr key={athlete.id}>
                    <td>
                      <div className="athlete-cell">
                        <div className="athlete-avatar">
                          {athlete.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="athlete-text">
                          <div className="athlete-name">{athlete.name}</div>
                          <div className="athlete-sub">Athlete ID: {athlete.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <AthleteRoutineSummary athleteId={athlete.id} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="view-routines-btn"
                        onClick={() => handleViewRoutines(athlete)}
                      >
                        <CalendarTodayIcon fontSize="small" />
                        View routines
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredAthletes.length > ITEMS_PER_PAGE && (
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
                ),
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

      <AthleteRoutinesModal
        open={routinesModalOpen}
        onClose={handleCloseRoutines}
        athlete={selectedAthlete}
        userName={userName}
      />
    </div>
  );
};

export default RoutinesPage;
