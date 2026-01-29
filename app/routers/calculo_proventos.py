from fastapi import APIRouter, HTTPException, status
from app import schemas
from app.services.calculo_proventos_service import (
    calcular_horas_extras,
    calcular_hora_normal_diurna,
    calcular_hora_normal_noturna,
    calcular_adicional_noturno,
    calcular_dsr,
    calcular_periculosidade,
    calcular_interjornada
)

router = APIRouter(prefix="/api/calculo-proventos", tags=["Cálculo de Proventos CLT"])


@router.post("/horas-extras", response_model=schemas.CalculoProventoResponse)
def calcular_he(request: schemas.CalculoHorasExtrasRequest):
    """
    Calcula horas extras conforme CLT.
    Fórmula: Valor_HE = (Salário + Periculosidade) / Jornada × (1 + Adicional) × Qtd_Horas
    """
    try:
        valor, detalhes = calcular_horas_extras(
            salario_base=request.salario_base,
            jornada_mensal=request.jornada_mensal,
            quantidade_horas=request.quantidade_horas,
            adicional=request.adicional,
            periculosidade=request.periculosidade
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular horas extras: {str(e)}"
        )


@router.post("/hora-normal-diurna", response_model=schemas.CalculoProventoResponse)
def calcular_hora_diurna(request: schemas.CalculoHoraNormalDiurnaRequest):
    """
    Calcula valor de horas normais diurnas.
    Fórmula: (Salário / Jornada) × Quantidade_Horas
    """
    try:
        valor, detalhes = calcular_hora_normal_diurna(
            salario_base=request.salario_base,
            jornada_mensal=request.jornada_mensal,
            quantidade_horas=request.quantidade_horas
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular hora normal diurna: {str(e)}"
        )


@router.post("/hora-normal-noturna", response_model=schemas.CalculoProventoResponse)
def calcular_hora_noturna(request: schemas.CalculoHoraNormalNoturnaRequest):
    """
    Calcula valor de horas normais noturnas (mesma fórmula das diurnas).
    Fórmula: (Salário / Jornada) × Quantidade_Horas_Noturnas
    """
    try:
        valor, detalhes = calcular_hora_normal_noturna(
            salario_base=request.salario_base,
            jornada_mensal=request.jornada_mensal,
            quantidade_horas_noturnas=request.quantidade_horas
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular hora normal noturna: {str(e)}"
        )


@router.post("/adicional-noturno", response_model=schemas.CalculoProventoResponse)
def calcular_ad_noturno(request: schemas.CalculoAdicionalNoturnoRequest):
    """
    Calcula adicional noturno (20%) — valor separado para conferência.
    Fórmula: (Valor_da_Hora_Normal × 0,20) × Quantidade_Horas_Noturnas_Reduzidas
    """
    try:
        valor, detalhes = calcular_adicional_noturno(
            salario_base=request.salario_base,
            jornada_mensal=request.jornada_mensal,
            quantidade_horas=request.quantidade_horas
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular adicional noturno: {str(e)}"
        )


@router.post("/dsr", response_model=schemas.CalculoProventoResponse)
def calcular_dsr_he(request: schemas.CalculoDSRRequest):
    """
    Calcula DSR sobre horas extras conforme CLT.
    Fórmula: DSR = (Soma_HE / Dias_Uteis) * Domingos_e_Feriados
    """
    try:
        valor, detalhes = calcular_dsr(
            soma_horas_extras=request.soma_horas_extras,
            dias_uteis=request.dias_uteis,
            domingos_e_feriados=request.domingos_e_feriados
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular DSR: {str(e)}"
        )


@router.post("/periculosidade", response_model=schemas.CalculoProventoResponse)
def calcular_peric(request: schemas.CalculoPericulosidadeRequest):
    """
    Calcula periculosidade (30%) conforme CLT.
    Fórmula: Valor_Periculosidade = Salário_Base * 0.30
    """
    try:
        valor, detalhes = calcular_periculosidade(
            salario_base=request.salario_base
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular periculosidade: {str(e)}"
        )


@router.post("/interjornada", response_model=schemas.CalculoProventoResponse)
def calcular_interj(request: schemas.CalculoInterjornadaRequest):
    """
    Calcula interjornada (tempo que faltou para completar 11h de descanso).
    Fórmula: Valor da hora normal + (Adicional * horas que faltaram)
    """
    try:
        valor, detalhes = calcular_interjornada(
            salario_base=request.salario_base,
            jornada_mensal=request.jornada_mensal,
            horas_descanso=request.horas_descanso,
            adicional=request.adicional
        )
        return schemas.CalculoProventoResponse(
            valor_calculado=valor,
            detalhes=detalhes
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao calcular interjornada: {str(e)}"
        )
