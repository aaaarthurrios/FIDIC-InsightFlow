import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os

def process_fidic_data(data_dir="data"):
    aux_path = os.path.join(data_dir, "base_auxiliar_fiap.csv")
    boletos_path = os.path.join(data_dir, "base_boletos_fiap.csv")
    output_path = os.path.join(data_dir, "dataset.csv")

    if not os.path.exists(aux_path) or not os.path.exists(boletos_path):
        print("Arquivos base não encontrados na pasta data.")
        return False

    # 1. IMPORTAR BASES
    aux = pd.read_csv(aux_path)
    boletos = pd.read_csv(boletos_path)

    # 2. LIMPEZA E CONVERSÃO
    aux = aux.drop_duplicates()
    boletos = boletos.drop_duplicates()

    for col in ['dt_emissao', 'dt_vencimento', 'dt_pagamento']:
        boletos[col] = pd.to_datetime(boletos[col], errors='coerce')

    for col in ['vlr_nominal', 'vlr_baixa']:
        boletos[col] = pd.to_numeric(boletos[col], errors='coerce')

    boletos['vlr_baixa'] = boletos['vlr_baixa'].fillna(0)

    # 3. TRATAR BASE AUXILIAR
    for col in aux.select_dtypes(include=['number']).columns:
        aux[col] = aux[col].fillna(aux[col].median())

    for col in aux.select_dtypes(include=['object', 'string']).columns:
        aux[col] = aux[col].fillna("Sem Info")

    # 4. MÉTRICAS TRANSACIONAIS
    boletos['atraso_dias'] = (
        boletos['dt_pagamento'] - boletos['dt_vencimento']
    ).dt.days.fillna(0).clip(lower=0)

    boletos['pagou_atrasado'] = np.where(boletos['atraso_dias'] > 0, 1, 0)
    boletos['inadimplente'] = np.where(boletos['dt_pagamento'].isna(), 1, 0)
    boletos['perda_financeira'] = boletos['vlr_nominal'] - boletos['vlr_baixa']
    boletos['prazo_pagamento'] = (
        boletos['dt_pagamento'] - boletos['dt_emissao']
    ).dt.days.fillna(0)

    # 5. AGREGAÇÃO POR BENEFICIÁRIO
    agg = boletos.groupby('id_beneficiario').agg(
        qtd_boletos=('id_boleto', 'count'),
        valor_total=('vlr_nominal', 'sum'),
        valor_recebido=('vlr_baixa', 'sum'),
        atraso_medio=('atraso_dias', 'mean'),
        taxa_atraso=('pagou_atrasado', 'mean'),
        taxa_inadimplencia=('inadimplente', 'mean'),
        perda_total=('perda_financeira', 'sum'),
        prazo_medio_pagamento=('prazo_pagamento', 'mean')
    ).reset_index()

    # 6. MERGE COM BASE AUXILIAR
    dataset_final = aux.merge(
        agg,
        left_on='id_cnpj',
        right_on='id_beneficiario',
        how='left'
    )
    dataset_final.drop(columns='id_beneficiario', inplace=True)

    # 7. FLAG SEM HISTÓRICO
    dataset_final['sem_historico'] = np.where(
        dataset_final['qtd_boletos'].isna(), 1, 0
    )

    # 8. TRATAR NULOS FINAIS
    num_cols = dataset_final.select_dtypes(include=['number']).columns
    dataset_final[num_cols] = dataset_final[num_cols].fillna(0)

    txt_cols = dataset_final.select_dtypes(include=['object', 'string']).columns
    dataset_final[txt_cols] = dataset_final[txt_cols].fillna("Sem Info")

    # 9. TRANSFORMAÇÃO LOG NO ATRASO MÉDIO
    atraso_max = dataset_final['atraso_medio'].max() + 1
    dataset_final['atraso_log_inv'] = (
        1 - np.log1p(dataset_final['atraso_medio']) / np.log1p(atraso_max)
    ).clip(0, 1)

    # 10. NORMALIZAR FEATURES
    cols_normalizar = [
        'score_quantidade_v2',
        'score_materialidade_v2',
        'cedente_indice_liquidez_1m',
        'sacado_indice_liquidez_1m',
        'media_atraso_dias',
        'indicador_liquidez_quantitativo_3m',
        'share_vl_inad_pag_bol_6_a_15d',
    ]

    scaler = MinMaxScaler()
    dataset_final[cols_normalizar] = scaler.fit_transform(dataset_final[cols_normalizar])

    dataset_final['media_atraso_inv'] = 1 - dataset_final['media_atraso_dias']
    dataset_final['share_inad_inv'] = 1 - dataset_final['share_vl_inad_pag_bol_6_a_15d']

    # 11. SCORE COMPLETO (com histórico)
    def calcular_score(df):
        return (
            df['score_quantidade_v2'] * 0.20 +
            df['score_materialidade_v2'] * 0.10 +
            df['cedente_indice_liquidez_1m'] * 0.15 +
            (1 - df['taxa_inadimplencia']) * 0.20 +
            (1 - df['taxa_atraso']) * 0.10 +
            df['atraso_log_inv'] * 0.08 +
            df['sacado_indice_liquidez_1m'] * 0.10 +
            df['indicador_liquidez_quantitativo_3m'] * 0.07
        ).clip(0, 1)

    dataset_final['score_risco'] = calcular_score(dataset_final)

    # 12. SCORE PARCIAL PARA SEM HISTÓRICO
    mask_sem = dataset_final['sem_historico'] == 1
    score_aux = (
        dataset_final.loc[mask_sem, 'cedente_indice_liquidez_1m'] * 0.35 +
        dataset_final.loc[mask_sem, 'sacado_indice_liquidez_1m'] * 0.30 +
        dataset_final.loc[mask_sem, 'indicador_liquidez_quantitativo_3m'] * 0.20 +
        dataset_final.loc[mask_sem, 'score_quantidade_v2'] * 0.15
    ).clip(0, 1)

    dataset_final.loc[mask_sem, 'score_risco'] = (
        0.30 + score_aux * 0.35
    ).clip(0.30, 0.65)

    dataset_final['score_tipo'] = np.where(
        dataset_final['sem_historico'] == 1,
        'Parcial (sem boletos)',
        'Completo (com boletos)'
    )

    # 13. CLASSIFICAÇÃO DE RISCO
    def classificar(score):
        if score >= 0.75:
            return 'Baixo Risco'
        elif score >= 0.50:
            return 'Médio Risco'
        else:
            return 'Alto Risco'

    dataset_final['classificacao_risco'] = dataset_final['score_risco'].apply(classificar)

    # 14. ORDENAR E EXPORTAR
    dataset_final = dataset_final.sort_values(by='score_risco', ascending=False)
    dataset_final.to_csv(output_path, index=False)
    return True

if __name__ == "__main__":
    process_fidic_data()
    print("Dados processados com sucesso.")
