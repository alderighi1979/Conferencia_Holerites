from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.database import get_db
from app.models import Tabela_Eventos

router = APIRouter(prefix="/api/eventos", tags=["Eventos"])


@router.post("/", response_model=schemas.Tabela_EventosResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(evento: schemas.Tabela_EventosCreate, db: Session = Depends(get_db)):
    """Criar um novo evento"""
    # Verificar se o código do evento já existe
    evento_existente = db.query(Tabela_Eventos).filter(
        Tabela_Eventos.codigo_evento == evento.codigo_evento
    ).first()
    if evento_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evento com código {evento.codigo_evento} já existe"
        )
    
    db_evento = Tabela_Eventos(**evento.model_dump())
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


@router.get("/", response_model=List[schemas.Tabela_EventosResponse])
def listar_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todos os eventos"""
    try:
        eventos = db.query(Tabela_Eventos).order_by(Tabela_Eventos.codigo_evento).offset(skip).limit(limit).all()
        return eventos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar eventos: {str(e)}",
        )


@router.get("/{codigo_evento}", response_model=schemas.Tabela_EventosResponse)
def obter_evento(codigo_evento: int, db: Session = Depends(get_db)):
    """Obter um evento específico"""
    evento = db.query(Tabela_Eventos).filter(Tabela_Eventos.codigo_evento == codigo_evento).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento com código {codigo_evento} não encontrado"
        )
    return evento


@router.put("/{codigo_evento}", response_model=schemas.Tabela_EventosResponse)
def atualizar_evento(
    codigo_evento: int,
    evento_update: schemas.Tabela_EventosUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar um evento"""
    evento = db.query(Tabela_Eventos).filter(Tabela_Eventos.codigo_evento == codigo_evento).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento com código {codigo_evento} não encontrado"
        )
    
    update_data = evento_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evento, field, value)
    
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{codigo_evento}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_evento(codigo_evento: int, db: Session = Depends(get_db)):
    """Deletar um evento"""
    evento = db.query(Tabela_Eventos).filter(Tabela_Eventos.codigo_evento == codigo_evento).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento com código {codigo_evento} não encontrado"
        )
    
    db.delete(evento)
    db.commit()
    return None
