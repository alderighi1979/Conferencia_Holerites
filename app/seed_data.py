"""
Script para repopular as tabelas INSS, IRRF, Config Simplificada e Eventos
com dados iniciais. Execute quando as tabelas estiverem vazias.

Uso (na pasta do projeto):
  py -m app.seed_data
  ou
  python -m app.seed_data
"""

import sys
import os

# Garantir que o diretório do projeto está no path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import (
    Tabela_INSS, Tabela_IRRF, Tabela_Config_Simplificada, Tabela_Eventos,
    TipoEventoEnum, IncidenciaEnum
)


def criar_tabelas():
    """Cria as tabelas se não existirem."""
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas/verificadas.")


def seed_inss(db):
    """Popula a tabela INSS com faixas de 2024/2025."""
    faixas = [
        {"faixa_inicial": 0, "faixa_final": 1320.00, "aliquota": 7.5, "valor_deduzir": 0},
        {"faixa_inicial": 1320.01, "faixa_final": 2571.29, "aliquota": 9, "valor_deduzir": 19.80},
        {"faixa_inicial": 2571.30, "faixa_final": 3856.94, "aliquota": 12, "valor_deduzir": 96.94},
        {"faixa_inicial": 3856.95, "faixa_final": 7507.49, "aliquota": 14, "valor_deduzir": 174.08},
    ]
    for f in faixas:
        registro = Tabela_INSS(**f)
        db.add(registro)
    db.commit()
    print(f"  INSS: {len(faixas)} faixas inseridas.")


def seed_irrf(db):
    """Popula a tabela IRRF com faixas de 2024/2025."""
    faixas = [
        {"faixa_inicial": 0, "faixa_final": 2112.00, "aliquota": 0, "parcela_deduzir": 0, "valor_por_dependente": 189.59},
        {"faixa_inicial": 2112.01, "faixa_final": 2826.65, "aliquota": 7.5, "parcela_deduzir": 158.40, "valor_por_dependente": 189.59},
        {"faixa_inicial": 2826.66, "faixa_final": 3751.05, "aliquota": 15, "parcela_deduzir": 370.40, "valor_por_dependente": 189.59},
        {"faixa_inicial": 3751.06, "faixa_final": 4664.68, "aliquota": 22.5, "parcela_deduzir": 651.73, "valor_por_dependente": 189.59},
        {"faixa_inicial": 4664.69, "faixa_final": 999999.99, "aliquota": 27.5, "parcela_deduzir": 884.96, "valor_por_dependente": 189.59},
    ]
    for f in faixas:
        registro = Tabela_IRRF(**f)
        db.add(registro)
    db.commit()
    print(f"  IRRF: {len(faixas)} faixas inseridas.")


def seed_config_simplificada(db):
    """Popula a tabela Config Simplificada."""
    db.add(Tabela_Config_Simplificada(valor_desconto_padrao=528.00))
    db.commit()
    print("  Config Simplificada: 1 registro inserido.")


