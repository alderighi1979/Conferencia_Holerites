"""
Serviço para cálculos de proventos conforme CLT
"""
from typing import Tuple


def calcular_horas_extras(
    salario_base: float,
    jornada_mensal: float,
    quantidade_horas: float,
    adicional: float,
    periculosidade: float = 0.0
) -> Tuple[float, str]:
    """
    Calcula horas extras conforme CLT.
    Fórmula: Valor_HE = (Salário + Periculosidade) / Jornada × (1 + Adicional) × Qtd_Horas
    
    Args:
        salario_base: Salário base do funcionário
        jornada_mensal: Jornada mensal em horas (ex: 220)
        quantidade_horas: Quantidade de horas extras trabalhadas
        adicional: Adicional percentual (0.50 para 50%, 0.80 para 80%, 1.00 para 100%)
        periculosidade: Valor mensal da periculosidade (0 se não houver)
    
    Returns:
        (valor_calculado, detalhes)
    """
    base_hora = (salario_base + periculosidade) / jornada_mensal
    valor_he = base_hora * (1 + adicional) * quantidade_horas
    
    adicional_percent = adicional * 100
    detalhes = (
        f"Base Hora (Sal.+Peric./Jornada): R$ {base_hora:.2f} | "
        f"Adicional: {adicional_percent:.0f}% | "
        f"Horas: {quantidade_horas:.2f}h | "
        f"Total: R$ {valor_he:.2f}"
    )
    
    return round(valor_he, 2), detalhes


def calcular_hora_normal_diurna(
    salario_base: float,
    jornada_mensal: float,
    quantidade_horas: float
) -> Tuple[float, str]:
    """
    Calcula valor de horas normais diurnas.
    Fórmula: (Salário / Jornada) × Quantidade_Horas
    """
    valor_hora = salario_base / jornada_mensal
    valor_total = valor_hora * quantidade_horas
    detalhes = (
        f"Valor da Hora: R$ {valor_hora:.2f} | "
        f"Horas: {quantidade_horas:.2f}h | "
        f"Total: R$ {valor_total:.2f}"
    )
    return round(valor_total, 2), detalhes


def calcular_hora_normal_noturna(
    salario_base: float,
    jornada_mensal: float,
    quantidade_horas_noturnas: float
) -> Tuple[float, str]:
    """
    Calcula valor de horas normais noturnas (mesma fórmula das diurnas).
    Fórmula: (Salário / Jornada) × Quantidade_Horas_Noturnas
    """
    valor_hora = salario_base / jornada_mensal
    valor_total = valor_hora * quantidade_horas_noturnas
    detalhes = (
        f"Valor da Hora: R$ {valor_hora:.2f} | "
        f"Horas Noturnas: {quantidade_horas_noturnas:.2f}h | "
        f"Total: R$ {valor_total:.2f}"
    )
    return round(valor_total, 2), detalhes


def calcular_adicional_noturno(
    salario_base: float,
    jornada_mensal: float,
    quantidade_horas: float
) -> Tuple[float, str]:
    """
    Calcula adicional noturno (20%) conforme CLT — valor separado para conferência.
    Fórmula: (Valor_da_Hora_Normal × 0,20) × Quantidade_Horas_Noturnas_Reduzidas
    Sendo Valor_da_Hora_Normal = Salário / Jornada.
    Quantidade em horas noturnas reduzidas (52,5 min).
    """
    valor_hora_normal = salario_base / jornada_mensal
    valor_adicional = (valor_hora_normal * 0.20) * quantidade_horas
    detalhes = (
        f"Valor da Hora Normal: R$ {valor_hora_normal:.2f} | "
        f"Adicional Noturno: 20% | "
        f"Horas Noturnas (reduzidas): {quantidade_horas:.2f}h | "
        f"Total: R$ {valor_adicional:.2f}"
    )
    return round(valor_adicional, 2), detalhes


def calcular_dsr(
    soma_horas_extras: float,
    dias_uteis: int,
    domingos_e_feriados: int
) -> Tuple[float, str]:
    """
    Calcula DSR (Descanso Semanal Remunerado) sobre horas extras.
    Fórmula: DSR = (Soma_HE / Dias_Uteis) * Domingos_e_Feriados
    
    Args:
        soma_horas_extras: Soma total das horas extras do mês
        dias_uteis: Quantidade de dias úteis no mês
        domingos_e_feriados: Quantidade de domingos e feriados no mês
    
    Returns:
        (valor_calculado, detalhes)
    """
    if dias_uteis == 0:
        return 0.0, "Erro: Dias úteis não pode ser zero"
    
    valor_dsr = (soma_horas_extras / dias_uteis) * domingos_e_feriados
    
    detalhes = (
        f"Soma HE: R$ {soma_horas_extras:.2f} | "
        f"Dias Úteis: {dias_uteis} | "
        f"Domingos/Feriados: {domingos_e_feriados} | "
        f"Total DSR: R$ {valor_dsr:.2f}"
    )
    
    return round(valor_dsr, 2), detalhes


def calcular_periculosidade(
    salario_base: float
) -> Tuple[float, str]:
    """
    Calcula periculosidade (30%) conforme CLT.
    Fórmula: Valor_Periculosidade = Salário_Base * 0.30
    
    Args:
        salario_base: Salário base do funcionário
    
    Returns:
        (valor_calculado, detalhes)
    """
    valor_periculosidade = salario_base * 0.30
    
    detalhes = (
        f"Salário Base: R$ {salario_base:.2f} | "
        f"Adicional: 30% | "
        f"Total: R$ {valor_periculosidade:.2f}"
    )
    
    return round(valor_periculosidade, 2), detalhes


def calcular_interjornada(
    salario_base: float,
    jornada_mensal: float,
    horas_descanso: float,
    adicional: float = 0.50
) -> Tuple[float, str]:
    """
    Calcula interjornada (tempo que faltou para completar 11h de descanso).
    Fórmula: Valor da hora normal + (Adicional * horas que faltaram)
    
    Args:
        salario_base: Salário base do funcionário
        jornada_mensal: Jornada mensal em horas (ex: 220)
        horas_descanso: Horas de descanso que faltaram para completar 11h
        adicional: Adicional percentual (0.50 para 50%, 0.80 para 80%)
    
    Returns:
        (valor_calculado, detalhes)
    """
    if horas_descanso > 11:
        horas_descanso = 11
    
    valor_hora = salario_base / jornada_mensal
    horas_faltantes = 11 - horas_descanso
    
    if horas_faltantes <= 0:
        return 0.0, "Descanso completo (11h ou mais). Sem adicional."
    
    valor_interjornada = valor_hora * (1 + adicional) * horas_faltantes
    
    adicional_percent = adicional * 100
    detalhes = (
        f"Valor da Hora: R$ {valor_hora:.2f} | "
        f"Horas de Descanso: {horas_descanso:.2f}h | "
        f"Horas Faltantes: {horas_faltantes:.2f}h | "
        f"Adicional: {adicional_percent:.0f}% | "
        f"Total: R$ {valor_interjornada:.2f}"
    )
    
    return round(valor_interjornada, 2), detalhes
