import React from 'react';
import LogCalculo from './LogCalculo';

function PainelResultados({ resultado, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-redepetro-red">
        <h2 className="text-lg font-semibold text-redepetro-red mb-4">Resultados</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-redepetro-red"></div>
          <p className="mt-2 text-gray-600">Calculando...</p>
        </div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-redepetro-red">
        <h2 className="text-lg font-semibold text-redepetro-red mb-4">Resultados</h2>
        <p className="text-gray-500 text-center py-8">Clique em "Calcular" para ver os resultados</p>
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
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-redepetro-red">
      <h2 className="text-lg font-semibold text-redepetro-red mb-4">Resumo da Conferência</h2>
      
      <div className="space-y-4">
        {/* Totais */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Totais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Proventos</p>
              <p className="text-lg font-semibold text-green-600">
                {formatarMoeda(resultado.total_proventos)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Descontos</p>
              <p className="text-lg font-semibold text-red-600">
                {formatarMoeda(resultado.total_descontos)}
              </p>
            </div>
          </div>
        </div>

        {/* Bases de Cálculo */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Bases de Cálculo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Base INSS</span>
              <span className="text-sm font-medium">{formatarMoeda(resultado.base_inss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Base IRRF</span>
              <span className="text-sm font-medium">{formatarMoeda(resultado.base_irrf)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Base FGTS</span>
              <span className="text-sm font-medium">{formatarMoeda(resultado.base_fgts)}</span>
            </div>
          </div>
        </div>

        {/* Impostos */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Impostos e Contribuições</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">INSS</span>
              <span className="text-sm font-medium text-red-600">
                {formatarMoeda(resultado.valor_inss)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">IRRF</span>
              <span className="text-sm font-medium text-red-600">
                {formatarMoeda(resultado.valor_irrf)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Método: {resultado.metodo_irrf_utilizado}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">FGTS</span>
              <span className="text-sm font-medium text-blue-600">
                {formatarMoeda(resultado.valor_fgts)}
              </span>
            </div>
          </div>
        </div>

        {/* Valor Líquido */}
        <div className="pt-4">
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-redepetro-red">
            <p className="text-sm font-medium text-gray-700 mb-1">Valor Líquido</p>
            <p className="text-2xl font-bold text-redepetro-red">
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
