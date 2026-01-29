import React, { useState } from 'react';
import TabINSS from '../components/admin/TabINSS';
import TabIRRF from '../components/admin/TabIRRF';
import TabEventos from '../components/admin/TabEventos';
import TabConfigSimplificada from '../components/admin/TabConfigSimplificada';

function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState('inss');

  const abas = [
    { id: 'inss', label: 'INSS' },
    { id: 'irrf', label: 'IRRF' },
    { id: 'config', label: 'Config Simplificada' },
    { id: 'eventos', label: 'Eventos' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-redepetro-red">Área Administrativa</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie as tabelas de INSS, IRRF, Configuração Simplificada e Eventos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {abas.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`
                  px-6 py-3 text-sm font-medium border-b-2 transition-colors
                  ${
                    abaAtiva === aba.id
                      ? 'border-redepetro-red text-redepetro-red'
                      : 'border-transparent text-gray-500 hover:text-redepetro-red hover:border-red-300'
                  }
                `}
              >
                {aba.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="p-6">
          {abaAtiva === 'inss' && <TabINSS />}
          {abaAtiva === 'irrf' && <TabIRRF />}
          {abaAtiva === 'config' && <TabConfigSimplificada />}
          {abaAtiva === 'eventos' && <TabEventos />}
        </div>
      </div>
    </div>
  );
}

export default Administracao;
