from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from app.services.calculo_service import calcular_folha

router = APIRouter(prefix="/api/calculo", tags=["Cálculo de Folha"])


@router.post("/", response_model=schemas.CalculoFolhaResponse)
def calcular_folha_pagamento(
    request: schemas.CalculoFolhaRequest,
    db: Session = Depends(get_db)
):
    """
    Calcula a folha de pagamento com base nos eventos informados.
    
    - **eventos**: Lista de objetos contendo código_evento e valor
    - **quantidade_dependentes**: Número de dependentes para cálculo do IRRF
    - **tipo_calculo**: Tipo de cálculo (mensal, 13 ou ferias)
    
    O sistema calcula:
    - INSS de forma progressiva
    - IRRF pelos métodos tradicional e simplificado, retornando o menor valor
    - FGTS sobre a base correspondente
    - Valor líquido final
    """
    try:
        # Converter eventos para formato esperado pelo serviço
        eventos_dict = [
            {"codigo_evento": evento.codigo_evento, "valor": evento.valor}
            for evento in request.eventos
        ]
        
        # Garantir que quantidade_dependentes é inteiro (frontend pode enviar como número ou string)
        qtd_dependentes = int(request.quantidade_dependentes) if request.quantidade_dependentes is not None else 0
        qtd_dependentes = max(0, qtd_dependentes)

        resultado = calcular_folha(
            eventos=eventos_dict,
            quantidade_dependentes=qtd_dependentes,
            tipo_calculo=request.tipo_calculo.lower(),
            db=db
        )
        
        return schemas.CalculoFolhaResponse(**resultado)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular folha: {str(e)}"
        )
