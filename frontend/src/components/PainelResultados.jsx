import React from 'react';
import LogCalculo from './LogCalculo';

function PainelResultados({ resultado, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-redepetro-red min-w-0 w-full">
        <h2 className="text-base font-semibold text-redepetro-red mb-3">Resultados</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-redepetro-red"></div>
          <p className="mt-2 text-gray-600">Calculando...</p>
        </div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-redepetro-red min-w-0 w-full">
        <h2 className="text-base font-semibold text-redepetro-red mb-3">Resultados</h2>
        <p className="text-gray-500 text-center py-6 text-sm">Clique em "Calcular" para ver os resultados</p>
      </div>
    );
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-redepetro-red min-w-0 w-full">
      <h2 className="text-base font-semibold text-redepetro-red mb-3">Resumo da Conferência</h2>
      
      <div className="space-y-3">
        {/* Totais */}
        <div className="border-b pb-3">
          <h3 className="text-xs font-medium text-gray-700 mb-1.5">Totais</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Total Proventos</p>
              <p className="text-base font-semibold text-green-600 truncate" title={formatarMoeda(resultado.total_proventos)}>
                {formatarMoeda(resultado.total_proventos)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Total Descontos</p>
              <p className="text-base font-semibold text-red-600 truncate" title={formatarMoeda(resultado.total_descontos)}>
                {formatarMoeda(resultado.total_descontos)}
              </p>
            </div>
          </div>
        </div>

        {/* Bases de Cálculo */}
        <div className="border-b pb-3">
          <h3 className="text-xs font-medium text-gray-700 mb-1.5">Bases de Cálculo</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">Base INSS</span>
              <span className="font-medium truncate">{formatarMoeda(resultado.base_inss)}</span>
            </div>
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">Base IRRF</span>
              <span className="font-medium truncate">{formatarMoeda(resultado.base_irrf)}</span>
            </div>
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">Base FGTS</span>
              <span className="font-medium truncate">{formatarMoeda(resultado.base_fgts)}</span>
            </div>
          </div>
        </div>

        {/* Impostos */}
        <div className="border-b pb-3">
          <h3 className="text-xs font-medium text-gray-700 mb-1.5">Impostos e Contribuições</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">INSS</span>
              <span className="font-medium text-red-600 truncate">{formatarMoeda(resultado.valor_inss)}</span>
            </div>
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">IRRF</span>
              <span className="font-medium text-red-600 truncate">{formatarMoeda(resultado.valor_irrf)}</span>
            </div>
            <div className="text-xs text-gray-500 truncate" title={resultado.metodo_irrf_utilizado}>Método: {resultado.metodo_irrf_utilizado}</div>
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-gray-600 shrink-0">FGTS</span>
              <span className="font-medium text-blue-600 truncate">{formatarMoeda(resultado.valor_fgts)}</span>
            </div>
          </div>
        </div>

        {/* Valor Líquido */}
        <div className="pt-3">
          <div className="bg-red-50 rounded-lg p-3 border-l-4 border-redepetro-red">
            <p className="text-xs font-medium text-gray-700 mb-0.5">Valor Líquido</p>
            <p className="text-xl font-bold text-redepetro-red truncate" title={formatarMoeda(resultado.valor_liquido)}>
              {formatarMoeda(resultado.valor_liquido)}
            </p>
          </div>
        </div>

        {/* Log de Cálculo */}
        {resultado.log_calculo && (
          <LogCalculo log={resultado.log_calculo} />
        )}
      </div>
    </div>
  );
}

export default PainelResultados;
