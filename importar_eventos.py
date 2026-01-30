"""
Script de importação de eventos a partir do arquivo de relatório cadastral.
Leitura por posição; converte S/I para SOMA/ISENTO/DIMINUI conforme regras de negócio.
Uso: python importar_eventos.py [caminho_do_arquivo]
"""
import os
import re
import sys

# Garantir que o projeto está no path (execução na raiz do projeto)
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from app.database import SessionLocal
from app.models import Tabela_Eventos, IncidenciaEnum, TipoEventoEnum


# --- Configuração de posições (ajuste conforme o layout real do arquivo) ---
# Cada bloco (Mensal, 13º, Férias) tem 5 colunas S/I; usamos 1ª=INSS, 3ª=FGTS, 4ª=IRRF (ignoramos 2ª=IEM, 5ª=PIS e Lco no final)
BLOCK_LENGTH = 5
INCIDENCE_INDEX_INSS = 0   # 1ª coluna do bloco
INCIDENCE_INDEX_FGTS = 2   # 3ª coluna do bloco
INCIDENCE_INDEX_IRRF = 3   # 4ª coluna do bloco
NUM_BLOCKS = 3             # Mensal, 13º, Férias
TOTAL_INCIDENCE_CHARS = NUM_BLOCKS * BLOCK_LENGTH  # 15 caracteres (últimos da linha, antes de Lco se houver)

# Nome do arquivo padrão (na mesma pasta do script ou cwd)
DEFAULT_FILENAME = "Eventos_Incidencias_Eventos.txt"

# Palavras na descrição que indicam evento de desconto (S -> DIMINUI)
PALAVRAS_DIMINUI = ("falta", "atraso", "desconto", "contribuição")


def _normalizar_incidencia(caracter: str, codigo_evento: int, descricao: str) -> IncidenciaEnum:
    """
    Converte 'I' -> ISENTO, 'S' -> SOMA, 'D' -> DIMINUI.
    Se código entre 500-900 ou descrição contiver Falta/Atraso/Desconto/Contribuição
    e o caracter for 'S', converte para DIMINUI.
    """
    c = (caracter or " ").strip().upper()
    if c == "D":
        return IncidenciaEnum.DIMINUI
    if c == "I":
        return IncidenciaEnum.ISENTO
    if c != "S":
        return IncidenciaEnum.ISENTO

    # c == "S"
    codigo_entre_500_900 = 500 <= codigo_evento <= 900
    desc_lower = (descricao or "").lower()
    descricao_indica_diminui = any(palavra in desc_lower for palavra in PALAVRAS_DIMINUI)

    if codigo_entre_500_900 or descricao_indica_diminui:
        return IncidenciaEnum.DIMINUI
    return IncidenciaEnum.SOMA


def _parsear_linha_com_pipe(linha: str) -> dict | None:
    """
    Parseia linha no formato: código descrição|bloco_mensal|bloco_13|bloco_ferias|Lco
    Cada bloco tem 5 colunas S/I/D (INS, IEM, FGTS, IRRF, PIS); usamos 1ª, 3ª, 4ª (INSS, FGTS, IRRF).
    Retorna dict com codigo_evento, descricao, tipo e campos de incidência, ou None.
    """
    linha = linha.rstrip("\r\n")
    if "|" not in linha:
        return None

    partes = linha.split("|")
    if len(partes) < 4:
        return None

    # Parte 0: " 1 Horas Normais Diu" -> código e descrição
    parte0 = partes[0].strip()
    match = re.match(r"^\s*(\d+)\s+(.*)$", parte0)
    if not match:
        return None
    codigo = int(match.group(1))
    descricao = match.group(2).strip()
    if not descricao:
        return None

    # Partes 1, 2, 3: blocos Mensal, 13º, Férias. Cada um: "S   S  S  S   S   " -> tokens [S, S, S, S, S]
    # Índices 0, 2, 3 = INSS, FGTS, IRRF (ignoramos 1=IEM, 4=PIS)
    campos = [
        "inss_mensal", "fgts_mensal", "irrf_mensal",
        "inss_13", "fgts_13", "irrf_13",
        "inss_ferias", "fgts_ferias", "irrf_ferias",
    ]
    result = {"codigo_evento": codigo, "descricao": descricao[:255]}

    for iblock, nome_inss, nome_fgts, nome_irrf in [
        (1, "inss_mensal", "fgts_mensal", "irrf_mensal"),
        (2, "inss_13", "fgts_13", "irrf_13"),
        (3, "inss_ferias", "fgts_ferias", "irrf_ferias"),
    ]:
        if iblock >= len(partes):
            result[nome_inss] = result[nome_fgts] = result[nome_irrf] = IncidenciaEnum.ISENTO
            continue
        tokens = partes[iblock].split()
        # 5 colunas: 0=INSS, 1=IEM, 2=FGTS, 3=IRRF, 4=PIS
        c_inss = tokens[0] if len(tokens) > 0 else "I"
        c_fgts = tokens[2] if len(tokens) > 2 else "I"
        c_irrf = tokens[3] if len(tokens) > 3 else "I"
        result[nome_inss] = _normalizar_incidencia(c_inss, codigo, descricao)
        result[nome_fgts] = _normalizar_incidencia(c_fgts, codigo, descricao)
        result[nome_irrf] = _normalizar_incidencia(c_irrf, codigo, descricao)

    result["tipo"] = _inferir_tipo(descricao, codigo)
    return result


