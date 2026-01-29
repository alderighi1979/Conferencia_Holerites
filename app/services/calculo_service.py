from sqlalchemy.orm import Session
from typing import List, Tuple
from app.models import (
    Tabela_INSS, Tabela_IRRF, Tabela_Config_Simplificada, 
    Tabela_Eventos, IncidenciaEnum, TipoEventoEnum
)


def formatar_moeda(valor: float) -> str:
    """Formata valor como moeda brasileira"""
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')


def calcular_reducao_transicao_irrf(base_irrf: float) -> float:
    """
    Calcula a redução de transição do IRRF para 2026.
    
    Regras:
    - Se Base IRRF <= R$ 5.000,00: Redução = R$ 312,89
    - Se Base IRRF entre R$ 5.000,01 e R$ 7.350,00: Redução = 978,62 - (0,133145 * Base IRRF)
    - Se Base IRRF > R$ 7.350,00: Redução = 0
    
    Retorna o valor da redução a ser aplicada.
    """
    if base_irrf <= 0:
        return 0.0
    
    if base_irrf <= 5000.00:
        return 312.89
    elif base_irrf <= 7350.00:
        reducao = 978.62 - (0.133145 * base_irrf)
        return round(max(0.0, reducao), 2)
    else:
        return 0.0


def gerar_log_calculo(
    eventos_inss: List[int],
    eventos_fgts: List[int],
    eventos_irrf: List[int],
    base_inss: float,
    base_fgts: float,
    base_irrf: float,
    detalhes_inss: List[dict],
    valor_inss: float,
    valor_irrf_tradicional: float,
    valor_irrf_simplificado: float,
    metodo_utilizado: str,
    detalhes_tradicional: dict,
    detalhes_simplificado: dict,
    valor_fgts: float,
    total_proventos: float,
    total_descontos: float,
    valor_irrf: float,
    valor_liquido: float,
    tipo_calculo: str,
    reducao_transicao: float,
    valor_irrf_antes_reducao: float
) -> List[str]:
    """
    Gera o log textual detalhado do cálculo
    """
    log = []
    
    # Base INSS
    if eventos_inss:
        eventos_str = ', '.join(map(str, eventos_inss))
        log.append(f"Base INSS: Somatório dos eventos [{eventos_str}] = {formatar_moeda(base_inss)}.")
    else:
        log.append(f"Base INSS: Nenhum evento com incidência de INSS. Base = {formatar_moeda(base_inss)}.")
    
    # Cálculo INSS
    if detalhes_inss:
        partes_calculo = []
        for detalhe in detalhes_inss:
            partes_calculo.append(
                f"Faixa {detalhe['numero']} ({detalhe['aliquota']}%): {formatar_moeda(detalhe['imposto_faixa'])}"
            )
        log.append(f"Cálculo INSS: {' + '.join(partes_calculo)}. Total = {formatar_moeda(valor_inss)}.")
    else:
        log.append(f"Cálculo INSS: Base zerada. Total = {formatar_moeda(valor_inss)}.")
    
    # Base FGTS
    if eventos_fgts:
        eventos_str = ', '.join(map(str, eventos_fgts))
        log.append(f"Base FGTS: Somatório dos eventos [{eventos_str}] = {formatar_moeda(base_fgts)}.")
    else:
        log.append(f"Base FGTS: Nenhum evento com incidência de FGTS. Base = {formatar_moeda(base_fgts)}.")
    
    log.append(f"Cálculo FGTS: {formatar_moeda(base_fgts)} × 8% = {formatar_moeda(valor_fgts)}.")
    
    # Base IRRF
    if eventos_irrf:
        eventos_str = ', '.join(map(str, eventos_irrf))
        log.append(f"Base IRRF: Somatório dos eventos [{eventos_str}] = {formatar_moeda(base_irrf)}.")
    else:
        log.append(f"Base IRRF: Nenhum evento com incidência de IRRF. Base = {formatar_moeda(base_irrf)}.")
    
    # Comparativo IRRF
    log.append("Comparativo IRRF:")
    
    if detalhes_tradicional:
        log.append(f"  Calculado por Deduções Legais: {formatar_moeda(valor_irrf_tradicional)}.")
        if detalhes_tradicional.get('quantidade_dependentes', 0) > 0:
            log.append(
                f"    (Base: {formatar_moeda(detalhes_tradicional['base_irrf'])} - "
                f"INSS: {formatar_moeda(detalhes_tradicional['inss_retido'])} - "
                f"Dependentes: {detalhes_tradicional['quantidade_dependentes']} × "
                f"{formatar_moeda(detalhes_tradicional['valor_por_dependente'])} = "
                f"{formatar_moeda(detalhes_tradicional['base_calculo'])} × "
                f"{detalhes_tradicional['aliquota']}% - "
                f"{formatar_moeda(detalhes_tradicional['parcela_deduzir'])})"
            )
    else:
        log.append(f"  Calculado por Deduções Legais: {formatar_moeda(valor_irrf_tradicional)} (base zerada).")
    
    if detalhes_simplificado:
        log.append(f"  Calculado por Desconto Simplificado: {formatar_moeda(valor_irrf_simplificado)}.")
        log.append(
            f"    (Base: {formatar_moeda(detalhes_simplificado['base_irrf'])} - "
            f"Desconto Padrão: {formatar_moeda(detalhes_simplificado['desconto_padrao'])} = "
            f"{formatar_moeda(detalhes_simplificado['base_calculo'])} × "
            f"{detalhes_simplificado['aliquota']}% - "
            f"{formatar_moeda(detalhes_simplificado['parcela_deduzir'])})"
        )
    else:
        log.append(f"  Calculado por Desconto Simplificado: {formatar_moeda(valor_irrf_simplificado)} (base zerada).")
    
    metodo_nome = "Deduções Legais" if metodo_utilizado == "tradicional" else "Desconto Simplificado"
    log.append(f"  Resultado: Aplicado {metodo_nome} por ser mais favorável.")
    
    # Redução de Transição 2026 (se aplicável)
    if tipo_calculo in ["mensal", "13"] and reducao_transicao > 0:
        log.append("")
        log.append("Redução de Transição IRRF 2026:")
        if base_irrf <= 5000.00:
            log.append(f"  Base IRRF até R$ 5.000,00: Redução fixa de {formatar_moeda(reducao_transicao)}")
        elif base_irrf <= 7350.00:
            log.append(f"  Base IRRF entre R$ 5.000,01 e R$ 7.350,00: Redução calculada = {formatar_moeda(reducao_transicao)}")
            log.append(f"    (Fórmula: 978,62 - (0,133145 × {formatar_moeda(base_irrf)}) = {formatar_moeda(reducao_transicao)})")
        else:
            log.append(f"  Base IRRF acima de R$ 7.350,00: Sem redução adicional")
        
        log.append(f"  IRRF antes da redução: {formatar_moeda(valor_irrf_antes_reducao)}")
        log.append(f"  Redução aplicada: {formatar_moeda(reducao_transicao)}")
        log.append(f"  IRRF após redução: {formatar_moeda(valor_irrf)}")
    
    # Resumo final
    log.append("")
    log.append("Resumo Final:")
    log.append(f"  Total de Proventos: {formatar_moeda(total_proventos)}")
    log.append(f"  Total de Descontos: {formatar_moeda(total_descontos)}")
    log.append(f"  INSS: {formatar_moeda(valor_inss)}")
    log.append(f"  IRRF: {formatar_moeda(valor_irrf)}")
    log.append(f"  FGTS: {formatar_moeda(valor_fgts)}")
    log.append(f"  Valor Líquido: {formatar_moeda(valor_liquido)}")
    
    return log


