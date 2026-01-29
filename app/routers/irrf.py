from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.database import get_db
from app.models import Tabela_IRRF

router = APIRouter(prefix="/api/irrf", tags=["IRRF"])


@router.post("/", response_model=schemas.Tabela_IRRFResponse, status_code=status.HTTP_201_CREATED)
def criar_faixa_irrf(faixa: schemas.Tabela_IRRFCreate, db: Session = Depends(get_db)):
    """Criar uma nova faixa de IRRF"""
    db_faixa = Tabela_IRRF(**faixa.model_dump())
    db.add(db_faixa)
    db.commit()
    db.refresh(db_faixa)
    return db_faixa


@router.get("/", response_model=List[schemas.Tabela_IRRFResponse])
def listar_faixas_irrf(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todas as faixas de IRRF"""
    faixas = db.query(Tabela_IRRF).offset(skip).limit(limit).all()
    return faixas


@router.get("/{faixa_id}", response_model=schemas.Tabela_IRRFResponse)
def obter_faixa_irrf(faixa_id: int, db: Session = Depends(get_db)):
    """Obter uma faixa de IRRF específica"""
    faixa = db.query(Tabela_IRRF).filter(Tabela_IRRF.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de IRRF com ID {faixa_id} não encontrada"
        )
    return faixa


@router.put("/{faixa_id}", response_model=schemas.Tabela_IRRFResponse)
def atualizar_faixa_irrf(
    faixa_id: int,
    faixa_update: schemas.Tabela_IRRFUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar uma faixa de IRRF"""
    faixa = db.query(Tabela_IRRF).filter(Tabela_IRRF.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de IRRF com ID {faixa_id} não encontrada"
        )
    
    update_data = faixa_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faixa, field, value)
    
    db.commit()
    db.refresh(faixa)
    return faixa


@router.delete("/{faixa_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_faixa_irrf(faixa_id: int, db: Session = Depends(get_db)):
    """Deletar uma faixa de IRRF"""
    faixa = db.query(Tabela_IRRF).filter(Tabela_IRRF.id == faixa_id).first()
    if not faixa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faixa de IRRF com ID {faixa_id} não encontrada"
        )
    
    db.delete(faixa)
    db.commit()
    return None
