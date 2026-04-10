import React, { useMemo, useState } from 'react';
import './style.css';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';

import { useEvents } from '../../hooks/useApi';
import AddEventModal from '../../components/AddEventModal';

const formatDate = (dateIso) => {
  if (!dateIso) return 'No date';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 'No date';
  return d.toLocaleDateString('en-US');
};

const toMidnightDate = (dt) => {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const ITEMS_PER_PAGE = 10;

const EventsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: events = [], isLoading, error } = useEvents();

  const normalizedEvents = useMemo(() => {
    const today = toMidnightDate(new Date());

    return events.map((event) => {
      const eventDate = toMidnightDate(event.start_date);
      const isExpired = Boolean(eventDate && today && eventDate < today);

      return { ...event, eventDate, isExpired };
    });
  }, [events]);

  const visibleEvents = useMemo(() => {
    if (showExpired) return normalizedEvents;
    return normalizedEvents.filter((event) => !event.isExpired);
  }, [normalizedEvents, showExpired]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const normalizedStartDate = startDate ? toMidnightDate(startDate) : null;
    const normalizedEndDate = endDate ? toMidnightDate(endDate) : null;

    const dateFilteredEvents = visibleEvents.filter((event) => {
      if (!normalizedStartDate && !normalizedEndDate) {
        return true;
      }

      if (!event.eventDate) {
        return false;
      }

      const matchesStart = !normalizedStartDate || event.eventDate >= normalizedStartDate;
      const matchesEnd = !normalizedEndDate || event.eventDate <= normalizedEndDate;

      return matchesStart && matchesEnd;
    });

    if (!query) return dateFilteredEvents;

    return dateFilteredEvents.filter(
      (e) =>
        e.name?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query),
    );
  }, [endDate, search, startDate, visibleEvents]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [endDate, filteredEvents.length, showExpired, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const pagedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxTabs = 5;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxTabs - 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < totalPages) { pages.push('...'); pages.push(totalPages); }
    if (start > 1) { pages.unshift('...'); pages.unshift(1); }
    return pages;
  };

  const totalEvents = events.length;
  const upcomingEvents = normalizedEvents.filter((event) => !event.isExpired).length;
  const expiredEvents = normalizedEvents.filter((event) => event.isExpired).length;

  return (
    <div className="events-page">
      <div className="events-summary-card">
        <div className="events-summary-title">Event Management</div>
        <div className="events-summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total events</div>
            <div className="stat-value">{totalEvents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Upcoming events</div>
            <div className="stat-value">{upcomingEvents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Expired events</div>
            <div className="stat-value">{expiredEvents}</div>
          </div>
        </div>
      </div>

      <div className="events-table-card">
        <section className="events-controls">
          <div className="search-wrapper">
            <SearchIcon className="search-icon" fontSize="small" />
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event name or description"
            />
          </div>

          <div className="events-controls-group">
            <label className="events-date-field">
              <span className="events-date-label">Start date</span>
              <input
                type="date"
                className="events-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="events-date-field">
              <span className="events-date-label">End date</span>
              <input
                type="date"
                className="events-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="clear-dates-btn"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              disabled={!startDate && !endDate}
            >
              Clear dates
            </button>

            <label className="events-toggle">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
              />
              Show expired
            </label>

            <button
              type="button"
              className="add-event-btn"
              onClick={() => setCreateOpen(true)}
            >
              Create Event
            </button>
          </div>
        </section>

        <section className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>EVENT</th>
                <th>DATE</th>
                <th>TEAMS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="empty-row">Loading data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="empty-row">Unable to load data. Please try again.</td>
                </tr>
              ) : visibleEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    {showExpired ? 'No events found.' : 'No upcoming events.'}
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">No events matched your filters.</td>
                </tr>
              ) : (
                pagedEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="event-name-cell">
                        <div className="event-icon-circle">
                          <EventIcon fontSize="small" />
                        </div>
                        <div className="event-text">
                          <div className="event-name">{event.name}</div>
                          {event.description && (
                            <div className="event-description">{event.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="event-date">{formatDate(event.start_date)}</span>
                    </td>
                    <td>
                      <div className="event-teams">
                        {(event.teams || []).length === 0 ? (
                          <span style={{ color: 'rgba(55,65,81,0.5)', fontSize: 13 }}>—</span>
                        ) : (
                          (event.teams || []).map((team) => (
                            <span key={`${event.id}-${team.id}`} className="team-badge">
                              {team.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="edit-event-btn"
                        onClick={() => {
                          setSelectedEvent(event);
                          setEditOpen(true);
                        }}
                      >
                        Edit
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
                  <span key={`dots-${index}`} className="pagination-dots">…</span>
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

      <AddEventModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AddEventModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedEvent(null);
        }}
        mode="edit"
        event={selectedEvent}
      />
    </div>
  );
};

export default EventsPage;
