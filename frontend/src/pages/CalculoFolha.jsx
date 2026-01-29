import React, { useState } from 'react';
import Cabecalho from '../components/Cabecalho';
import GradeLancamentos from '../components/GradeLancamentos';
import PainelResultados from '../components/PainelResultados';
import { calculoAPI } from '../services/api';

function CalculoFolha() {
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [quantidadeDependentes, setQuantidadeDependentes] = useState(0);
  const [salarioBase, setSalarioBase] = useState('');
  const [jornadaMensal, setJornadaMensal] = useState(220);
  const [eventos, setEventos] = useState([{ codigo_evento: '', valor: '', descricao: '', quantidade_horas: '' }]);
  const [tipoCalculo, setTipoCalculo] = useState('mensal');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcular = async () => {
    // Validar eventos
    const eventosValidos = eventos.filter(
      e => e.codigo_evento && e.valor && e.valor > 0
    );

    if (eventosValidos.length === 0) {
      setErro('Adicione pelo menos um evento com código e valor válidos.');
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const payload = {
        eventos: eventosValidos.map(e => ({
          codigo_evento: parseInt(e.codigo_evento),
          valor: parseFloat(e.valor)
        })),
        quantidade_dependentes: Number(quantidadeDependentes) || 0,
        tipo_calculo: tipoCalculo
      };

      const response = await calculoAPI.calcular(payload);
      setResultado(response.data);
    } catch (error) {
      console.error('Erro ao calcular:', error);
      setErro(
        error.response?.data?.detail || 
        'Erro ao calcular folha. Verifique os dados e tente novamente.'
      );
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setNomeFuncionario('');
    setQuantidadeDependentes(0);
    setSalarioBase('');
    setJornadaMensal(220);
    setEventos([{ codigo_evento: '', valor: '', descricao: '', quantidade_horas: '' }]);
    setTipoCalculo('mensal');
    setResultado(null);
    setErro(null);
  };

  const imprimirCalculo = () => {
    if (!resultado) {
      setErro('Calcule a folha antes de imprimir.');
      return;
    }
    setErro(null);

    const logHtml = resultado.log_calculo && resultado.log_calculo.length > 0
      ? `
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
          <h3 style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">Detalhe do Cálculo</h3>
          <div style="background: #f9fafb; padding: 1rem; border-left: 4px solid #c41e3a; font-size: 0.8125rem; line-height: 1.6; color: #374151;">
            ${resultado.log_calculo.map(linha => `<div style="margin: 0.15rem 0;">${linha.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`).join('')}
          </div>
        </div>
      `
      : '';

    const tipoLabel = { mensal: 'Mensal', 13: '13º Salário', ferias: 'Férias' }[tipoCalculo] || tipoCalculo;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cálculo de Folha - ${nomeFuncionario || 'Funcionário'}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 14px; color: #1f2937; padding: 24px; max-width: 700px; margin: 0 auto; }
            h1 { color: #c41e3a; font-size: 1.25rem; margin-bottom: 0.25rem; }
            .meta { color: #6b7280; font-size: 0.8125rem; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
            th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid #e5e7eb; }
            th { font-weight: 600; color: #374151; }
            .total { font-weight: 700; font-size: 1.125rem; color: #c41e3a; }
          </style>
        </head>
        <body>
          <h1>Cálculo de Folha de Pagamento</h1>
          <div class="meta">
            ${nomeFuncionario ? `<strong>Funcionário:</strong> ${nomeFuncionario} &nbsp;|&nbsp; ` : ''}
            <strong>Tipo:</strong> ${tipoLabel} &nbsp;|&nbsp;
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <table>
            <tr><th>Total Proventos</th><td style="color: #059669;">${formatarMoeda(resultado.total_proventos)}</td></tr>
            <tr><th>Total Descontos</th><td style="color: #dc2626;">${formatarMoeda(resultado.total_descontos)}</td></tr>
            <tr><th>Base INSS</th><td>${formatarMoeda(resultado.base_inss)}</td></tr>
            <tr><th>Base IRRF</th><td>${formatarMoeda(resultado.base_irrf)}</td></tr>
            <tr><th>Base FGTS</th><td>${formatarMoeda(resultado.base_fgts)}</td></tr>
            <tr><th>INSS</th><td>${formatarMoeda(resultado.valor_inss)}</td></tr>
            <tr><th>IRRF</th><td>${formatarMoeda(resultado.valor_irrf)} <span style="font-size: 0.75rem; color: #6b7280;">(${resultado.metodo_irrf_utilizado})</span></td></tr>
            <tr><th>FGTS</th><td>${formatarMoeda(resultado.valor_fgts)}</td></tr>
            <tr><th class="total">Valor Líquido</th><td class="total">${formatarMoeda(resultado.valor_liquido)}</td></tr>
          </table>
          ${logHtml}
        </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.onafterprint = () => janela.close();
    setTimeout(() => janela.print(), 300);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-redepetro-red">Cálculo de Folha de Pagamento</h1>
        <p className="mt-2 text-sm text-gray-600">
          Preencha os dados abaixo para calcular a folha de pagamento
        </p>
      </div>

      <Cabecalho
        nomeFuncionario={nomeFuncionario}
        setNomeFuncionario={setNomeFuncionario}
        quantidadeDependentes={quantidadeDependentes}
        setQuantidadeDependentes={setQuantidadeDependentes}
        salarioBase={salarioBase}
        setSalarioBase={setSalarioBase}
        jornadaMensal={jornadaMensal}
        setJornadaMensal={setJornadaMensal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradeLancamentos
            eventos={eventos}
            setEventos={setEventos}
            tipoCalculo={tipoCalculo}
            setTipoCalculo={setTipoCalculo}
            salarioBase={salarioBase}
            jornadaMensal={jornadaMensal}
          />

          {erro && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{erro}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-redepetro-red">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={calcular}
                disabled={loading}
                className="flex-1 min-w-[140px] px-4 py-3 bg-redepetro-red text-white rounded-md hover:bg-redepetro-dark focus:outline-none focus:ring-2 focus:ring-redepetro-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-lg"
              >
                {loading ? 'Calculando...' : 'Calcular Folha'}
              </button>
              <button
                type="button"
                onClick={imprimirCalculo}
                disabled={!resultado || loading}
                className="flex-1 min-w-[120px] px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="flex-1 min-w-[140px] px-4 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 font-medium transition-colors"
              >
                Limpar formulário
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <PainelResultados resultado={resultado} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default CalculoFolha;
