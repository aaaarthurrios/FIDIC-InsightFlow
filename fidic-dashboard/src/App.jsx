import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertCircle, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [cedentes, setCedentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCedente, setSelectedCedente] = useState(null);
  const [detalhes, setDetalhes] = useState(null);

  // Cores para classificação de risco
  const riskColors = {
    'Baixo Risco': '#10b981',
    'Médio Risco': '#f59e0b',
    'Alto Risco': '#ef4444'
  };

  const riskColorsDark = {
    'Baixo Risco': '#059669',
    'Médio Risco': '#d97706',
    'Alto Risco': '#dc2626'
  };

  // Carregar lista de cedentes
  useEffect(() => {
    fetchCedentes();
  }, []);

  const fetchCedentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/cedentes?limit=100`);
      setCedentes(response.data);
      if (response.data.length > 0) {
        setSelectedCedente(response.data[0].id_cnpj);
        fetchDetalhes(response.data[0].id_cnpj);
      }
    } catch (err) {
      setError('Erro ao carregar cedentes. Verifique se o backend está rodando em http://localhost:8000');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetalhes = async (cnpj) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/score/${cnpj}`);
      setDetalhes(response.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    }
  };

  const handleSelectCedente = (cnpj) => {
    setSelectedCedente(cnpj);
    fetchDetalhes(cnpj);
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    if (cedentes.length === 0) return null;

    const stats = {
      totalCedentes: cedentes.length,
      baixoRisco: cedentes.filter(c => c.classificacao_risco === 'Baixo Risco').length,
      medioRisco: cedentes.filter(c => c.classificacao_risco === 'Médio Risco').length,
      altoRisco: cedentes.filter(c => c.classificacao_risco === 'Alto Risco').length,
      scoreMediano: (cedentes.reduce((sum, c) => sum + c.score_risco, 0) / cedentes.length).toFixed(2)
    };
    return stats;
  };

  // Dados para gráfico de distribuição
  const distribuicaoRisco = () => {
    const stats = calcularEstatisticas();
    if (!stats) return [];
    return [
      { name: 'Baixo Risco', value: stats.baixoRisco, fill: riskColors['Baixo Risco'] },
      { name: 'Médio Risco', value: stats.medioRisco, fill: riskColors['Médio Risco'] },
      { name: 'Alto Risco', value: stats.altoRisco, fill: riskColors['Alto Risco'] }
    ];
  };

  // Dados para gráfico de scores
  const dadosScores = cedentes.slice(0, 20).map(c => ({
    cnpj: c.id_cnpj.substring(0, 8) + '...',
    score: (c.score_risco * 100).toFixed(1),
    risco: c.classificacao_risco
  }));

  const stats = calcularEstatisticas();

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Erro ao Conectar</h2>
          <p>{error}</p>
          <button onClick={fetchCedentes} className="retry-btn">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>FIDC InsightFlow</h1>
          <p>Dashboard de Análise de Risco de Cedentes</p>
        </div>
        <button onClick={fetchCedentes} className="refresh-btn">Atualizar Dados</button>
      </header>

      {/* KPIs */}
      <section className="kpis">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe' }}>
            <Users size={24} color="#0284c7" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Cedentes</p>
            <h3 className="kpi-value">{stats?.totalCedentes || 0}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7' }}>
            <TrendingUp size={24} color="#16a34a" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Baixo Risco</p>
            <h3 className="kpi-value" style={{ color: riskColors['Baixo Risco'] }}>
              {stats?.baixoRisco || 0}
            </h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7' }}>
            <AlertTriangle size={24} color="#d97706" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Médio Risco</p>
            <h3 className="kpi-value" style={{ color: riskColors['Médio Risco'] }}>
              {stats?.medioRisco || 0}
            </h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fee2e2' }}>
            <AlertCircle size={24} color="#dc2626" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Alto Risco</p>
            <h3 className="kpi-value" style={{ color: riskColors['Alto Risco'] }}>
              {stats?.altoRisco || 0}
            </h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f3e8ff' }}>
            <DollarSign size={24} color="#a855f7" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Score Médio</p>
            <h3 className="kpi-value">{stats?.scoreMediano || 0}</h3>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section className="charts-section">
        <div className="chart-container">
          <h2>Distribuição de Risco</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoRisco()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoRisco().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Top 20 Cedentes - Score de Risco</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cnpj" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tabela de Cedentes e Detalhes */}
      <section className="content-section">
        <div className="cedentes-list">
          <h2>Lista de Cedentes</h2>
          <div className="table-wrapper">
            <table className="cedentes-table">
              <thead>
                <tr>
                  <th>CNPJ</th>
                  <th>Score de Risco</th>
                  <th>Classificação</th>
                  <th>Tipo de Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cedentes.map((cedente) => (
                  <tr
                    key={cedente.id_cnpj}
                    className={selectedCedente === cedente.id_cnpj ? 'selected' : ''}
                    onClick={() => handleSelectCedente(cedente.id_cnpj)}
                  >
                    <td className="cnpj-cell">{cedente.id_cnpj}</td>
                    <td>
                      <div className="score-badge">
                        {(cedente.score_risco * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td>
                      <span
                        className="risk-badge"
                        style={{
                          backgroundColor: riskColors[cedente.classificacao_risco],
                          color: 'white'
                        }}
                      >
                        {cedente.classificacao_risco}
                      </span>
                    </td>
                    <td className="score-type">{cedente.score_tipo}</td>
                    <td className="action-cell">
                      <button
                        className="select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCedente(cedente.id_cnpj);
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detalhes && (
          <div className="cedente-details">
            <h2>Detalhes do Cedente</h2>
            <div className="details-card">
              <div className="detail-header">
                <h3>{detalhes.id_cnpj}</h3>
                <span
                  className="risk-badge-large"
                  style={{
                    backgroundColor: riskColors[detalhes.classificacao_risco],
                    color: 'white'
                  }}
                >
                  {detalhes.classificacao_risco}
                </span>
              </div>

              <div className="score-section">
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-value">
                      {(detalhes.score_risco * 100).toFixed(1)}
                    </span>
                    <span className="score-label">%</span>
                  </div>
                  <div className="score-info">
                    <p><strong>Score:</strong> {detalhes.score_risco.toFixed(4)}</p>
                    <p><strong>Tipo:</strong> {detalhes.score_tipo}</p>
                  </div>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric">
                  <p className="metric-label">Taxa de Inadimplência</p>
                  <p className="metric-value">
                    {(detalhes.taxa_inadimplencia * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="metric">
                  <p className="metric-label">Atraso Médio (dias)</p>
                  <p className="metric-value">{detalhes.atraso_medio.toFixed(1)}</p>
                </div>
                <div className="metric">
                  <p className="metric-label">Valor Total (R$)</p>
                  <p className="metric-value">
                    {detalhes.valor_total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
                <div className="metric">
                  <p className="metric-label">Quantidade de Boletos</p>
                  <p className="metric-value">{detalhes.qtd_boletos}</p>
                </div>
                <div className="metric">
                  <p className="metric-label">UF</p>
                  <p className="metric-value">{detalhes.uf}</p>
                </div>
                <div className="metric">
                  <p className="metric-label">Sem Histórico</p>
                  <p className="metric-value">{detalhes.sem_historico === 1 ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 FIDC InsightFlow - Dashboard de Análise de Risco</p>
      </footer>
    </div>
  );
}
