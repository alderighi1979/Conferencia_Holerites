from pydantic import BaseModel, Field
from typing import Optional
from app.models import TipoEventoEnum, IncidenciaEnum


# Schemas para Tabela_INSS
class Tabela_INSSBase(BaseModel):
    faixa_inicial: float = Field(..., description="Faixa inicial de salário")
    faixa_final: float = Field(..., description="Faixa final de salário")
    aliquota: float = Field(..., ge=0, le=100, description="Alíquota percentual")
    valor_deduzir: float = Field(default=0.0, description="Valor a deduzir")


class Tabela_INSSCreate(Tabela_INSSBase):
    pass


class Tabela_INSSUpdate(BaseModel):
    faixa_inicial: Optional[float] = None
    faixa_final: Optional[float] = None
    aliquota: Optional[float] = Field(None, ge=0, le=100)
    valor_deduzir: Optional[float] = None


class Tabela_INSSResponse(Tabela_INSSBase):
    id: int
    
    class Config:
        from_attributes = True


# Schemas para Tabela_IRRF
class Tabela_IRRFBase(BaseModel):
    faixa_inicial: float = Field(..., description="Faixa inicial de salário")
    faixa_final: float = Field(..., description="Faixa final de salário")
    aliquota: float = Field(..., ge=0, le=100, description="Alíquota percentual")
    parcela_deduzir: float = Field(default=0.0, description="Parcela a deduzir")
    valor_por_dependente: float = Field(default=0.0, description="Valor por dependente")


class Tabela_IRRFCreate(Tabela_IRRFBase):
    pass


class Tabela_IRRFUpdate(BaseModel):
    faixa_inicial: Optional[float] = None
    faixa_final: Optional[float] = None
    aliquota: Optional[float] = Field(None, ge=0, le=100)
    parcela_deduzir: Optional[float] = None
    valor_por_dependente: Optional[float] = None


class Tabela_IRRFResponse(Tabela_IRRFBase):
    id: int
    
    class Config:
        from_attributes = True


# Schemas para Tabela_Config_Simplificada
class Tabela_Config_SimplificadaBase(BaseModel):
    valor_desconto_padrao: float = Field(..., description="Valor do desconto padrão do novo cálculo de IRRF")


class Tabela_Config_SimplificadaCreate(Tabela_Config_SimplificadaBase):
    pass


class Tabela_Config_SimplificadaUpdate(BaseModel):
    valor_desconto_padrao: Optional[float] = None


class Tabela_Config_SimplificadaResponse(Tabela_Config_SimplificadaBase):
    id: int
    
    class Config:
        from_attributes = True


# Schemas para Tabela_Eventos
class Tabela_EventosBase(BaseModel):
    codigo_evento: int = Field(..., description="Código do evento (ID)")
    descricao: str = Field(..., max_length=255, description="Descrição do evento")
    tipo: TipoEventoEnum = Field(..., description="Tipo: Provento ou Desconto")
    inss_mensal: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência INSS Mensal (S/I)")
    fgts_mensal: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência FGTS Mensal (S/I)")
    irrf_mensal: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência IRRF Mensal (S/I)")
    inss_13: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência INSS 13º (S/I)")
    fgts_13: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência FGTS 13º (S/I)")
    irrf_13: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência IRRF 13º (S/I)")
    inss_ferias: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência INSS Férias (S/I)")
    fgts_ferias: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência FGTS Férias (S/I)")
    irrf_ferias: IncidenciaEnum = Field(default=IncidenciaEnum.ISENTO, description="Incidência IRRF Férias (S/I)")


class Tabela_EventosCreate(Tabela_EventosBase):
    pass


class Tabela_EventosUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=255)
    tipo: Optional[TipoEventoEnum] = None
    inss_mensal: Optional[IncidenciaEnum] = None
    fgts_mensal: Optional[IncidenciaEnum] = None
    irrf_mensal: Optional[IncidenciaEnum] = None
    inss_13: Optional[IncidenciaEnum] = None
    fgts_13: Optional[IncidenciaEnum] = None
    irrf_13: Optional[IncidenciaEnum] = None
    inss_ferias: Optional[IncidenciaEnum] = None
    fgts_ferias: Optional[IncidenciaEnum] = None
    irrf_ferias: Optional[IncidenciaEnum] = None


