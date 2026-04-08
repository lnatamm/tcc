import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAthletes } from '../../hooks/useApi';
import AthleteRoutinesModal from '../../components/AthleteRoutinesModal';
import './style.css';

const ITEMS_PER_PAGE = 10;

const RoutinesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [routinesModalOpen, setRoutinesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: athletes = [], isLoading, error } = useAthletes();

  const userName = 'Derek';

  const filteredAthletes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return athletes;

    return athletes.filter((athlete) =>
      athlete.name.toLowerCase().includes(query),
    );
  }, [athletes, searchTerm]);

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

        <div className="routines-summary-stats">
          <div className="routines-stat-item">
            <div className="routines-stat-label">Total athletes</div>
            <div className="routines-stat-value">{athletes.length}</div>
          </div>
          <div className="routines-stat-item">
            <div className="routines-stat-label">Filtered results</div>
            <div className="routines-stat-value">{filteredAthletes.length}</div>
          </div>
          <div className="routines-stat-item">
            <div className="routines-stat-label">Open routine panels</div>
            <div className="routines-stat-value">{selectedAthlete ? 1 : 0}</div>
          </div>
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
              placeholder="Search by athlete name"
            />
          </div>

          <button
            type="button"
            className="routines-action-btn"
            onClick={() => setSearchTerm('')}
            disabled={!searchTerm}
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
                <th>PROFILE</th>
                <th>ROUTINES</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Loading athletes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Unable to load athletes. Please try again.
                  </td>
                </tr>
              ) : filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    {searchTerm
                      ? 'No athletes matched your search.'
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
                      <span className="routine-badge">Athlete</span>
                    </td>
                    <td>
                      <span className="routine-summary">Open the weekly routine panel</span>
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
