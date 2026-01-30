import React, { useState, useEffect } from 'react';
import { calculoProventosAPI } from '../services/api';

function CalculadoraProvento({ isOpen, onClose, onCalcular, tipoCalculo, salarioBase, jornadaMensal, codigoEvento }) {
  const [tipo, setTipo] = useState('horas-extras');
  const [quantidadeHoras, setQuantidadeHoras] = useState('');
  const [adicional, setAdicional] = useState('0.50');
  const [periculosidade, setPericulosidade] = useState('');
  const [adicionalNoturnoPericulosidade, setAdicionalNoturnoPericulosidade] = useState(false);
  const [tipoCargo, setTipoCargo] = useState('OPERACAO');
  const [diasUteis, setDiasUteis] = useState('');
  const [domingosFeriados, setDomingosFeriados] = useState('');
  const [somaHE, setSomaHE] = useState('');
  const [horasFaltantes, setHorasFaltantes] = useState('');
  const [horasADisposicao, setHorasADisposicao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const cod = codigoEvento !== undefined && codigoEvento !== null && codigoEvento !== '' ? Number(codigoEvento) : null;
      const tipoPorEvento = {
        1: 'hora-normal-diurna',
        2: 'hora-normal-noturna',
        35: 'horas-extras',
        49: 'horas-extras',
        59: 'dsr',
        302: 'dsr',
        64: 'periculosidade',
        96: 'adicional-noturno',
        1032: 'interjornada',
        1033: 'tempo-a-disposicao',
      };
      setTipo(tipoPorEvento[cod] || 'horas-extras');
      setLoading(false);
      setQuantidadeHoras('');
      setAdicional('0.50');
      setPericulosidade('');
      setAdicionalNoturnoPericulosidade(false);
      setTipoCargo('OPERACAO');
      setDiasUteis('');
      setDomingosFeriados('');
      setSomaHE('');
      setHorasFaltantes('');
      setHorasADisposicao('');
      setResultado(null);
      setErro(null);
    }
  }, [isOpen, codigoEvento]);

  const calcular = async () => {
    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      let response;
      const salario = parseFloat(salarioBase) || 0;
      const jornada = parseFloat(jornadaMensal) || 220;

      switch (tipo) {
        case 'horas-extras':
          if (!quantidadeHoras || parseFloat(quantidadeHoras) <= 0) {
            throw new Error('Informe a quantidade de horas');
          }
          response = await calculoProventosAPI.horasExtras({
            salario_base: salario,
            jornada_mensal: jornada,
            quantidade_horas: parseFloat(quantidadeHoras),
            adicional: parseFloat(adicional),
            periculosidade: parseFloat(periculosidade) || 0
          });
          break;

        case 'hora-normal-diurna':
          if (!quantidadeHoras || parseFloat(quantidadeHoras) <= 0) {
            throw new Error('Informe a quantidade de horas');
          }
          response = await calculoProventosAPI.horaNormalDiurna({
            salario_base: salario,
            jornada_mensal: jornada,
            quantidade_horas: parseFloat(quantidadeHoras)
          });
          break;

        case 'hora-normal-noturna':
          if (!quantidadeHoras || parseFloat(quantidadeHoras) <= 0) {
            throw new Error('Informe a quantidade de horas noturnas');
          }
          response = await calculoProventosAPI.horaNormalNoturna({
            salario_base: salario,
            jornada_mensal: jornada,
            quantidade_horas: parseFloat(quantidadeHoras)
          });
          break;

        case 'adicional-noturno':
          if (!quantidadeHoras || parseFloat(quantidadeHoras) <= 0) {
            throw new Error('Informe a quantidade de horas noturnas');
          }
          response = await calculoProventosAPI.adicionalNoturno({
            salario_base: salario,
            jornada_mensal: jornada,
            quantidade_horas: parseFloat(quantidadeHoras),
            periculosidade: adicionalNoturnoPericulosidade,
            tipo_cargo: tipoCargo
          });
          break;

        case 'dsr':
          if (!somaHE || parseFloat(somaHE) <= 0) {
            throw new Error('Informe a soma das horas extras (valor em R$)');
          }
          const diasUteisNum = parseInt(diasUteis, 10);
          if (!diasUteis || isNaN(diasUteisNum) || diasUteisNum <= 0) {
            throw new Error('Informe os dias úteis do mês (número inteiro)');
          }
          const domingosFeriadosNum = parseInt(domingosFeriados, 10);
          if (domingosFeriados === '' || domingosFeriados === undefined || isNaN(domingosFeriadosNum) || domingosFeriadosNum < 0) {
            throw new Error('Informe a quantidade de domingos e feriados');
          }
          response = await calculoProventosAPI.dsr({
            soma_horas_extras: parseFloat(somaHE),
            dias_uteis: diasUteisNum,
            domingos_e_feriados: domingosFeriadosNum
          });
          break;

        case 'periculosidade':
          response = await calculoProventosAPI.periculosidade({
            salario_base: salario
          });
          break;

        case 'interjornada':
          if (!horasFaltantes || parseFloat(horasFaltantes) <= 0) {
            throw new Error('Informe as horas não descansadas (ex.: 26,25).');
          }
          response = await calculoProventosAPI.interjornada({
            salario_base: salario,
            jornada_mensal: jornada,
            horas_faltantes: parseFloat(horasFaltantes),
            adicional: parseFloat(adicional)
          });
          break;

        case 'tempo-a-disposicao':
          if (!horasADisposicao || parseFloat(horasADisposicao) <= 0) {
            throw new Error('Informe as horas a disposição.');
          }
          response = await calculoProventosAPI.tempoADisposicao({
            salario_base: salario,
            jornada_mensal: jornada,
            horas_a_disposicao: parseFloat(horasADisposicao)
          });
          break;

        default:
          throw new Error('Tipo de cálculo inválido');
      }

      const data = response?.data;
      if (data && typeof data.valor_calculado === 'number') {
        setResultado(data);
      } else {
        setErro('Resposta inválida do servidor. Tente novamente.');
      }
    } catch (error) {
      setResultado(null);
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const detail = error.response?.data?.detail;
      const msg = isTimeout
        ? 'Tempo esgotado. Verifique se o servidor está ativo e tente novamente.'
        : (Array.isArray(detail) ? detail.map(d => (typeof d === 'object' && d?.msg) || d).join(', ') : (detail || error.message || 'Erro ao calcular'));
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const aplicarValor = () => {
    if (resultado) {
      onCalcular(resultado.valor_calculado);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-redepetro-red">Calculadora de Proventos</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tipo de Cálculo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cálculo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
          >
            <option value="horas-extras">Horas Extras</option>
            <option value="hora-normal-diurna">Hora Normal Diurna</option>
            <option value="hora-normal-noturna">Hora Normal Noturna</option>
            <option value="adicional-noturno">Adicional Noturno (20% / 35%)</option>
            <option value="dsr">DSR Sobre Horas Extras (Diurno / Noturno)</option>
            <option value="periculosidade">Periculosidade</option>
            <option value="interjornada">Interjornada</option>
            <option value="tempo-a-disposicao">Tempo a disposição</option>
          </select>
        </div>

        {/* Campos comuns */}
        {(tipo === 'horas-extras' || tipo === 'hora-normal-diurna' || tipo === 'hora-normal-noturna' || tipo === 'adicional-noturno' || tipo === 'interjornada' || tipo === 'tempo-a-disposicao') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário Base
              </label>
              <input
                type="number"
                step="0.01"
                value={salarioBase || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jornada Mensal (horas)
              </label>
              <input
                type="number"
                step="0.01"
                value={jornadaMensal || '220'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </>
        )}

        {/* Horas Extras */}
        {tipo === 'horas-extras' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periculosidade (R$/mês)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={periculosidade}
                onChange={(e) => setPericulosidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="0,00 (incluído na base)"
              />
              <p className="mt-1 text-xs text-gray-500">Base da hora = (Salário + Periculosidade) / Jornada</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Horas
              </label>
              <input
                type="number"
                step="0.01"
                value={quantidadeHoras}
                onChange={(e) => setQuantidadeHoras(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="0.00"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adicional (%)
              </label>
              <select
                value={adicional}
                onChange={(e) => setAdicional(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              >
                <option value="0.50">50%</option>
                <option value="0.80">80%</option>
                <option value="1.00">100%</option>
              </select>
            </div>
          </>
        )}

        {/* Hora Normal Diurna */}
        {tipo === 'hora-normal-diurna' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Horas
            </label>
            <input
              type="number"
              step="0.01"
              value={quantidadeHoras}
              onChange={(e) => setQuantidadeHoras(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">Fórmula: (Salário / Jornada) × Qtd Horas</p>
          </div>
        )}

        {/* Hora Normal Noturna */}
        {tipo === 'hora-normal-noturna' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Horas Noturnas
            </label>
            <input
              type="number"
              step="0.01"
              value={quantidadeHoras}
              onChange={(e) => setQuantidadeHoras(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">Mesma fórmula das diurnas: (Salário / Jornada) × Qtd Horas</p>
          </div>
        )}

        {/* Adicional Noturno */}
        {tipo === 'adicional-noturno' && (
          <>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adicionalNoturnoPericulosidade}
                  onChange={(e) => setAdicionalNoturnoPericulosidade(e.target.checked)}
                  className="rounded border-gray-300 text-redepetro-red focus:ring-redepetro-red"
                />
                <span className="text-sm font-medium text-gray-700">Possui Periculosidade (30% na base)</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cargo
              </label>
              <select
                value={tipoCargo}
                onChange={(e) => setTipoCargo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              >
                <option value="OPERACAO">Operação (20%)</option>
                <option value="ADMINISTRATIVO">Administrativo (35%)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Horas Noturnas (60 min)
              </label>
              <input
                type="number"
                step="0.01"
                value={quantidadeHoras}
                onChange={(e) => setQuantidadeHoras(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-gray-500">Base: Salário/Jornada; com periculosidade: +30%. Total = Valor/h × Qtd horas.</p>
            </div>
          </>
        )}

        {/* DSR */}
        {tipo === 'dsr' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soma das Horas Extras / Adicional Noturno (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={somaHE}
                onChange={(e) => setSomaHE(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-gray-500">Informe a soma em reais das horas extras (eventos 35, 43 e 59) da grade.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dias Úteis
              </label>
              <input
                type="number"
                value={diasUteis}
                onChange={(e) => setDiasUteis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="Ex: 25"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domingos e Feriados
              </label>
              <input
                type="number"
                value={domingosFeriados}
                onChange={(e) => setDomingosFeriados(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="Ex: 5"
              />
            </div>
          </>
        )}

        {/* Periculosidade */}
        {tipo === 'periculosidade' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salário Base
            </label>
            <input
              type="number"
              step="0.01"
              value={salarioBase || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">Cálculo: Salário Base × 30%</p>
          </div>
        )}

        {/* Interjornada */}
        {tipo === 'interjornada' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas não descansadas
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={horasFaltantes}
                onChange={(e) => setHorasFaltantes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
                placeholder="Ex: 26,25"
              />
              <p className="mt-1 text-xs text-gray-500">Informe o total de horas que não foram descansadas (ex.: 26,25).</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adicional (%)
              </label>
              <select
                value={adicional}
                onChange={(e) => setAdicional(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              >
                <option value="0.50">50%</option>
                <option value="0.80">80%</option>
              </select>
            </div>
          </>
        )}

        {/* Tempo a disposição */}
        {tipo === 'tempo-a-disposicao' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas a disposição
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={horasADisposicao}
              onChange={(e) => setHorasADisposicao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-redepetro-red focus:border-redepetro-red"
              placeholder="Ex: 10"
            />
            <p className="mt-1 text-xs text-gray-500">Fórmula: (Salário base / Jornada) × Horas a disposição</p>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{erro}</p>
          </div>
        )}

        {/* Resultado */}
        {resultado && typeof resultado.valor_calculado === 'number' && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-green-800 mb-1">
              Valor Calculado: R$ {Number(resultado.valor_calculado).toFixed(2)}
            </p>
            {resultado.memoria_calculo ? (
              <div className="text-xs text-green-700 space-y-0.5 mt-2 font-mono">
                <p>Valor Hora: R$ {Number(resultado.memoria_calculo.valor_hora).toFixed(2)}</p>
                <p>(+) 30% Periculosidade: R$ {Number(resultado.memoria_calculo.periculosidade_30).toFixed(2)}</p>
                <p>(=) Base Adicional Noturno: R$ {Number(resultado.memoria_calculo.base_adicional).toFixed(2)}</p>
                <p>(×) Alíquota ({resultado.memoria_calculo.aliquota_pct}%): R$ {Number(resultado.memoria_calculo.valor_adicional_hora).toFixed(2)} por hora.</p>
                <p className="pt-1 border-t border-green-300 mt-1">Total: R$ {Number(resultado.valor_calculado).toFixed(2)} ({resultado.memoria_calculo.quantidade_horas} h)</p>
              </div>
            ) : (
              <p className="text-xs text-green-700">{resultado.detalhes ?? ''}</p>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={calcular}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-redepetro-red text-white rounded-md hover:bg-redepetro-dark focus:outline-none focus:ring-2 focus:ring-redepetro-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
          {resultado && (
            <button
              onClick={aplicarValor}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
            >
              Aplicar
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalculadoraProvento;