def calcular_inss_progressivo(base_inss: float, faixas_inss: List[Tabela_INSS]) -> Tuple[float, List[dict]]:
    """
    Calcula o INSS de forma progressiva conforme as faixas da tabela.
    Retorna (valor_inss, detalhes_faixas)
    """
    if base_inss <= 0:
        return 0.0, []
    
    # Ordenar faixas por faixa_inicial
    faixas_ordenadas = sorted(faixas_inss, key=lambda x: x.faixa_inicial)
    
    valor_inss = 0.0
    salario_restante = base_inss
    detalhes_faixas = []
    numero_faixa = 1
    
    for faixa in faixas_ordenadas:
        # Verificar se o salário entra nesta faixa
        if base_inss < faixa.faixa_inicial:
            # Salário ainda não chegou nesta faixa
            continue
        
        # Calcular o valor que cabe nesta faixa
        if base_inss >= faixa.faixa_final:
            # Todo o intervalo da faixa
            valor_faixa = faixa.faixa_final - faixa.faixa_inicial
        else:
            # Parte do intervalo da faixa (última faixa aplicada)
            valor_faixa = base_inss - faixa.faixa_inicial
        
        # Calcular o imposto sobre esta faixa
        imposto_faixa = valor_faixa * faixa.aliquota / 100
        valor_inss += imposto_faixa
        
        detalhes_faixas.append({
            'numero': numero_faixa,
            'faixa_inicial': faixa.faixa_inicial,
            'faixa_final': faixa.faixa_final,
            'valor_faixa': round(valor_faixa, 2),
            'aliquota': faixa.aliquota,
            'imposto_faixa': round(imposto_faixa, 2),
            'valor_deduzir': faixa.valor_deduzir
        })
        numero_faixa += 1
    
    # No INSS progressivo, o valor_deduzir NÃO é subtraído do total
    # O valor_deduzir é usado apenas para cálculo do teto, não para deduzir imposto
    return round(max(0, valor_inss), 2), detalhes_faixas


