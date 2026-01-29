import React, { useState } from 'react';

function parseNumero(str) {
  if (str === '' || str === null || str === undefined) return '';
  const s = String(str).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (s === '' || s === '.') return '';
  const n = parseFloat(s);
  return Number.isNaN(n) ? '' : n;
}

function Cabecalho({ 
  nomeFuncionario, 
  setNomeFuncionario, 
  quantidadeDependentes, 
  setQuantidadeDependentes,
  salarioBase,
  setSalarioBase,
  jornadaMensal,
  setJornadaMensal
}) {
  const [salarioInput, setSalarioInput] = useState('');
  const [jornadaInput, setJornadaInput] = useState('');
  const [focusedSalario, setFocusedSalario] = useState(false);
  const [focusedJornada, setFocusedJornada] = useState(false);

  const formatarNumero = (valor, casas = 2) => {
    if (valor === '' || valor === null || valor === undefined) return '';
    const n = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-redepetro-red">
      <h2 className="text-lg font-semibold text-redepetro-red mb-4">Informações do Funcionário</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Funcionário (Opcional)
          </label>
          <input
            type="text"
            id="nome"
            value={nomeFuncionario}
            onChange={(e) => setNomeFuncionario(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
            placeholder="Digite o nome do funcionário"
          />
        </div>
        <div>
          <label htmlFor="salario" className="block text-sm font-medium text-gray-700 mb-1">
            Salário Base *
          </label>
          <input
            type="text"
            id="salario"
            inputMode="decimal"
            value={focusedSalario ? salarioInput : (salarioBase !== '' && salarioBase != null ? formatarNumero(salarioBase) : salarioBase ?? '')}
            onFocus={() => {
              setFocusedSalario(true);
              setSalarioInput(salarioBase !== '' && salarioBase != null ? formatarNumero(salarioBase) : '');
            }}
            onChange={(e) => setSalarioInput(e.target.value)}
            onBlur={() => {
              const n = parseNumero(salarioInput);
              setSalarioBase(n === '' ? '' : n);
              setFocusedSalario(false);
              setSalarioInput('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
            placeholder="0,00"
          />
        </div>
        <div>
          <label htmlFor="jornada" className="block text-sm font-medium text-gray-700 mb-1">
            Jornada Mensal (horas) *
          </label>
          <input
            type="text"
            id="jornada"
            inputMode="decimal"
            value={focusedJornada ? jornadaInput : (jornadaMensal !== '' && jornadaMensal != null ? formatarNumero(jornadaMensal, 0) : String(jornadaMensal ?? '220'))}
            onFocus={() => {
              setFocusedJornada(true);
              setJornadaInput(jornadaMensal !== '' && jornadaMensal != null ? formatarNumero(jornadaMensal, 0) : String(jornadaMensal ?? '220'));
            }}
            onChange={(e) => setJornadaInput(e.target.value)}
            onBlur={() => {
              const n = parseNumero(jornadaInput);
              setJornadaMensal(n === '' ? 220 : (typeof n === 'number' ? n : 220));
              setFocusedJornada(false);
              setJornadaInput('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
            placeholder="220"
          />
        </div>
        <div>
          <label htmlFor="dependentes" className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade de Dependentes
          </label>
          <input
            type="number"
            id="dependentes"
            min="0"
            value={quantidadeDependentes}
            onChange={(e) => setQuantidadeDependentes(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
            placeholder="0"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">* Campos obrigatórios para cálculos de proventos</p>
    </div>
  );
}

export default Cabecalho;
