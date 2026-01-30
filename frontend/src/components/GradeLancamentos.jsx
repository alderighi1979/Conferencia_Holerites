import React, { useState, useEffect, useRef } from 'react';
import { eventosAPI } from '../services/api';
import CalculadoraProvento from './CalculadoraProvento';

function GradeLancamentos({ eventos, setEventos, tipoCalculo, setTipoCalculo, salarioBase, jornadaMensal }) {
  const [eventosCache, setEventosCache] = useState({});
  const [loadingEventos, setLoadingEventos] = useState({});
  const timeoutRefs = useRef({});
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);
  const [indexCalculadora, setIndexCalculadora] = useState(null);
  const refCodigoInputs = useRef({});
  const [focusedValorIndex, setFocusedValorIndex] = useState(null);
  const [editValorValue, setEditValorValue] = useState('');

  const buscarEvento = async (codigo, index) => {
    if (!codigo || codigo <= 0 || isNaN(codigo)) {
      return;
    }

    const codigoNum = parseInt(codigo);

    if (eventosCache[codigoNum]) {
      atualizarEvento(index, 'descricao', eventosCache[codigoNum].descricao);
      return;
    }

    setLoadingEventos(prev => ({ ...prev, [index]: true }));
    try {
      const response = await eventosAPI.getByCodigo(codigoNum);
      const evento = response.data;
      setEventosCache(prev => ({ ...prev, [codigoNum]: evento }));
      atualizarEvento(index, 'descricao', evento.descricao);
    } catch (error) {
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      if (isTimeout) {
        console.warn('Busca do evento excedeu o tempo. Verifique se o servidor está ativo.');
      } else {
        console.error('Erro ao buscar evento:', error);
      }
      atualizarEvento(index, 'descricao', isTimeout ? 'Erro ao buscar (tempo esgotado)' : 'Evento não encontrado');
    } finally {
      setLoadingEventos(prev => ({ ...prev, [index]: false }));
    }
  };

  const limparLoadingDoIndice = (index) => {
    setLoadingEventos(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const atualizarEvento = (index, campo, valor) => {
    setEventos(prevEventos => {
      const novosEventos = [...prevEventos];
      novosEventos[index] = {
        codigo_evento: novosEventos[index]?.codigo_evento || '',
        valor: novosEventos[index]?.valor || '',
        descricao: novosEventos[index]?.descricao || '',
        quantidade_horas: novosEventos[index]?.quantidade_horas || '',
        ...novosEventos[index],
        [campo]: valor
      };
      return novosEventos;
    });
  };

  const formatarValor = (valor) => {
    if (valor === '' || valor === null || valor === undefined) return '';
    const n = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseValor = (str) => {
    if (str === '' || str === null || str === undefined) return '';
    const s = String(str).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    if (s === '' || s === '.') return '';
    const n = parseFloat(s);
    if (Number.isNaN(n)) return '';
    return n;
  };

  const camposIncidenciaPorTipo = {
    mensal: ['inss_mensal', 'fgts_mensal', 'irrf_mensal'],
    '13': ['inss_13', 'fgts_13', 'irrf_13'],
    ferias: ['inss_ferias', 'fgts_ferias', 'irrf_ferias'],
  };
  const labelsIncidencia = ['INSS', 'FGTS', 'IRRF'];

  const IconeIncidencia = ({ valor }) => {
    const v = valor === 'S' ? 'SOMA' : valor === 'I' ? 'ISENTO' : valor;
    if (v === 'SOMA') return <span className="text-green-600 font-bold" title="Soma à base">+</span>;
    if (v === 'DIMINUI') return <span className="text-red-600 font-bold" title="Diminui da base">−</span>;
    return <span className="text-gray-400 font-medium" title="Isento">0</span>;
  };

  const adicionarEvento = () => {
    const novoIndex = eventos.length;
    setEventos(prev => [...prev, { codigo_evento: '', valor: '', descricao: '', quantidade_horas: '' }]);
    setTimeout(() => refCodigoInputs.current[novoIndex]?.focus(), 0);
  };

  const removerEvento = (index) => {
    setEventos(prev => prev.filter((_, i) => i !== index));
    limparLoadingDoIndice(index);
    if (timeoutRefs.current[index]) {
      clearTimeout(timeoutRefs.current[index]);
      delete timeoutRefs.current[index];
    }
  };

  useEffect(() => {
    if (eventos.length === 0) {
      setEventos([{ codigo_evento: '', valor: '', descricao: '', quantidade_horas: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-redepetro-red">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-redepetro-red">Lançamentos</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Tipo de Cálculo:</label>
          <select
            value={tipoCalculo}
            onChange={(e) => setTipoCalculo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
          >
            <option value="mensal">Mensal</option>
            <option value="13">13º Salário</option>
            <option value="ferias">Férias</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full table-fixed divide-y divide-gray-200 border-collapse">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '38%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Efeito nas bases: + Soma, − Diminui, 0 Isento">
                Efeito
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.map((evento, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-2 py-2 align-top min-w-0">
                  <input
                    ref={el => { refCodigoInputs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={evento.codigo_evento || ''}
                    onChange={(e) => {
                      const codigo = e.target.value;
                      const codigoLimpo = codigo.replace(/[^0-9]/g, '');
                      atualizarEvento(index, 'codigo_evento', codigoLimpo);
                      if (timeoutRefs.current[index]) clearTimeout(timeoutRefs.current[index]);
                      if (!codigoLimpo) {
                        atualizarEvento(index, 'descricao', '');
                        limparLoadingDoIndice(index);
                        return;
                      }
                      if (codigoLimpo.length >= 3) {
                        buscarEvento(parseInt(codigoLimpo), index);
                      } else {
                        timeoutRefs.current[index] = setTimeout(() => {
                          if (codigoLimpo.length > 0) buscarEvento(parseInt(codigoLimpo), index);
                        }, 500);
                      }
                    }}
                    onBlur={(e) => {
                      if (timeoutRefs.current[index]) {
                        clearTimeout(timeoutRefs.current[index]);
                        delete timeoutRefs.current[index];
                      }
                      const codigo = e.target.value.trim();
                      if (codigo && codigo.length > 0) {
                        buscarEvento(parseInt(codigo), index);
                      } else {
                        atualizarEvento(index, 'descricao', '');
                      }
                    }}
                    className="w-full min-w-0 box-border px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                    placeholder="Código"
                  />
                  {loadingEventos[index] && (
                    <span className="block mt-1 text-xs text-gray-500">Carregando...</span>
                  )}
                </td>
                <td className="px-2 py-2 align-top min-w-0 overflow-hidden">
                  <div
                    className="w-full min-w-0 px-2 py-1.5 border border-gray-200 rounded-md bg-gray-50 text-gray-600 text-sm break-words"
                    title={evento.descricao || 'Descrição aparecerá aqui'}
                  >
                    {evento.descricao || <span className="text-gray-400">Descrição aparecerá aqui</span>}
                  </div>
                </td>
                <td className="px-2 py-2 align-middle min-w-0 text-center">
                  {eventosCache[evento.codigo_evento] ? (
                    <div className="flex items-center justify-center gap-1 sm:gap-2" title="INSS | FGTS | IRRF">
                      {(camposIncidenciaPorTipo[tipoCalculo] || camposIncidenciaPorTipo.mensal).map((campo, i) => (
                        <span key={campo} className="flex flex-col items-center shrink-0" title={`${labelsIncidencia[i]}: ${eventosCache[evento.codigo_evento][campo] || 'ISENTO'}`}>
                          <span className="text-[10px] text-gray-400 leading-tight">{labelsIncidencia[i]}</span>
                          <IconeIncidencia valor={eventosCache[evento.codigo_evento][campo]} />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-2 py-2 align-top min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={focusedValorIndex === index ? editValorValue : formatarValor(evento.valor)}
                      onFocus={() => {
                        setFocusedValorIndex(index);
                        setEditValorValue(evento.valor !== '' && evento.valor !== null && evento.valor !== undefined ? formatarValor(evento.valor) : '');
                      }}
                      onChange={(e) => setEditValorValue(e.target.value)}
                      onBlur={() => {
                        const num = parseValor(editValorValue);
                        atualizarEvento(index, 'valor', num === '' ? '' : num);
                        setFocusedValorIndex(null);
                        setEditValorValue('');
                      }}
                      className="flex-1 min-w-0 box-border px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red text-right tabular-nums"
                      placeholder="0,00"
                    />
                    <button
                      type="button"
                      onClick={() => { setIndexCalculadora(index); setCalculadoraAberta(true); }}
                      className="p-1.5 shrink-0 text-redepetro-red hover:bg-red-50 rounded-md transition-colors"
                      title="Calcular provento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-2 py-2 align-top min-w-0">
                  {eventos.length > 1 && (
                    <button
                      onClick={() => removerEvento(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button
          onClick={adicionarEvento}
          className="px-4 py-2 bg-redepetro-red text-white rounded-md hover:bg-redepetro-dark focus:outline-none focus:ring-2 focus:ring-redepetro-red focus:ring-offset-2 font-medium transition-colors"
        >
          + Adicionar Evento
        </button>
      </div>

      {/* Calculadora de Proventos */}
      <CalculadoraProvento
        isOpen={calculadoraAberta}
        onClose={() => {
          setCalculadoraAberta(false);
          setIndexCalculadora(null);
        }}
        onCalcular={(valor) => {
          if (indexCalculadora !== null) {
            atualizarEvento(indexCalculadora, 'valor', valor);
          }
        }}
        tipoCalculo={tipoCalculo}
        salarioBase={salarioBase}
        jornadaMensal={jornadaMensal}
        codigoEvento={indexCalculadora !== null ? (eventos[indexCalculadora]?.codigo_evento ?? '') : ''}
      />
    </div>
  );
}

export default GradeLancamentos;
