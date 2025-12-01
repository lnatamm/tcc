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
  Alert
} from '@mui/material';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function Dashboard() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar atletas ao montar o componente
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await api.get('/athletes');
        setAthletes(response.data);
        if (response.data.length > 0) {
          setSelectedAthlete(response.data[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar atletas:', error);
      }
    };
    fetchAthletes();
  }, []);

  // Carregar métricas quando um atleta é selecionado
  useEffect(() => {
    if (selectedAthlete) {
      const fetchMetrics = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/athletes/${selectedAthlete}/metrics`);
          setMetrics(response.data);
        } catch (error) {
          console.error('Erro ao carregar métricas:', error);
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

  // Separar métricas agregadas e não agregadas
  const simpleMetrics = metrics.filter(m => !m.aggregated);
  const aggregatedMetrics = metrics.filter(m => m.aggregated);

  // Preparar dados para os gráficos
  const barChartData = simpleMetrics.map(m => ({
    name: m.name,
    valor: m.value || 0
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
            Dashboard de Métricas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize e analise as métricas de desempenho dos atletas
          </Typography>
        </Box>

      {/* Seletor de Atleta */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="athlete-select-label">Selecione um Atleta</InputLabel>
          <Select
            labelId="athlete-select-label"
            id="athlete-select"
            value={selectedAthlete}
            label="Selecione um Atleta"
            onChange={handleAthleteChange}
          >
            {athletes.map((athlete) => (
              <MenuItem key={athlete.id} value={athlete.id}>
                {athlete.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : metrics.length === 0 ? (
        <Alert severity="info">
          Nenhuma métrica encontrada para este atleta.
        </Alert>
      ) : (
        <>
          {/* Cards de Todas as Métricas */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
              Métricas
            </Typography>
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
                    borderLeft: `4px solid ${COLORS[index % COLORS.length]}`
                  }}>
                    <CardContent>
                      {metric.aggregated && (
                        <Chip 
                          label="Agregada" 
                          size="small" 
                          sx={{ mb: 1 }}
                          color="primary"
                        />
                      )}
                      <Typography variant="h6" component="div" gutterBottom>
                        {metric.name}
                      </Typography>
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

          {/* Gráficos */}
          {simpleMetrics.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4, fontWeight: 'bold', color: '#000000' }}>
                Gráficos
              </Typography>
              
              <Grid container spacing={3}>
                {/* Gráfico de Barras */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Comparação de Valores
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
                        <Bar dataKey="valor" fill="#8884d8" name="Valor">
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Gráfico de Pizza */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Distribuição de Métricas
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

                {/* Gráfico de Linha */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Tendência Linear
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
                          dataKey="valor" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Valor"
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
    </Box>
  );
}
