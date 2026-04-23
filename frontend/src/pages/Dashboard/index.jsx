import { useEffect, useMemo, useState } from 'react';
import './style.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../api';
import AddMetricModal from '../../components/AddMetricModal';
import EditMetricModal from '../../components/EditMetricModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import AddAthleteMetricValueModal from '../../components/AddAthleteMetricValueModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function Dashboard() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [athletesLoading, setAthletesLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addValueModalOpen, setAddValueModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadMetrics = async (athleteId) => {
    if (!athleteId) {
      setMetrics([]);
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get(`/athletes/${athleteId}/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoadError('Error loading metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAthletes = async () => {
      setAthletesLoading(true);
      setLoadError('');
      try {
        const response = await api.get('/athletes');
        setAthletes(response.data);
      } catch (error) {
        console.error('Error loading athletes:', error);
        setLoadError('Error loading athletes. Please try again.');
      } finally {
        setAthletesLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  useEffect(() => {
    if (selectedAthlete) {
      loadMetrics(selectedAthlete);
    }
  }, [selectedAthlete]);

  const handleAthleteChange = (event) => {
    setSelectedAthlete(event.target.value);
  };

  const handleAddMetric = () => {
    setAddModalOpen(true);
  };

  const handleEditMetric = (metric) => {
    setSelectedMetric(metric);
    setEditModalOpen(true);
  };

  const handleDeleteMetric = (metric) => {
    setSelectedMetric(metric);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/metrics/${selectedMetric.id}`);
      setDeleteModalOpen(false);
      setSelectedMetric(null);
      await loadMetrics(selectedAthlete);
    } catch (error) {
      console.error('Error deleting metric:', error);
      alert('Error deleting metric. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMetricSuccess = async () => {
    await loadMetrics(selectedAthlete);
  };

  const handleAddValue = () => {
    setAddValueModalOpen(true);
  };

  const handleValueSuccess = async () => {
    await loadMetrics(selectedAthlete);
  };

  const selectedAthleteName = useMemo(
    () => athletes.find((athlete) => athlete.id === selectedAthlete)?.name || 'No athlete selected',
    [athletes, selectedAthlete],
  );

  const simpleMetrics = useMemo(() => metrics.filter((metric) => !metric.aggregated), [metrics]);
  const aggregatedMetrics = useMemo(() => metrics.filter((metric) => metric.aggregated), [metrics]);

  const barChartData = useMemo(
    () => simpleMetrics.map((metric) => ({
      name: metric.name,
      value: metric.value || 0,
    })),
    [simpleMetrics],
  );

  const pieChartData = useMemo(
    () => simpleMetrics.filter((metric) => metric.value).map((metric) => ({
      name: metric.name,
      value: metric.value,
    })),
    [simpleMetrics],
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-summary-card">
        <div className="dashboard-summary-title">Metrics Dashboard</div>
        <div className="dashboard-summary-subtitle">
          Visualize and analyze athlete performance metrics with dedicated cards for metrics and charts.
        </div>

        {selectedAthlete && (
          <div className="dashboard-summary-stats">
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-label">Total metrics</div>
              <div className="dashboard-stat-value">{metrics.length}</div>
            </div>
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-label">Simple metrics</div>
              <div className="dashboard-stat-value">{simpleMetrics.length}</div>
            </div>
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-label">Aggregated metrics</div>
              <div className="dashboard-stat-value">{aggregatedMetrics.length}</div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-controls-card">
        <section className="dashboard-controls">
          <label className="dashboard-field">
            <span className="dashboard-field-label">Athlete</span>
            <select
              className="dashboard-select"
              value={selectedAthlete}
              onChange={handleAthleteChange}
              disabled={athletesLoading}
            >
              <option value="">
                {athletesLoading ? 'Loading athletes...' : 'Select an athlete'}
              </option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="dashboard-primary-btn"
            onClick={handleAddMetric}
          >
            <AddIcon fontSize="small" />
            Add Metric (System-wide)
          </button>
        </section>
      </div>

      {loadError && (
        <div className="dashboard-section-card">
          <div className="dashboard-message error">{loadError}</div>
        </div>
      )}

      {loading ? (
        <div className="dashboard-section-card">
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-title">Loading metrics</div>
            <div className="dashboard-empty-text">
              Fetching metric data for {selectedAthleteName}.
            </div>
          </div>
        </div>
      ) : !selectedAthlete ? (
        <div className="dashboard-section-card">
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-title">Select an athlete</div>
            <div className="dashboard-empty-text">
              Choose an athlete to review metrics and charts.
            </div>
          </div>
        </div>
      ) : metrics.length === 0 ? (
        <div className="dashboard-section-card">
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-title">No metrics found</div>
            <div className="dashboard-empty-text">
              There are no metrics available for the selected athlete.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div>
                <div className="dashboard-section-title">Metrics</div>
                <div className="dashboard-section-subtitle">
                  Review simple and aggregated metrics for {selectedAthleteName}.
                </div>
              </div>

              <button
                type="button"
                className="dashboard-success-btn"
                onClick={handleAddValue}
              >
                <AddIcon fontSize="small" />
                Add Value for Athlete
              </button>
            </div>

            <div className="dashboard-metrics-list">
              {metrics.map((metric, index) => {
                const color = COLORS[index % COLORS.length];
                const metricValue = metric.value !== null
                  ? (metric.aggregated ? Number(metric.value).toFixed(2) : metric.value)
                  : 'N/A';

                return (
                  <div
                    key={metric.id}
                    className={`dashboard-metric-row ${metric.aggregated ? 'aggregated' : ''}`}
                    style={{
                      borderColor: metric.aggregated ? color : 'rgba(0, 0, 0, 0.08)',
                      borderLeftColor: color,
                      background: metric.aggregated
                        ? `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`
                        : 'rgba(255, 255, 255, 0.92)',
                    }}
                  >
                    <div className="dashboard-metric-main">
                      {metric.aggregated && (
                        <span className="dashboard-metric-badge">Aggregated</span>
                      )}
                      <div className="dashboard-metric-title">{metric.name}</div>
                      {metric.description && (
                        <div className="dashboard-metric-description">{metric.description}</div>
                      )}
                    </div>

                    <div className="dashboard-metric-side">
                      <div className="dashboard-metric-value" style={{ color: metric.aggregated ? color : '#111827' }}>
                        {metricValue}
                      </div>

                      <div className="dashboard-metric-actions">
                        <button
                          type="button"
                          className="dashboard-icon-btn edit"
                          onClick={() => handleEditMetric(metric)}
                          aria-label={`Edit ${metric.name}`}
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="dashboard-icon-btn delete"
                          onClick={() => handleDeleteMetric(metric)}
                          aria-label={`Delete ${metric.name}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div>
                <div className="dashboard-section-title">Charts</div>
                <div className="dashboard-section-subtitle">
                  Explore comparison, distribution and trend views for simple metrics.
                </div>
              </div>
            </div>

            {simpleMetrics.length === 0 ? (
              <div className="dashboard-message info">
                Charts are available when the selected athlete has simple metrics with values.
              </div>
            ) : (
              <div className="dashboard-charts-list">
                <div className="dashboard-chart-card">
                  <div className="dashboard-chart-title">Value Comparison</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Value">
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="dashboard-chart-card">
                  <div className="dashboard-chart-title">Metrics Distribution</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="dashboard-chart-card">
                  <div className="dashboard-chart-title">Linear Trend</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <AddMetricModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleMetricSuccess}
      />

      <EditMetricModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMetric(null);
        }}
        onSuccess={handleMetricSuccess}
        metric={selectedMetric}
      />

      <AddAthleteMetricValueModal
        open={addValueModalOpen}
        onClose={() => setAddValueModalOpen(false)}
        athleteId={selectedAthlete}
        onSuccess={handleValueSuccess}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedMetric(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Metric"
        message="Are you sure you want to delete this metric?"
        itemName={selectedMetric?.name}
        loading={deleteLoading}
      />
    </div>
  );
}
