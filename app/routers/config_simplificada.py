from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.database import get_db
from app.models import Tabela_Config_Simplificada

router = APIRouter(prefix="/api/config-simplificada", tags=["Config Simplificada"])


@router.post("/", response_model=schemas.Tabela_Config_SimplificadaResponse, status_code=status.HTTP_201_CREATED)
def criar_config_simplificada(config: schemas.Tabela_Config_SimplificadaCreate, db: Session = Depends(get_db)):
    """Criar uma nova configuração simplificada"""
    db_config = Tabela_Config_Simplificada(**config.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


@router.get("/", response_model=List[schemas.Tabela_Config_SimplificadaResponse])
def listar_configs_simplificada(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todas as configurações simplificadas"""
    configs = db.query(Tabela_Config_Simplificada).offset(skip).limit(limit).all()
    return configs


@router.get("/{config_id}", response_model=schemas.Tabela_Config_SimplificadaResponse)
def obter_config_simplificada(config_id: int, db: Session = Depends(get_db)):
    """Obter uma configuração simplificada específica"""
    config = db.query(Tabela_Config_Simplificada).filter(Tabela_Config_Simplificada.id == config_id).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuração simplificada com ID {config_id} não encontrada"
        )
    return config


@router.put("/{config_id}", response_model=schemas.Tabela_Config_SimplificadaResponse)
def atualizar_config_simplificada(
    config_id: int,
    config_update: schemas.Tabela_Config_SimplificadaUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar uma configuração simplificada"""
    config = db.query(Tabela_Config_Simplificada).filter(Tabela_Config_Simplificada.id == config_id).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuração simplificada com ID {config_id} não encontrada"
        )
    
    update_data = config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_config_simplificada(config_id: int, db: Session = Depends(get_db)):
    """Deletar uma configuração simplificada"""
    config = db.query(Tabela_Config_Simplificada).filter(Tabela_Config_Simplificada.id == config_id).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuração simplificada com ID {config_id} não encontrada"
        )
    
    db.delete(config)
    db.commit()
    return None