def seed_eventos(db):
    """Popula a tabela Eventos com eventos comuns. Incidência: SOMA (+), DIMINUI (-), ISENTO (0)."""
    eventos = [
        {"codigo_evento": 1, "descricao": "Salário Base", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.SOMA, "fgts_ferias": IncidenciaEnum.SOMA, "irrf_ferias": IncidenciaEnum.SOMA},
        {"codigo_evento": 2, "descricao": "Vale Transporte", "tipo": TipoEventoEnum.DESCONTO,
         "inss_mensal": IncidenciaEnum.ISENTO, "fgts_mensal": IncidenciaEnum.ISENTO, "irrf_mensal": IncidenciaEnum.ISENTO,
         "inss_13": IncidenciaEnum.ISENTO, "fgts_13": IncidenciaEnum.ISENTO, "irrf_13": IncidenciaEnum.ISENTO,
         "inss_ferias": IncidenciaEnum.ISENTO, "fgts_ferias": IncidenciaEnum.ISENTO, "irrf_ferias": IncidenciaEnum.ISENTO},
        {"codigo_evento": 3, "descricao": "Vale Refeição", "tipo": TipoEventoEnum.DESCONTO,
         "inss_mensal": IncidenciaEnum.ISENTO, "fgts_mensal": IncidenciaEnum.ISENTO, "irrf_mensal": IncidenciaEnum.ISENTO,
         "inss_13": IncidenciaEnum.ISENTO, "fgts_13": IncidenciaEnum.ISENTO, "irrf_13": IncidenciaEnum.ISENTO,
         "inss_ferias": IncidenciaEnum.ISENTO, "fgts_ferias": IncidenciaEnum.ISENTO, "irrf_ferias": IncidenciaEnum.ISENTO},
        {"codigo_evento": 4, "descricao": "Horas Extras", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.SOMA, "fgts_ferias": IncidenciaEnum.SOMA, "irrf_ferias": IncidenciaEnum.SOMA},
        {"codigo_evento": 5, "descricao": "Adicional Noturno", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.SOMA, "fgts_ferias": IncidenciaEnum.SOMA, "irrf_ferias": IncidenciaEnum.SOMA},
        {"codigo_evento": 6, "descricao": "Comissões", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.ISENTO, "fgts_ferias": IncidenciaEnum.ISENTO, "irrf_ferias": IncidenciaEnum.ISENTO},
        {"codigo_evento": 7, "descricao": "Hora Normal Diurna", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.SOMA, "fgts_ferias": IncidenciaEnum.SOMA, "irrf_ferias": IncidenciaEnum.SOMA},
        {"codigo_evento": 8, "descricao": "Hora Noturna", "tipo": TipoEventoEnum.PROVENTO,
         "inss_mensal": IncidenciaEnum.SOMA, "fgts_mensal": IncidenciaEnum.SOMA, "irrf_mensal": IncidenciaEnum.SOMA,
         "inss_13": IncidenciaEnum.SOMA, "fgts_13": IncidenciaEnum.SOMA, "irrf_13": IncidenciaEnum.SOMA,
         "inss_ferias": IncidenciaEnum.SOMA, "fgts_ferias": IncidenciaEnum.SOMA, "irrf_ferias": IncidenciaEnum.SOMA},
        {"codigo_evento": 9, "descricao": "Faltas", "tipo": TipoEventoEnum.DESCONTO,
         "inss_mensal": IncidenciaEnum.DIMINUI, "fgts_mensal": IncidenciaEnum.DIMINUI, "irrf_mensal": IncidenciaEnum.DIMINUI,
         "inss_13": IncidenciaEnum.DIMINUI, "fgts_13": IncidenciaEnum.DIMINUI, "irrf_13": IncidenciaEnum.DIMINUI,
         "inss_ferias": IncidenciaEnum.DIMINUI, "fgts_ferias": IncidenciaEnum.DIMINUI, "irrf_ferias": IncidenciaEnum.DIMINUI},
    ]
    for e in eventos:
        registro = Tabela_Eventos(**e)
        db.add(registro)
    db.commit()
    print(f"  Eventos: {len(eventos)} eventos inseridos.")


def main():
    print("Repopulando tabelas INSS, IRRF, Config Simplificada e Eventos...")
    criar_tabelas()
    db = SessionLocal()
    try:
        # Inserir apenas se a tabela estiver vazia
        if db.query(Tabela_INSS).count() == 0:
            seed_inss(db)
        else:
            print("  INSS: tabela já possui dados. Nada inserido.")

        if db.query(Tabela_IRRF).count() == 0:
            seed_irrf(db)
        else:
            print("  IRRF: tabela já possui dados. Nada inserido.")

        if db.query(Tabela_Config_Simplificada).count() == 0:
            seed_config_simplificada(db)
        else:
            print("  Config Simplificada: tabela já possui dados. Nada inserido.")

        if db.query(Tabela_Eventos).count() == 0:
            seed_eventos(db)
        else:
            print("  Eventos: tabela já possui dados. Nada inserido.")

        print("Concluído! Execute novamente apenas se as tabelas estiverem vazias.")
    except Exception as e:
        db.rollback()
        print(f"Erro: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