def _inferir_tipo(descricao: str, codigo: int) -> TipoEventoEnum:
    """Infere Provento ou Desconto pela descrição ou faixa de código."""
    desc_lower = (descricao or "").lower()
    if any(p in desc_lower for p in PALAVRAS_DIMINUI):
        return TipoEventoEnum.DESCONTO
    if 500 <= codigo <= 900:
        return TipoEventoEnum.DESCONTO
    return TipoEventoEnum.PROVENTO


def _linha_eh_cabecalho_ou_rodape(linha: str) -> bool:
    """Retorna True se a linha for cabeçalho/rodapé (sem dados de evento)."""
    linha_strip = linha.strip()
    if not linha_strip:
        return True
    # Títulos do relatório (com ou sem |)
    if re.search(r"Folha de Pagamento|Incidências Eventos|Evento\s+Mensal|Mensal\s+13|Férias\s*$|Pág:\s*\d+|^---|INSIEMFGTS|IRR\s*PI", linha_strip, re.IGNORECASE):
        return True
    if re.match(r"^\s*\+?-+\|", linha_strip) or re.match(r"^\s*\|\s*INS", linha_strip, re.IGNORECASE):
        return True
    return False


def parsear_arquivo(caminho: str) -> list[dict]:
    """
    Lê o arquivo e retorna lista de dicts prontos para inserção (codigo_evento, descricao, tipo, inss_*, fgts_*, irrf_*).
    Formato esperado: linhas com | separando código+descrição e 3 blocos de incidência (S/I/D).
    """
    eventos = []
    with open(caminho, "r", encoding="utf-8", errors="replace") as f:
        for num_linha, linha in enumerate(f, start=1):
            try:
                if _linha_eh_cabecalho_ou_rodape(linha):
                    continue
                # Formato com pipe: código descrição|bloco_mensal|bloco_13|bloco_ferias|Lco
                ev = _parsear_linha_com_pipe(linha)
                if ev is None:
                    continue
                if ev.get("codigo_evento", 0) <= 0:
                    continue
                eventos.append(ev)
            except Exception:
                continue

    return eventos


def inserir_eventos(eventos: list[dict], sessao, substituir_existentes: bool = False) -> tuple[int, int]:
    """
    Insere eventos no banco. Retorna (inseridos, atualizados).
    Se substituir_existentes=True, faz update nos que já existem.
    """
    inseridos = 0
    atualizados = 0

    for ev in eventos:
        codigo = ev["codigo_evento"]
        existente = sessao.query(Tabela_Eventos).filter(Tabela_Eventos.codigo_evento == codigo).first()

        if existente:
            if substituir_existentes:
                for k, v in ev.items():
                    setattr(existente, k, v)
                atualizados += 1
            continue

        sessao.add(Tabela_Eventos(**ev))
        inseridos += 1

    return inseridos, atualizados


def limpar_eventos() -> int:
    """Remove todos os eventos da tabela tabela_eventos. Retorna a quantidade removida."""
    sessao = SessionLocal()
    try:
        qtd = sessao.query(Tabela_Eventos).count()
        sessao.query(Tabela_Eventos).delete()
        sessao.commit()
        return qtd
    except Exception as e:
        sessao.rollback()
        raise
    finally:
        sessao.close()


def main():
    if len(sys.argv) >= 2 and sys.argv[1].strip().lower() in ("--limpar", "-l", "/limpar"):
        try:
            n = limpar_eventos()
            print(f"Eventos removidos: {n}")
        except Exception as e:
            print(f"Erro ao remover eventos: {e}")
            sys.exit(1)
        return

    if len(sys.argv) >= 2:
        caminho = sys.argv[1]
    else:
        # Procurar arquivo na pasta do script e no cwd
        for base in (_SCRIPT_DIR, os.getcwd()):
            candidato = os.path.join(base, DEFAULT_FILENAME)
            if os.path.isfile(candidato):
                caminho = candidato
                break
        else:
            print(f"Uso: python importar_eventos.py <caminho_do_arquivo>")
            print(f"Arquivo padrão esperado: {DEFAULT_FILENAME}")
            sys.exit(1)

    if not os.path.isfile(caminho):
        print(f"Arquivo não encontrado: {caminho}")
        sys.exit(1)

    print(f"Lendo: {caminho}")
    eventos = parsear_arquivo(caminho)
    print(f"Eventos parseados: {len(eventos)}")

    if not eventos:
        print("Nenhum evento válido para importar.")
        sys.exit(0)

    sessao = SessionLocal()
    try:
        inseridos, atualizados = inserir_eventos(eventos, sessao, substituir_existentes=True)
        sessao.commit()
        print(f"Inseridos: {inseridos} | Atualizados: {atualizados}")
    except Exception as e:
        sessao.rollback()
        print(f"Erro ao gravar no banco: {e}")
        raise
    finally:
        sessao.close()

    print("Importação concluída.")


if __name__ == "__main__":
    main()
