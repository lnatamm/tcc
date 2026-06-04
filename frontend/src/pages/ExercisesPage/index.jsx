import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, IconButton, Popover } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CreateExerciseModal from '../../components/CreateExerciseModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import EditExerciseModal from '../../components/EditExerciseModal';
import {
  useDeleteExercise,
  useExercises,
  useSports,
  useTypeExercises,
} from '../../hooks/useApi';
import './style.css';

const ITEMS_PER_PAGE = 10;

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const ExercisesPage = () => {
  const {
    data: exercises = [],
    isLoading: loadingExercises,
    error: exercisesError,
    refetch: refetchExercises,
  } = useExercises();
  const { data: sports = [] } = useSports();
  const { data: typeExercises = [] } = useTypeExercises();
  const deleteExercise = useDeleteExercise();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [filterSport, setFilterSport] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMedia, setFilterMedia] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sportNameById = useMemo(() => {
    const map = new Map();
    sports.forEach((sport) => {
      if (sport.id) {
        map.set(sport.id, sport.name || 'Unknown sport');
      }
    });
    return map;
  }, [sports]);

  const typeNameById = useMemo(() => {
    const map = new Map();
    typeExercises.forEach((type) => {
      if (type.id) {
        map.set(type.id, type.name || 'Unknown type');
      }
    });
    return map;
  }, [typeExercises]);

  const list = useMemo(() => {
    return exercises.map((exercise) => {
      const sportName = sportNameById.get(exercise.id_sport) || 'Unknown sport';
      const typeName = typeNameById.get(exercise.id_type) || 'Unknown type';
      const hasVideo = !!exercise.video_path;

      return {
        ...exercise,
        sportName,
        typeName,
        hasVideo,
        mediaLabel: hasVideo ? 'With video' : 'No video',
        repsLabel: exercise.reps ?? '—',
        setsLabel: exercise.sets ?? '—',
      };
    });
  }, [exercises, sportNameById, typeNameById]);

  const filteredExercises = useMemo(() => {
    const query = normalizeText(search);

    const baseList = query
      ? list.filter((exercise) => {
          return (
            normalizeText(exercise.name).includes(query) ||
            normalizeText(exercise.description).includes(query) ||
            normalizeText(exercise.sportName).includes(query) ||
            normalizeText(exercise.typeName).includes(query) ||
            String(exercise.id).includes(query)
          );
        })
      : list;

    return baseList.filter((exercise) => {
      const matchesSport = !filterSport || normalizeText(exercise.sportName).includes(normalizeText(filterSport));
      const matchesType = !filterType || normalizeText(exercise.typeName).includes(normalizeText(filterType));
      const matchesMedia =
        filterMedia === 'all' ||
        (filterMedia === 'with-video' && exercise.hasVideo) ||
        (filterMedia === 'without-video' && !exercise.hasVideo);

      return matchesSport && matchesType && matchesMedia;
    });
  }, [filterMedia, filterSport, filterType, list, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredExercises]);

  const pagedExercises = filteredExercises.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / ITEMS_PER_PAGE));
  const totalExercises = list.length;
  const totalSports = new Set(list.map((exercise) => exercise.id_sport)).size;
  const exercisesWithVideo = list.filter((exercise) => exercise.hasVideo).length;

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

  const handleDeleteExercise = async () => {
    if (!deleteTarget?.id) return;

    try {
      await deleteExercise.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete exercise:', err);
    }
  };

  const handleMutationSuccess = () => {
    refetchExercises();
    setSelectedExercise(null);
  };

  return (
    <div className="exercise-control">
      <div className="exercise-summary-card">
        <div className="exercise-summary-title">Exercise Library Management</div>

        <div className="exercise-summary-stats">
          <div className="exercise-stat-item">
            <div className="exercise-stat-label">Total exercises</div>
            <div className="exercise-stat-value">{totalExercises}</div>
          </div>
          <div className="exercise-stat-item">
            <div className="exercise-stat-label">Sports covered</div>
            <div className="exercise-stat-value">{totalSports}</div>
          </div>
          <div className="exercise-stat-item">
            <div className="exercise-stat-label">Exercises with video</div>
            <div className="exercise-stat-value">{exercisesWithVideo}</div>
          </div>
        </div>
      </div>

      <div className="exercise-search-table-card">
        <section className="exercise-controls">
          <div className="exercise-search-wrapper">
            <SearchIcon className="exercise-search-icon" fontSize="small" />
            <input
              className="exercise-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exercise, ID, sport, type or description"
            />
            <IconButton
              className="exercise-filter-button"
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
              PaperProps={{ className: 'exercise-filter-popover' }}
            >
              <Box className="exercise-filter-panel">
                <div className="exercise-filter-row">
                  <label className="exercise-filter-label">
                    Sport
                    <input
                      value={filterSport}
                      onChange={(e) => setFilterSport(e.target.value)}
                      placeholder="Sport name"
                    />
                  </label>

                  <label className="exercise-filter-label">
                    Type
                    <input
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      placeholder="Exercise type"
                    />
                  </label>

                  <label className="exercise-filter-label">
                    Media
                    <select
                      value={filterMedia}
                      onChange={(e) => setFilterMedia(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="with-video">With video</option>
                      <option value="without-video">Without video</option>
                    </select>
                  </label>

                  <button
                    className="exercise-filter-clear-btn"
                    type="button"
                    onClick={() => {
                      setFilterSport('');
                      setFilterType('');
                      setFilterMedia('all');
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
            className="exercise-add-btn"
            onClick={() => setCreateModalOpen(true)}
          >
            Add exercise
          </button>
        </section>

        {exercisesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Unable to load exercises. Please try again.
          </Alert>
        )}

        <section className="exercise-table-wrapper">
          <table className="exercise-table">
            <thead>
              <tr>
                <th>EXERCISE</th>
                <th>SPORT</th>
                <th>TYPE</th>
                <th>SETS / REPS</th>
                <th>MEDIA</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loadingExercises ? (
                <tr>
                  <td colSpan={6} className="exercise-empty-row">
                    Loading exercises...
                  </td>
                </tr>
              ) : pagedExercises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="exercise-empty-row">
                    No exercises found.
                  </td>
                </tr>
              ) : (
                pagedExercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <div className="exercise-main-cell">
                        <div className="exercise-text">
                          <div className="exercise-name">{exercise.name}</div>
                          <div className="exercise-sub">ID {exercise.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{exercise.sportName}</td>
                    <td>{exercise.typeName}</td>
                    <td>{exercise.setsLabel} / {exercise.repsLabel}</td>
                    <td>
                      <span className={`exercise-status-badge ${exercise.hasVideo ? 'active' : 'inactive'}`}>
                        {exercise.mediaLabel}
                      </span>
                    </td>
                    <td>
                      <div className="exercise-action-group">
                        <button
                          type="button"
                          className="exercise-edit-btn"
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="exercise-delete-btn"
                          onClick={() => setDeleteTarget(exercise)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="exercise-pagination-tabs">
            <button
              type="button"
              className="exercise-pagination-button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...'
                ? <span key={`dots-${index}`} className="exercise-pagination-dots">...</span>
                : (
                    <button
                      type="button"
                      key={page}
                      className={`exercise-pagination-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
            ))}

            <button
              type="button"
              className="exercise-pagination-button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      <CreateExerciseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <EditExerciseModal
        open={!!selectedExercise}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onSuccess={handleMutationSuccess}
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteExercise}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise from the database?"
        itemName={deleteTarget?.name || ''}
        loading={deleteExercise.isPending}
      />
    </div>
  );
};

export default ExercisesPage;
