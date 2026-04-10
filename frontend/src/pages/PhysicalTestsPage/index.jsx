import React, { useEffect, useMemo, useState } from 'react';
import './style.css';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from '../../context/AuthContext';
import { useAthletes, useMyAthlete, usePhysicalTestsByAthlete } from '../../hooks/useApi';
import SchedulePhysicalTestModal from '../../components/SchedulePhysicalTestModal';
import EditPhysicalTestModal from '../../components/EditPhysicalTestModal';
import PhysicalTestDetailsModal from '../../components/PhysicalTestDetailsModal';

const toMidnightDate = (dt) => {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const getScheduledStartDate = (physicalTest) => {
  const rows = physicalTest?.physical_test_has_exercise;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const startDates = rows.map((r) => r?.start_date).filter(Boolean);
  if (startDates.length === 0) return null;
  // ISO strings sort lexicographically for timestamps
  startDates.sort();
  return startDates[0];
};

const getDaysDiffFromToday = (scheduledIso) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = toMidnightDate(scheduledIso);
  if (!scheduled) return null;
  const diffMs = scheduled.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const ITEMS_PER_PAGE = 10;

const getStatusMeta = (physicalTest) => {
  if (physicalTest.isExpired) {
    return { label: 'Expired', className: 'expired' };
  }

  if (typeof physicalTest.daysDiff === 'number') {
    if (physicalTest.daysDiff === 0) {
      return { label: 'Today', className: 'today' };
    }

    return { label: `${physicalTest.daysDiff} day${physicalTest.daysDiff === 1 ? '' : 's'} left`, className: 'upcoming' };
  }

  return { label: 'No date', className: 'unscheduled' };
};

const PhysicalTestsPage = () => {
  const { user } = useAuth();
  const userName = user?.nome || 'Derek';

  const isAthlete = String(user?.user_type_name || '').trim().toLowerCase() === 'athlete';

  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [showExpiredByAthlete, setShowExpiredByAthlete] = useState({});
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTest, setDetailsTest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: myAthlete, isLoading: loadingMyAthlete, error: myAthleteError } = useMyAthlete();
  const { data: athletes = [], isLoading: loadingAthletes, error: athletesError } = useAthletes(!isAthlete);

  const athleteId = isAthlete
    ? (myAthlete?.id ?? null)
    : (selectedAthleteId ? Number(selectedAthleteId) : null);

  const { data: tests = [], isLoading, error } = usePhysicalTestsByAthlete(athleteId);

  const showExpired = !!showExpiredByAthlete[athleteId];

  const normalizedTests = useMemo(() => {
    return (tests || []).map((t) => {
      const scheduledIso = getScheduledStartDate(t);
      const daysDiff = getDaysDiffFromToday(scheduledIso);
      const isExpired = typeof daysDiff === 'number' ? daysDiff < 0 : false;
      return { ...t, scheduledIso, daysDiff, isExpired };
    });
  }, [tests]);

  const visibleTests = useMemo(() => {
    if (!athleteId) return [];
    if (showExpired) return normalizedTests;
    return normalizedTests.filter((t) => !t.isExpired);
  }, [athleteId, normalizedTests, showExpired]);

  useEffect(() => {
    setCurrentPage(1);
  }, [athleteId, showExpired, visibleTests.length]);

  const selectedAthlete = useMemo(() => {
    if (isAthlete) return myAthlete || null;
    return athletes.find((athlete) => athlete.id === athleteId) || null;
  }, [athleteId, athletes, isAthlete, myAthlete]);

  const expiredCount = normalizedTests.filter((test) => test.isExpired).length;
  const activeCount = normalizedTests.filter((test) => !test.isExpired).length;
  const totalPages = Math.max(1, Math.ceil(visibleTests.length / ITEMS_PER_PAGE));
  const pagedTests = visibleTests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  const handleToggleExpired = (checked) => {
    if (!athleteId) return;
    setShowExpiredByAthlete((prev) => ({ ...prev, [athleteId]: checked }));
  };

  const handleOpenEdit = (test) => {
    setSelectedTest(test);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedTest(null);
  };

  const handleOpenDetails = (test) => {
    setDetailsTest(test);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetailsTest(null);
  };

  const shouldShowEmptyState = !athleteId && !(isAthlete && (loadingMyAthlete || myAthleteError));

  return (
    <div className="physical-tests-page">
      <div className="physical-tests-summary-card">
        <div className="physical-tests-summary-title">Physical Tests</div>
        <div className="physical-tests-summary-subtitle">
          {isAthlete
            ? 'Track your physical tests in a single panel.'
            : 'Schedule and track tests for each athlete from one panel.'}
        </div>

        <div className="physical-tests-summary-stats">
          <div className="physical-tests-stat-item">
            <div className="physical-tests-stat-label">Total tests</div>
            <div className="physical-tests-stat-value">{athleteId ? normalizedTests.length : 0}</div>
          </div>
          <div className="physical-tests-stat-item">
            <div className="physical-tests-stat-label">Active tests</div>
            <div className="physical-tests-stat-value">{athleteId ? activeCount : 0}</div>
          </div>
          <div className="physical-tests-stat-item">
            <div className="physical-tests-stat-label">Expired tests</div>
            <div className="physical-tests-stat-value">{athleteId ? expiredCount : 0}</div>
          </div>
        </div>
      </div>

      <div className="physical-tests-card">
        <section className="physical-tests-controls">
          <div className="physical-tests-controls-group">
            {!isAthlete && (
              <label className="physical-test-field">
                <span className="physical-test-field-label">Athlete</span>
                <select
                  className="physical-test-select"
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  disabled={loadingAthletes}
                >
                  <option value="">
                    {loadingAthletes ? 'Loading athletes...' : 'Select an athlete'}
                  </option>
                  {athletes.map((athlete) => (
                    <option key={athlete.id} value={String(athlete.id)}>
                      {athlete.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="physical-test-field">
              <span className="physical-test-field-label">Filters</span>
              <span className="physical-test-toggle">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => handleToggleExpired(e.target.checked)}
                  disabled={!athleteId}
                />
                Show expired
              </span>
            </label>
          </div>

          {!isAthlete && (
            <button
              type="button"
              className="add-physical-test-btn"
              onClick={() => setScheduleOpen(true)}
              disabled={!athleteId}
            >
              <AddIcon fontSize="small" />
              {' '}
              Schedule Test
            </button>
          )}
        </section>

        {!isAthlete && athletesError && (
          <div className="physical-tests-message error">
            Unable to load athletes. Please try again.
          </div>
        )}

        {isAthlete && loadingMyAthlete && (
          <div className="physical-tests-empty-state">
            <div className="physical-tests-empty-title">Carregando...</div>
            <div className="physical-tests-empty-text">
              Carregando seu perfil de atleta.
            </div>
          </div>
        )}

        {isAthlete && myAthleteError && (
          <div className="physical-tests-message error">
            Não foi possível carregar seu perfil de atleta.
          </div>
        )}

        {shouldShowEmptyState ? (
          <div className="physical-tests-empty-state">
            <div className="physical-tests-empty-title">
              {isAthlete ? 'Athlete profile not found' : 'Select an athlete'}
            </div>
            <div className="physical-tests-empty-text">
              {isAthlete
                ? 'Could not identify current athlete'
                : 'Choose an athlete to review and schedule physical tests.'}
            </div>
          </div>
        ) : athleteId ? (
          <section className="physical-tests-table-wrapper">
            {error && (
              <div className="physical-tests-message error">
                Unable to load physical tests. Please try again.
              </div>
            )}

            <table className="physical-tests-table">
              <thead>
                <tr>
                  <th>TEST</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Loading data...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Unable to load data. Please try again.
                    </td>
                  </tr>
                ) : visibleTests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      {showExpired
                        ? (isAthlete ? 'There are no tests for you.' : 'There are no tests for this athlete.')
                        : (isAthlete ? 'There are no upcoming tests for you.' : 'There are no upcoming tests for this athlete.')}
                    </td>
                  </tr>
                ) : (
                  pagedTests.map((test) => {
                    const scheduledLabel = test.scheduledIso
                      ? new Date(test.scheduledIso).toLocaleDateString('en-US')
                      : 'No date';
                    const statusMeta = getStatusMeta(test);

                    return (
                      <tr key={test.id}>
                        <td>
                          <div className="physical-test-cell">
                            <div className="physical-test-icon">
                              <FactCheckIcon fontSize="small" />
                            </div>
                            <div className="physical-test-text">
                              <div className="physical-test-name">{test.name}</div>
                              <div className="physical-test-description">
                                {test.description || selectedAthlete?.name || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="physical-test-date">{scheduledLabel}</span>
                        </td>
                        <td>
                          <span className={`physical-test-status ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td>
                          {isAthlete ? (
                            <button
                              type="button"
                              className="edit-physical-test-btn"
                              onClick={() => handleOpenDetails(test)}
                            >
                              Detalhes
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="edit-physical-test-btn"
                              onClick={() => handleOpenEdit(test)}
                            >
                              <EditIcon fontSize="small" />
                              {' '}
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {visibleTests.length > ITEMS_PER_PAGE && (
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
        ) : null}
      </div>

      {!isAthlete && (
        <>
          <SchedulePhysicalTestModal
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            athleteId={athleteId}
            userName={userName}
          />

          <EditPhysicalTestModal
            open={editOpen}
            onClose={handleCloseEdit}
            physicalTest={selectedTest}
            userName={userName}
          />
        </>
      )}

      {isAthlete && (
        <PhysicalTestDetailsModal
          open={detailsOpen}
          onClose={handleCloseDetails}
          physicalTest={detailsTest}
        />
      )}
    </div>
  );
};

export default PhysicalTestsPage;
