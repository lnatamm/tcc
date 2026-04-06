import React, { useMemo, useState } from 'react';
import './style.css';
import TodayIcon from '@mui/icons-material/Today';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ActiveExercise from '../../components/ActiveExercise';
import { useTodayExercises, useAthletes } from '../../hooks/useApi';

const FILTER_OPTIONS = [
  { value: 'all', label: 'all' },
  { value: 'not-started', label: 'pending' },
  { value: 'in-progress', label: 'in progress' },
  { value: 'completed', label: 'completed' },
];

const TodayRoutines = () => {
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');

  const { data: athletes = [], isLoading: loadingAthletes } = useAthletes();
  const { data: exercises = [], isLoading, error, refetch } = useTodayExercises(selectedAthleteId);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'not-started') return ex.status === 'NOT STARTED';
      if (filterTab === 'in-progress') return ex.status === 'IN PROGRESS';
      if (filterTab === 'completed') return ex.status === 'COMPLETED';
      return true;
    });
  }, [exercises, filterTab]);

  const counts = {
    all: exercises.length,
    'not-started': exercises.filter((ex) => ex.status === 'NOT STARTED').length,
    'in-progress': exercises.filter((ex) => ex.status === 'IN PROGRESS').length,
    completed: exercises.filter((ex) => ex.status === 'COMPLETED').length,
  };

  const completionPercentage = exercises.length > 0
    ? Math.round((counts.completed / exercises.length) * 100)
    : 0;

  const currentFilterLabel = FILTER_OPTIONS.find((option) => option.value === filterTab)?.label || 'all';

  return (
    <div className="today-routines-page">
      <div className="today-summary-card">
        <div className="today-summary-header">
          <div className="today-summary-icon">
            <TodayIcon fontSize="medium" />
          </div>
          <div>
            <h1 className="today-summary-title">Today's Workout</h1>
            <div className="today-summary-subtitle">{todayFormatted}</div>
          </div>
        </div>

        <div className="today-summary-stats">
          <div className="today-stat-item">
            <div className="today-stat-label">completed</div>
            <div className="today-stat-value">{selectedAthleteId ? counts.completed : 0}</div>
          </div>
          <div className="today-stat-item">
            <div className="today-stat-label">in progress</div>
            <div className="today-stat-value">{selectedAthleteId ? counts['in-progress'] : 0}</div>
          </div>
          <div className="today-stat-item">
            <div className="today-stat-label">pending</div>
            <div className="today-stat-value">{selectedAthleteId ? counts['not-started'] : 0}</div>
          </div>
          <div className="today-stat-item">
            <div className="today-stat-label">progress</div>
            <div className="today-stat-value">{selectedAthleteId ? `${completionPercentage}%` : '0%'}</div>
          </div>
        </div>
      </div>

      <div className="today-panel-card">
        <section className="today-controls">
          <div className="today-controls-fields">
            <label className="today-field">
              <span className="today-field-label">Athlete</span>
              <select
                className="today-select"
                value={selectedAthleteId || ''}
                onChange={(e) => setSelectedAthleteId(e.target.value || null)}
                disabled={loadingAthletes}
              >
                <option value="">
                  {loadingAthletes ? 'Loading athletes...' : 'Select athlete'}
                </option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="today-field today-field--filters">
              <span className="today-field-label">Status filter</span>
              <div className="today-filter-group">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`today-filter-pill ${filterTab === option.value ? 'active' : ''}`}
                    onClick={() => setFilterTab(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="today-filter-count">{counts[option.value]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!selectedAthleteId ? (
          <div className="today-empty-state">
            <div className="today-empty-icon">
              <FitnessCenterIcon fontSize="large" />
            </div>
            <div className="today-empty-title">Select an Athlete</div>
            <div className="today-empty-text">
              Choose an athlete to view their workout schedule for today.
            </div>
          </div>
        ) : (
          <div className="today-content-card">
            {error && (
              <div className="today-message error">
                Error loading exercises: {error.message}
              </div>
            )}

            <div className="today-content-header">
 

              {filterTab !== 'all' && (
                <span
                  className={`today-status-badge ${
                    filterTab === 'completed'
                      ? 'completed'
                      : filterTab === 'in-progress'
                        ? 'in-progress'
                        : 'pending'
                  }`}
                >
                  {currentFilterLabel}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="today-empty-state">
                <div className="today-empty-icon">
                  <TodayIcon fontSize="large" />
                </div>
                <div className="today-empty-title">Loading exercises</div>
                <div className="today-empty-text">
                  Fetching today's workout for the selected athlete.
                </div>
              </div>
            ) : !error && exercises.length === 0 ? (
              <div className="today-empty-state">
                <div className="today-empty-icon">
                  <CalendarTodayIcon fontSize="large" />
                </div>
                <div className="today-empty-title">No Exercises Scheduled</div>
                <div className="today-empty-text">
                  There are no exercises scheduled for today.
                </div>
              </div>
            ) : !error && filteredExercises.length === 0 ? (
              <div className="today-empty-state">
                <div className="today-empty-icon">
                  <CalendarTodayIcon fontSize="large" />
                </div>
                <div className="today-empty-title">No exercises in this category</div>
                <div className="today-empty-text">
                  Try another filter to inspect completed, in progress or pending exercises.
                </div>
              </div>
            ) : (
              <div className="today-exercises-list">
                {filteredExercises.map((exercise) => (
                  <ActiveExercise
                    key={exercise.routine_has_exercise_id}
                    exerciseData={exercise}
                    onComplete={() => refetch()}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayRoutines;
