import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  IconButton,
  Button
} from '@mui/material';
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

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addValueModalOpen, setAddValueModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load athletes on component mount
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await api.get('/athletes');
        setAthletes(response.data);
        if (response.data.length > 0) {
          setSelectedAthlete(response.data[0].id);
        }
      } catch (error) {
        console.error('Error loading athletes:', error);
      }
    };
    fetchAthletes();
  }, []);

  // Load metrics when an athlete is selected
  useEffect(() => {
    if (selectedAthlete) {
      const fetchMetrics = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/athletes/${selectedAthlete}/metrics`);
          setMetrics(response.data);
        } catch (error) {
          console.error('Error loading metrics:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMetrics();
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
      // Reload metrics
      if (selectedAthlete) {
        const response = await api.get(`/athletes/${selectedAthlete}/metrics`);
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Error deleting metric:', error);
      alert('Error deleting metric. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMetricSuccess = async () => {
    // Reload metrics after adding or editing
    if (selectedAthlete) {
      const response = await api.get(`/athletes/${selectedAthlete}/metrics`);
      setMetrics(response.data);
    }
  };

  const handleAddValue = () => {
    setAddValueModalOpen(true);
  };

  const handleValueSuccess = async () => {
    // Reload metrics after adding a value
    if (selectedAthlete) {
      const response = await api.get(`/athletes/${selectedAthlete}/metrics`);
      setMetrics(response.data);
    }
  };

  // Separate aggregated and non-aggregated metrics
  const simpleMetrics = metrics.filter(m => !m.aggregated);
  const aggregatedMetrics = metrics.filter(m => m.aggregated);

  // Prepare data for charts
  const barChartData = simpleMetrics.map(m => ({
    name: m.name,
    value: m.value || 0
  }));

  const pieChartData = simpleMetrics.filter(m => m.value).map(m => ({
    name: m.name,
    value: m.value
  }));

  return (
    <Box sx={{ minHeight: '100vh', overflowY: 'auto', pb: 6 }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Metrics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize and analyze athlete performance metrics
          </Typography>
        </Box>

      {/* Athlete Selector with Add Metric Button */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl fullWidth>
            <InputLabel id="athlete-select-label">Select an Athlete</InputLabel>
            <Select
              labelId="athlete-select-label"
              id="athlete-select"
              value={selectedAthlete}
              label="Select an Athlete"
              onChange={handleAthleteChange}
            >
              {athletes.map((athlete) => (
                <MenuItem key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMetric}
            sx={{ 
              textTransform: 'none',
              whiteSpace: 'nowrap',
              minWidth: '220px'
            }}
          >
            Add Metric (System-wide)
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : metrics.length === 0 ? (
        <Alert severity="info">
          No metrics found for this athlete.
        </Alert>
      ) : (
        <>
          {/* All Metrics Cards */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000000' }}>
                Metrics
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddValue}
                sx={{ 
                  textTransform: 'none',
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' }
                }}
              >
                Add Value for Athlete
              </Button>
            </Box>
            <Grid container spacing={3}>
              {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={4} key={metric.id}>
                  <Card sx={{ 
                    height: '100%',
                    background: metric.aggregated 
                      ? `linear-gradient(135deg, ${COLORS[index % COLORS.length]}22 0%, ${COLORS[index % COLORS.length]}11 100%)`
                      : 'transparent',
                    border: metric.aggregated 
                      ? `2px solid ${COLORS[index % COLORS.length]}`
                      : `1px solid ${COLORS[index % COLORS.length]}`,
                    borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                    position: 'relative'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          {metric.aggregated && (
                            <Chip 
                              label="Aggregated" 
                              size="small" 
                              sx={{ mb: 1 }}
                              color="primary"
                            />
                          )}
                          <Typography variant="h6" component="div" gutterBottom>
                            {metric.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditMetric(metric)}
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.dark' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteMetric(metric)}
                            sx={{ 
                              bgcolor: 'error.main', 
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      {metric.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {metric.description}
                        </Typography>
                      )}
                      <Typography 
                        variant={metric.aggregated ? "h3" : "h4"} 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: metric.aggregated ? COLORS[index % COLORS.length] : 'inherit'
                        }}
                      >
                        {metric.value !== null ? (metric.aggregated ? metric.value.toFixed(2) : metric.value) : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Charts */}
          {simpleMetrics.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4, fontWeight: 'bold', color: '#000000' }}>
                Charts
              </Typography>
              
              <Grid container spacing={3}>
                {/* Bar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Value Comparison
                    </Typography>
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
                  </Paper>
                </Grid>

                {/* Pie Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Metrics Distribution
                    </Typography>
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
                  </Paper>
                </Grid>

                {/* Line Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Linear Trend
                    </Typography>
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
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
      </Container>

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
    </Box>
  );
}
