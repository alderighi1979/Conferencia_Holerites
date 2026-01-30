from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.database import get_db
from app.models import Tabela_INSS

router = APIRouter(prefix="/api/inss", tags=["INSS"])


@router.post("/", response_model=schemas.Tabela_INSSResponse, status_code=status.HTTP_201_CREATED)
def criar_faixa_inss(faixa: schemas.Tabela_INSSCreate, db: Session = Depends(get_db)):
    """Criar uma nova faixa de INSS"""
    db_faixa = Tabela_INSS(**faixa.model_dump())
    db.add(db_faixa)
    db.commit()
    db.refresh(db_faixa)
    return db_faixa


@router.get("/", response_model=List[schemas.Tabela_INSSResponse])
def listar_faixas_inss(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todas as faixas de INSS"""
    try:
        faixas = db.query(Tabela_INSS).order_by(Tabela_INSS.faixa_inicial).offset(skip).limit(limit).all()
        return faixas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar faixas de INSS: {str(e)}"
        )


@router.get("/{faixa_id}", response_model=schemas.Tabela_INSSResponse)
def obter_faixa_inss(faixa_id: int, db: Session = Depends(get_db)):
    """Obter uma faixa de INSS específica"""
    faixa = db.query(Tabela_INSS).filter(Tabela_INSS.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de INSS com ID {faixa_id} não encontrada"
        )
    return faixa


@router.put("/{faixa_id}", response_model=schemas.Tabela_INSSResponse)
def atualizar_faixa_inss(
    faixa_id: int,
    faixa_update: schemas.Tabela_INSSUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar uma faixa de INSS"""
    faixa = db.query(Tabela_INSS).filter(Tabela_INSS.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de INSS com ID {faixa_id} não encontrada"
        )
    
    update_data = faixa_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faixa, field, value)
    
    db.commit()
    db.refresh(faixa)
    return faixa


@router.delete("/{faixa_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_faixa_inss(faixa_id: int, db: Session = Depends(get_db)):
    """Deletar uma faixa de INSS"""
    faixa = db.query(Tabela_INSS).filter(Tabela_INSS.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de INSS com ID {faixa_id} não encontrada"
        )
    
    db.delete(faixa)
    db.commit()
    return None
