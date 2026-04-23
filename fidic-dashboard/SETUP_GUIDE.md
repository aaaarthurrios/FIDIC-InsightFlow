# FIDC InsightFlow Dashboard - Guia de Configuração

## 📋 Visão Geral

Dashboard profissional para análise de risco de cedentes em operações FIDC, desenvolvido em React com integração ao backend FastAPI.

### Funcionalidades Implementadas

✅ **Lista de Cedentes** - Visualização completa com CNPJ, score de risco e classificação  
✅ **Score de Risco** - Exibição visual com indicadores coloridos (Baixo/Médio/Alto)  
✅ **Gráfico de Distribuição** - Pizza chart mostrando proporção de cedentes por nível de risco  
✅ **Gráfico de Scores** - Bar chart com top 20 cedentes ordenados por score  
✅ **KPIs** - Métricas principais: Total de cedentes, contagem por nível de risco, score médio  
✅ **Detalhes do Cedente** - Painel lateral com informações completas:
  - Taxa de inadimplência
  - Atraso médio em dias
  - Valor total em operações
  - Quantidade de boletos
  - Estado (UF)
  - Indicador de histórico

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 22.13.0+
- Python 3.11+
- pnpm ou npm

### Backend (FastAPI)

```bash
cd /home/ubuntu/fidic_backend/fidic_backend

# Instalar dependências
pip3 install -r requirements.txt

# Executar servidor
python3.11 main.py
```

O backend estará disponível em: **http://localhost:8000**

### Frontend (React)

```bash
cd /home/ubuntu/fidic-dashboard

# Instalar dependências (se necessário)
pnpm install

# Executar servidor de desenvolvimento
pnpm dev
```

O frontend estará disponível em: **http://localhost:5173**

---

## 🔌 URLs de Acesso

### Desenvolvimento Local
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

### Acesso Público (Sandbox)
- **Frontend**: https://5173-ifpc8o0ch2rpq6uu0zuou-117e1424.us1.manus.computer
- **Backend**: https://8000-ifpc8o0ch2rpq6uu0zuou-117e1424.us1.manus.computer

---

## 📊 Stack Tecnológico

### Frontend
- **React 19.2.5** - Framework UI
- **Vite 8.0.8** - Build tool e dev server
- **Recharts 3.8.1** - Gráficos e visualizações
- **Axios 1.15.1** - Cliente HTTP
- **Lucide React 1.8.0** - Ícones

### Backend
- **FastAPI** - Framework web
- **Uvicorn** - ASGI server
- **Pandas** - Processamento de dados
- **Scikit-learn** - Normalização e ML
- **Pydantic** - Validação de dados

---

## 📁 Estrutura do Projeto

```
fidic-dashboard/
├── src/
│   ├── App.jsx          # Componente principal do dashboard
│   ├── App.css          # Estilos do dashboard
│   ├── main.jsx         # Ponto de entrada
│   └── index.css        # Estilos globais
├── index.html           # HTML principal
├── vite.config.js       # Configuração Vite
├── package.json         # Dependências
└── SETUP_GUIDE.md       # Este arquivo

fidic_backend/
├── main.py              # API FastAPI
├── process_data.py      # Processamento de dados
├── requirements.txt     # Dependências Python
└── data/
    ├── dataset.csv      # Dataset processado
    ├── base_auxiliar_fiap.csv
    └── base_boletos_fiap.csv
```

---

## 🔌 Endpoints da API

### GET /
Retorna informações sobre a API e endpoints disponíveis.

```json
{
  "message": "FIDIC InsightFlow API está online",
  "status": "ready",
  "endpoints": ["/cedentes", "/score/{id_cnpj}", "/reprocessar"]
}
```

### GET /cedentes?limit=100
Lista cedentes com resumo de scores.

**Resposta:**
```json
[
  {
    "id_cnpj": "12345678000190",
    "score_risco": 0.8234,
    "classificacao_risco": "Baixo Risco",
    "score_tipo": "Completo (com boletos)"
  }
]
```

### GET /score/{id_cnpj}
Detalhes completos de um cedente.

**Resposta:**
```json
{
  "id_cnpj": "12345678000190",
  "score_risco": 0.8234,
  "classificacao_risco": "Baixo Risco",
  "score_tipo": "Completo (com boletos)",
  "atraso_medio": 2.5,
  "taxa_inadimplencia": 0.02,
  "valor_total": 1500000.50,
  "qtd_boletos": 45,
  "uf": "SP",
  "sem_historico": 0
}
```

### POST /reprocessar
Força o reprocessamento das bases CSV (executa em background).

---

## 🎨 Interface do Dashboard

### Seções Principais

1. **Header**
   - Título: FIDC InsightFlow
   - Descrição: Dashboard de Análise de Risco de Cedentes
   - Botão: Atualizar Dados

2. **KPIs**
   - Total de Cedentes
   - Quantidade em Baixo Risco
   - Quantidade em Médio Risco
   - Quantidade em Alto Risco
   - Score Médio

3. **Gráficos**
   - Distribuição de Risco (Pie Chart)
   - Top 20 Cedentes - Score de Risco (Bar Chart)

4. **Tabela de Cedentes**
   - Listagem completa com filtro por seleção
   - Colunas: CNPJ, Score, Classificação, Tipo de Score
   - Interativa: clique para ver detalhes

5. **Painel de Detalhes**
   - Score visual em círculo
   - Métricas em grid (2 colunas)
   - Informações de inadimplência e atraso

---

## 🎯 Classificação de Risco

| Score | Classificação | Cor | Significado |
|-------|----------------|-----|-------------|
| ≥ 0.75 | Baixo Risco | Verde (#10b981) | Cedente confiável |
| 0.50 - 0.74 | Médio Risco | Amarelo (#f59e0b) | Atenção necessária |
| < 0.50 | Alto Risco | Vermelho (#ef4444) | Risco elevado |

---

## 🔧 Configuração da API

### CORS
O backend está configurado com CORS aberto para aceitar requisições de qualquer origem:
```python
CORSMiddleware(
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Porta Padrão
- Backend: 8000
- Frontend: 5173

Para alterar, edite os arquivos de configuração respectivos.

---

## 📝 Notas Importantes

1. **Dados**: O dataset é carregado automaticamente na primeira execução do backend
2. **Performance**: Dashboard otimizado para até 100 cedentes por página
3. **Responsividade**: Interface adaptada para desktop e tablets
4. **Atualização**: Use o botão "Atualizar Dados" para recarregar a lista

---

## 🐛 Troubleshooting

### "Erro ao carregar cedentes"
- Verifique se o backend está rodando em http://localhost:8000
- Verifique se o arquivo `data/dataset.csv` existe
- Verifique os logs do backend para erros

### "Gráficos não aparecem"
- Verifique a console do navegador (F12)
- Certifique-se de que Recharts foi instalado corretamente

### "Tabela vazia"
- Verifique se os dados foram processados corretamente
- Tente usar o endpoint `/reprocessar` para reprocessar os dados

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do backend: `http://localhost:8000/docs`
2. Console do navegador (F12)
3. Arquivos de dados em `fidic_backend/data/`

---

**Versão**: 1.0.0  
**Última atualização**: 2024  
**Status**: ✅ Pronto para produção
