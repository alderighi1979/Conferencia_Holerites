from sqlalchemy import Column, Integer, Float, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TipoEventoEnum(str, enum.Enum):
    PROVENTO = "Provento"
    DESCONTO = "Desconto"


class IncidenciaEnum(str, enum.Enum):
    """SOMA: adiciona à base; DIMINUI: subtrai da base (ex.: faltas); ISENTO: não altera a base."""
    SOMA = "SOMA"
    DIMINUI = "DIMINUI"
    ISENTO = "ISENTO"


class Tabela_INSS(Base):
    __tablename__ = "tabela_inss"
    
    id = Column(Integer, primary_key=True, index=True)
    faixa_inicial = Column(Float, nullable=False)
    faixa_final = Column(Float, nullable=False)
    aliquota = Column(Float, nullable=False)
    valor_deduzir = Column(Float, nullable=False, default=0.0)
    
    def __repr__(self):
        return f"<Tabela_INSS(id={self.id}, faixa_inicial={self.faixa_inicial}, faixa_final={self.faixa_final}, aliquota={self.aliquota})>"


class Tabela_IRRF(Base):
    __tablename__ = "tabela_irrf"
    
    id = Column(Integer, primary_key=True, index=True)
    faixa_inicial = Column(Float, nullable=False)
    faixa_final = Column(Float, nullable=False)
    aliquota = Column(Float, nullable=False)
    parcela_deduzir = Column(Float, nullable=False, default=0.0)
    valor_por_dependente = Column(Float, nullable=False, default=0.0)
    
    def __repr__(self):
        return f"<Tabela_IRRF(id={self.id}, faixa_inicial={self.faixa_inicial}, faixa_final={self.faixa_final}, aliquota={self.aliquota})>"


class Tabela_Config_Simplificada(Base):
    __tablename__ = "tabela_config_simplificada"
    
    id = Column(Integer, primary_key=True, index=True)
    valor_desconto_padrao = Column(Float, nullable=False)
    
    def __repr__(self):
        return f"<Tabela_Config_Simplificada(id={self.id}, valor_desconto_padrao={self.valor_desconto_padrao})>"


class Tabela_Eventos(Base):
    __tablename__ = "tabela_eventos"
    
    codigo_evento = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    tipo = Column(SQLEnum(TipoEventoEnum), nullable=False)
    
    # Colunas de incidência
    inss_mensal = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    fgts_mensal = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    irrf_mensal = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    inss_13 = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    fgts_13 = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    irrf_13 = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    inss_ferias = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    fgts_ferias = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    irrf_ferias = Column(SQLEnum(IncidenciaEnum), nullable=False, default=IncidenciaEnum.ISENTO)
    
    def __repr__(self):
        return f"<Tabela_Eventos(codigo_evento={self.codigo_evento}, descricao={self.descricao}, tipo={self.tipo})>"
