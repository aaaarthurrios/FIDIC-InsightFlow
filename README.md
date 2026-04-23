# 🏦 FIDIC InsightFlow 1

Sistema de análise de risco para cedentes em operações FIDC com dashboard interativo.

## 📋 Para Que Serve?

Automatiza o cálculo de scores de risco de cedentes através de processamento inteligente de dados transacionais, permitindo:
- ✅ Análise automática de risco (Baixo/Médio/Alto)
- ✅ Visualização clara em dashboard interativo
- ✅ Consulta de métricas de inadimplência e atrasos
- ✅ Tomada de decisão baseada em dados

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 18+

### Backend (Terminal 1)
```bash
cd fidic_backend
pip install -r requirements.txt
python main.py
```
Acesse: http://localhost:8000

### Frontend (Terminal 2)
```bash
cd fidic-dashboard
npm install
npm run dev
```
Acesse: http://localhost:5173

## 📊 O que Você Vai Ver

- **5 KPIs**: Total cedentes, Baixo/Médio/Alto Risco, Score Médio
- **Gráfico de Pizza**: Distribuição de cedentes por nível de risco
- **Gráfico de Barras**: Top 20 cedentes com scores
- **Tabela Interativa**: Lista de 100+ cedentes
- **Painel de Detalhes**: Inadimplência, atrasos, valores por cedente

## 🔌 API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Status da API |
| `/cedentes` | GET | Lista cedentes com scores |
| `/score/{id_cnpj}` | GET | Detalhes de um cedente |
| `/reprocessar` | POST | Reprocessar dados |

**Documentação interativa**: http://localhost:8000/docs

## 🎯 Classificação de Risco

| Score | Classificação |
|-------|----------------|
| ≥ 0.75 | Baixo Risco |
| 0.50 - 0.74 | Médio Risco |
| < 0.50 | Alto Risco |

## 📁 Estrutura

```
fidic-dashboard-complete/
├── data/                          ← Dados brutos
│   ├── base_auxiliar_fiap.csv
│   ├── base_boletos_fiap.csv
│   └── dataset.csv
│
├── fidic_backend/                 ← Backend (FastAPI)
│   ├── __pycache__/
│   ├── main.py
│   ├── process_data.py
│   ├── README.md
│   └── requirements.txt
│
├── fidic-dashboard/               ← Frontend (React)
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── pnpm-lock.yaml
│   ├── SETUP_GUIDE.md
│   ├── vite.config.js
│   └── README.md
│
└── README.md                      ← Este arquivo
```

## 🛠️ Stack

**Frontend**: React 19 + Vite + Recharts  
**Backend**: FastAPI + Uvicorn + Pandas + Scikit-learn

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Port 8000 already in use" | `taskkill /PID <PID> /F` (Windows) ou `kill -9 <PID>` (Mac/Linux) |
| "npm not found" | Instale Node.js: https://nodejs.org/ |
| "python not found" | Instale Python 3.11+: https://www.python.org/ |
| Dashboard vazio | Verifique se backend está rodando em http://localhost:8000 |

## ✅ Checklist

- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] Backend rodando (`python main.py`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Dashboard abrindo em http://localhost:5173

---

**Pronto! Seu dashboard está rodando! 🎉**