class Tabela_EventosResponse(Tabela_EventosBase):
    class Config:
        from_attributes = True


# Schemas para Cálculo de Folha
class EventoCalculo(BaseModel):
    codigo_evento: int = Field(..., description="Código do evento")
    valor: float = Field(..., ge=0, description="Valor do evento")


class CalculoFolhaRequest(BaseModel):
    eventos: list[EventoCalculo] = Field(..., description="Lista de eventos com código e valor")
    quantidade_dependentes: int = Field(default=0, ge=0, description="Quantidade de dependentes")
    tipo_calculo: str = Field(default="mensal", description="Tipo de cálculo: mensal, 13 ou ferias")


class CalculoFolhaResponse(BaseModel):
    total_proventos: float = Field(..., description="Total de proventos")
    total_descontos: float = Field(..., description="Total de descontos")
    base_inss: float = Field(..., description="Base de cálculo do INSS")
    valor_inss: float = Field(..., description="Valor do INSS calculado")
    base_irrf: float = Field(..., description="Base de cálculo do IRRF")
    valor_irrf: float = Field(..., description="Valor do IRRF calculado")
    metodo_irrf_utilizado: str = Field(..., description="Método utilizado: tradicional ou simplificado")
    base_fgts: float = Field(..., description="Base de cálculo do FGTS")
    valor_fgts: float = Field(..., description="Valor do FGTS calculado")
    valor_liquido: float = Field(..., description="Valor líquido a receber")
    log_calculo: list[str] = Field(..., description="Log detalhado do cálculo passo a passo")


# Schemas para Cálculos de Proventos CLT
class CalculoHorasExtrasRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")
    jornada_mensal: float = Field(..., gt=0, description="Jornada mensal em horas (ex: 220)")
    quantidade_horas: float = Field(..., gt=0, description="Quantidade de horas extras")
    adicional: float = Field(..., ge=0, description="Adicional percentual (0.50 para 50%, 0.80 para 80%, 1.00 para 100%)")
    periculosidade: float = Field(default=0.0, ge=0, description="Valor mensal da periculosidade (incluído na base da hora)")


class CalculoHoraNormalDiurnaRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")
    jornada_mensal: float = Field(..., gt=0, description="Jornada mensal em horas (ex: 220)")
    quantidade_horas: float = Field(..., gt=0, description="Quantidade de horas trabalhadas")


class CalculoHoraNormalNoturnaRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")
    jornada_mensal: float = Field(..., gt=0, description="Jornada mensal em horas (ex: 220)")
    quantidade_horas: float = Field(..., gt=0, description="Quantidade de horas noturnas (com redução 52,5 min)")


class CalculoAdicionalNoturnoRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")
    jornada_mensal: float = Field(..., gt=0, description="Jornada mensal em horas (ex: 220)")
    quantidade_horas: float = Field(..., gt=0, description="Quantidade de horas noturnas reduzidas (52,5 min)")


class CalculoDSRRequest(BaseModel):
    soma_horas_extras: float = Field(..., ge=0, description="Soma total das horas extras do mês")
    dias_uteis: int = Field(..., gt=0, description="Quantidade de dias úteis no mês")
    domingos_e_feriados: int = Field(..., ge=0, description="Quantidade de domingos e feriados no mês")


class CalculoPericulosidadeRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")


class CalculoInterjornadaRequest(BaseModel):
    salario_base: float = Field(..., gt=0, description="Salário base do funcionário")
    jornada_mensal: float = Field(..., gt=0, description="Jornada mensal em horas (ex: 220)")
    horas_descanso: float = Field(..., ge=0, le=11, description="Horas de descanso que faltaram para completar 11h")
    adicional: float = Field(default=0.50, ge=0, description="Adicional percentual (0.50 para 50%, 0.80 para 80%)")


class CalculoProventoResponse(BaseModel):
    valor_calculado: float = Field(..., description="Valor calculado do provento")
    detalhes: str = Field(..., description="Detalhes do cálculo")
