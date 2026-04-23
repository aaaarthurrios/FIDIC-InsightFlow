from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import List
from pydantic import BaseModel
from process_data import process_fidic_data

app = FastAPI(
    title="FIDIC InsightFlow API", 
    description="API para consulta de score de risco de cedentes integrada às bases transacionais"
)

# Configuração de CORS para permitir acesso do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem (ideal para MVP local)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc)
    allow_headers=["*"],  # Permite todos os headers
)

# Caminho para o dataset
DATA_PATH = "data/dataset.csv"

# Modelos de dados
class CedenteSummary(BaseModel):
    id_cnpj: str
    score_risco: float
    classificacao_risco: str
    score_tipo: str

class CedenteDetail(BaseModel):
    id_cnpj: str
    score_risco: float
    classificacao_risco: str
    score_tipo: str
    atraso_medio: float
    taxa_inadimplencia: float
    valor_total: float
    qtd_boletos: int
    uf: str
    sem_historico: int

def load_data():
    if not os.path.exists(DATA_PATH):
        # Tenta processar se o dataset não existir
        success = process_fidic_data()
        if not success:
            return pd.DataFrame()
    return pd.read_csv(DATA_PATH)

@app.get("/")
def read_root():
    return {
        "message": "FIDIC InsightFlow API está online", 
        "status": "ready",
        "endpoints": ["/cedentes", "/score/{id_cnpj}", "/reprocessar"]
    }

@app.get("/cedentes", response_model=List[CedenteSummary])
def list_cedentes(limit: int = 100):
    df = load_data()
    if df.empty:
        raise HTTPException(status_code=500, detail="Base de dados não disponível")
    
    cedentes = df[['id_cnpj', 'score_risco', 'classificacao_risco', 'score_tipo']].head(limit).to_dict(orient='records')
    return cedentes

@app.get("/score/{id_cnpj}", response_model=CedenteDetail)
def get_score(id_cnpj: str):
    df = load_data()
    if df.empty:
        raise HTTPException(status_code=500, detail="Base de dados não disponível")
    
    cedente = df[df['id_cnpj'] == id_cnpj]
    
    if cedente.empty:
        raise HTTPException(status_code=404, detail="Cedente não encontrado")
    
    result = cedente.iloc[0].to_dict()
    
    return CedenteDetail(
        id_cnpj=str(result['id_cnpj']),
        score_risco=float(result['score_risco']),
        classificacao_risco=str(result['classificacao_risco']),
        score_tipo=str(result['score_tipo']),
        atraso_medio=float(result['atraso_medio']),
        taxa_inadimplencia=float(result['taxa_inadimplencia']),
        valor_total=float(result['valor_total']),
        qtd_boletos=int(result['qtd_boletos']),
        uf=str(result['uf']),
        sem_historico=int(result['sem_historico'])
    )

@app.post("/reprocessar")
def reprocessar_dados(background_tasks: BackgroundTasks):
    """
    Endpoint para forçar o reprocessamento das bases CSV na pasta data.
    """
    background_tasks.add_task(process_fidic_data)
    return {"message": "Processamento iniciado em segundo plano"}

if __name__ == "__main__":
    import uvicorn
    # Garantir que os dados existam antes de subir o servidor
    if not os.path.exists(DATA_PATH):
        process_fidic_data()
    uvicorn.run(app, host="0.0.0.0", port=8000)