def calcular_irrf_tradicional(
    base_irrf: float,
    inss_retido: float,
    quantidade_dependentes: int,
    faixas_irrf: List[Tabela_IRRF]
) -> Tuple[float, float, dict]:
    """
    Calcula IRRF pelo método tradicional.
    Fórmula: (Base IRRF - INSS Retido - (Dependentes * Valor_Dependente)) * Alíquota - Parcela_Deduzir
    Retorna (valor_irrf, base_calculo_usada, detalhes)
    """
    if base_irrf <= 0:
        return 0.0, 0.0, {}
    
    # Obter valor por dependente (usar o primeiro valor não zero das faixas; na tabela oficial é o mesmo em todas)
    valor_por_dependente = 0.0
    for faixa in faixas_irrf:
        if faixa.valor_por_dependente and float(faixa.valor_por_dependente) > 0:
            valor_por_dependente = float(faixa.valor_por_dependente)
            break
    
    # Garantir que quantidade_dependentes é inteiro (pode vir como string do request)
    qtd_dep = int(quantidade_dependentes) if quantidade_dependentes is not None else 0
    valor_dependentes = valor_por_dependente * max(0, qtd_dep)
    
    # Calcular base após descontos (INSS + dedução por dependentes)
    base_calculo = base_irrf - inss_retido - valor_dependentes
    
    if base_calculo <= 0:
        return 0.0, base_calculo, {}
    
    # Encontrar a faixa correspondente
    faixas_ordenadas = sorted(faixas_irrf, key=lambda x: x.faixa_inicial)
    faixa_aplicada = None
    
    for faixa in faixas_ordenadas:
        if faixa.faixa_inicial <= base_calculo <= faixa.faixa_final:
            faixa_aplicada = faixa
            break
    
    # Se não encontrou faixa, usar a última (mais alta)
    if not faixa_aplicada and faixas_ordenadas:
        ultima_faixa = faixas_ordenadas[-1]
        if base_calculo > ultima_faixa.faixa_final:
            faixa_aplicada = ultima_faixa
    
    if faixa_aplicada:
        valor_irrf = (base_calculo * faixa_aplicada.aliquota / 100) - faixa_aplicada.parcela_deduzir
        detalhes = {
            'base_irrf': base_irrf,
            'inss_retido': inss_retido,
            'quantidade_dependentes': qtd_dep,
            'valor_por_dependente': valor_por_dependente,
            'valor_dependentes': valor_dependentes,
            'base_calculo': base_calculo,
            'faixa_inicial': faixa_aplicada.faixa_inicial,
            'faixa_final': faixa_aplicada.faixa_final,
            'aliquota': faixa_aplicada.aliquota,
            'parcela_deduzir': faixa_aplicada.parcela_deduzir,
            'valor_irrf': round(max(0, valor_irrf), 2)
        }
        return round(max(0, valor_irrf), 2), base_calculo, detalhes
    
    return 0.0, base_calculo, {}


