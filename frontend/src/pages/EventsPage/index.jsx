import React, { useMemo, useState } from 'react';
import './style.css';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';

import { useEvents } from '../../hooks/useApi';
import AddEventModal from '../../components/AddEventModal';

const formatDate = (dateIso) => {
  if (!dateIso) return 'Sem data';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 'Sem data';
  return d.toLocaleDateString('pt-BR');
};

const ITEMS_PER_PAGE = 10;

const EventsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: events = [], isLoading, error } = useEvents();

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter(
      (e) =>
        e.name?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query),
    );
  }, [events, search]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredEvents]);

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
  const upcomingEvents = events.filter((e) => {
    if (!e.start_date) return false;
    return new Date(e.start_date) >= new Date();
  }).length;
  const totalTeamsLinked = new Set(
    events.flatMap((e) => (e.teams || []).map((t) => t.id)),
  ).size;

  return (
    <div className="events-page">
      <div className="events-summary-card">
        <div className="events-summary-title">Gerenciamento de Eventos</div>
        <div className="events-summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total de eventos</div>
            <div className="stat-value">{totalEvents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Próximos eventos</div>
            <div className="stat-value">{upcomingEvents}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Turmas vinculadas</div>
            <div className="stat-value">{totalTeamsLinked}</div>
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
              placeholder="Pesquise por nome ou descrição do evento"
            />
          </div>
          <button
            type="button"
            className="add-event-btn"
            onClick={() => setCreateOpen(true)}
          >
            Criar Evento
          </button>
        </section>

        <section className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>EVENTO</th>
                <th>DATA</th>
                <th>TURMAS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="empty-row">Carregando dados...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="empty-row">Falha ao carregar dados. Tente novamente.</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-row">Nenhum evento encontrado.</td>
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
    </div>
  );
};

export default EventsPage;