def calcular_irrf_simplificado(
    base_irrf: float,
    desconto_padrao: float,
    faixas_irrf: List[Tabela_IRRF]
) -> Tuple[float, float, dict]:
    """
    Calcula IRRF pelo método simplificado.
    Retorna (valor_irrf, base_calculo_usada, detalhes)
    """
    if base_irrf <= 0:
        return 0.0, 0.0, {}
    
    # Calcular base após desconto padrão
    base_calculo = base_irrf - desconto_padrao
    
    if base_calculo <= 0:
        return 0.0, base_calculo, {}
    
    # Encontrar a faixa correspondente
    faixas_ordenadas = sorted(faixas_irrf, key=lambda x: x.faixa_inicial)
    faixa_aplicada = None
    
    for faixa in faixas_ordenadas:
        if faixa.faixa_inicial <= base_calculo <= faixa.faixa_final:
            faixa_aplicada = faixa
            break
    
    # Se não encontrou faixa, usar a última (mais alta)
    if not faixa_aplicada and faixas_ordenadas:
        ultima_faixa = faixas_ordenadas[-1]
        if base_calculo > ultima_faixa.faixa_final:
            faixa_aplicada = ultima_faixa
    
    if faixa_aplicada:
        valor_irrf = (base_calculo * faixa_aplicada.aliquota / 100) - faixa_aplicada.parcela_deduzir
        detalhes = {
            'base_irrf': base_irrf,
            'desconto_padrao': desconto_padrao,
            'base_calculo': base_calculo,
            'faixa_inicial': faixa_aplicada.faixa_inicial,
            'faixa_final': faixa_aplicada.faixa_final,
            'aliquota': faixa_aplicada.aliquota,
            'parcela_deduzir': faixa_aplicada.parcela_deduzir,
            'valor_irrf': round(max(0, valor_irrf), 2)
        }
        return round(max(0, valor_irrf), 2), base_calculo, detalhes
    
    return 0.0, base_calculo, {}


def calcular_folha(
    eventos: List[dict],
    quantidade_dependentes: int,
    tipo_calculo: str,
    db: Session
) -> dict:
    """
    Calcula a folha de pagamento completa.
    """
    # Mapear tipo de cálculo para campos de incidência
    tipo_map = {
        "mensal": {
            "inss": "inss_mensal",
            "fgts": "fgts_mensal",
            "irrf": "irrf_mensal"
        },
        "13": {
            "inss": "inss_13",
            "fgts": "fgts_13",
            "irrf": "irrf_13"
        },
        "ferias": {
            "inss": "inss_ferias",
            "fgts": "fgts_ferias",
            "irrf": "irrf_ferias"
        }
    }
    
    if tipo_calculo not in tipo_map:
        raise ValueError(f"Tipo de cálculo inválido: {tipo_calculo}. Use: mensal, 13 ou ferias")
    
    campos_incidencia = tipo_map[tipo_calculo]
    
    # Inicializar totais
    total_proventos = 0.0
    total_descontos = 0.0
    base_inss = 0.0
    base_fgts = 0.0
    base_irrf = 0.0
    
    # Armazenar eventos para o log
    eventos_inss = []
    eventos_fgts = []
    eventos_irrf = []
    eventos_info = []
    
    # Processar cada evento
    eventos_nao_encontrados = []
    for evento in eventos:
        codigo = evento["codigo_evento"]
        valor = evento["valor"]
        
        # Buscar evento na tabela
        evento_db = db.query(Tabela_Eventos).filter(
            Tabela_Eventos.codigo_evento == codigo
        ).first()
        
        if not evento_db:
            eventos_nao_encontrados.append(codigo)
            continue
        
        eventos_info.append({
            'codigo': codigo,
            'descricao': evento_db.descricao,
            'valor': valor,
            'tipo': evento_db.tipo.value
        })
        
        # Separar proventos e descontos
        if evento_db.tipo == TipoEventoEnum.PROVENTO:
            total_proventos += valor
        else:
            total_descontos += valor
        
        # Calcular bases de incidência
        if getattr(evento_db, campos_incidencia["inss"]) == IncidenciaEnum.SIM:
            base_inss += valor
            eventos_inss.append(codigo)
        
        if getattr(evento_db, campos_incidencia["fgts"]) == IncidenciaEnum.SIM:
            base_fgts += valor
            eventos_fgts.append(codigo)
        
        if getattr(evento_db, campos_incidencia["irrf"]) == IncidenciaEnum.SIM:
            base_irrf += valor
            eventos_irrf.append(codigo)
    
    if eventos_nao_encontrados:
        raise ValueError(f"Eventos não encontrados: {eventos_nao_encontrados}")
    
    # Buscar tabelas do banco
    faixas_inss = db.query(Tabela_INSS).order_by(Tabela_INSS.faixa_inicial).all()
    faixas_irrf = db.query(Tabela_IRRF).order_by(Tabela_IRRF.faixa_inicial).all()
    config_simplificada = db.query(Tabela_Config_Simplificada).first()
    
    if not faixas_inss:
        raise ValueError("Tabela INSS não configurada")
    if not faixas_irrf:
        raise ValueError("Tabela IRRF não configurada")
    
    # Calcular INSS
    valor_inss, detalhes_inss = calcular_inss_progressivo(base_inss, faixas_inss)
    
    # Calcular IRRF - Método Tradicional
    valor_irrf_tradicional, base_tradicional, detalhes_tradicional = calcular_irrf_tradicional(
        base_irrf, valor_inss, quantidade_dependentes, faixas_irrf
    )
    
    # Calcular IRRF - Método Simplificado
    desconto_padrao = config_simplificada.valor_desconto_padrao if config_simplificada else 0.0
    valor_irrf_simplificado, base_simplificado, detalhes_simplificado = calcular_irrf_simplificado(
        base_irrf, desconto_padrao, faixas_irrf
    )
    
    # Escolher o menor valor de IRRF (mais favorável ao contribuinte)
    if valor_irrf_tradicional <= valor_irrf_simplificado:
        valor_irrf = valor_irrf_tradicional
        metodo_utilizado = "tradicional"
        detalhes_irrf_final = detalhes_tradicional
    else:
        valor_irrf = valor_irrf_simplificado
        metodo_utilizado = "simplificado"
        detalhes_irrf_final = detalhes_simplificado
    
    # Aplicar redução de transição 2026 (se aplicável)
    # A redução se aplica a cálculos mensais e 13º salário
    reducao_transicao = 0.0
    if tipo_calculo in ["mensal", "13"]:
        reducao_transicao = calcular_reducao_transicao_irrf(base_irrf)
        valor_irrf_antes_reducao = valor_irrf
        valor_irrf = max(0.0, valor_irrf - reducao_transicao)
    else:
        valor_irrf_antes_reducao = valor_irrf
    
    # Calcular FGTS (8% sobre a base)
    valor_fgts = round(base_fgts * 0.08, 2)
    
    # Calcular valor líquido
    valor_liquido = total_proventos - total_descontos - valor_inss - valor_irrf
    
    # Gerar log de memória de cálculo
    log_calculo = gerar_log_calculo(
        eventos_inss, eventos_fgts, eventos_irrf,
        base_inss, base_fgts, base_irrf,
        detalhes_inss, valor_inss,
        valor_irrf_tradicional, valor_irrf_simplificado,
        metodo_utilizado, detalhes_tradicional, detalhes_simplificado,
        valor_fgts, total_proventos, total_descontos, valor_irrf, valor_liquido,
        tipo_calculo, reducao_transicao, valor_irrf_antes_reducao
    )
    
    return {
        "total_proventos": round(total_proventos, 2),
        "total_descontos": round(total_descontos, 2),
        "base_inss": round(base_inss, 2),
        "valor_inss": valor_inss,
        "base_irrf": round(base_irrf, 2),
        "valor_irrf": valor_irrf,
        "metodo_irrf_utilizado": metodo_utilizado,
        "base_fgts": round(base_fgts, 2),
        "valor_fgts": valor_fgts,
        "valor_liquido": round(valor_liquido, 2),
        "log_calculo": log_calculo
    }
