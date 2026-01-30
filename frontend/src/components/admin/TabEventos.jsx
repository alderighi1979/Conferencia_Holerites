import React, { useState, useEffect, useMemo, useRef } from 'react';
import { eventosAPI } from '../../services/api';

const PAGE_SIZE_OPTIONS = [20, 50];

function IconeIncidencia({ valor }) {
  const v = valor === 'S' || valor === 'SOMA' ? 'SOMA' : valor === 'D' || valor === 'DIMINUI' ? 'DIMINUI' : 'ISENTO';
  if (v === 'SOMA') return <span className="text-green-600 font-bold" title="Soma">+</span>;
  if (v === 'DIMINUI') return <span className="text-red-600 font-bold" title="Diminui">−</span>;
  return <span className="text-gray-400" title="Isento">0</span>;
}

function TabEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [formData, setFormData] = useState({
    codigo_evento: '',
    descricao: '',
    tipo: 'Provento',
    inss_mensal: 'ISENTO',
    fgts_mensal: 'ISENTO',
    irrf_mensal: 'ISENTO',
    inss_13: 'ISENTO',
    fgts_13: 'ISENTO',
    irrf_13: 'ISENTO',
    inss_ferias: 'ISENTO',
    fgts_ferias: 'ISENTO',
    irrf_ferias: 'ISENTO',
  });
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState(null);
  const primeiroCampoRef = useRef(null);
  const ultimoCampoFormRef = useRef(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const mensagemErro = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((e) => e.msg || JSON.stringify(e)).join('; ');
    if (detail && typeof detail === 'object') return JSON.stringify(detail);
    return null;
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const response = await eventosAPI.getAll();
      setEventos(response.data);
    } catch (error) {
      const msg = mensagemErro(error.response?.data?.detail) || error.message || 'Erro ao carregar eventos';
      console.error('Erro ao carregar eventos:', error, error.response?.data);
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const normalizarIncidencia = (v) => {
    if (v === 'S' || v === 'SOMA') return 'SOMA';
    if (v === 'I' || v === 'ISENTO') return 'ISENTO';
    if (v === 'DIMINUI') return 'DIMINUI';
    return 'ISENTO';
  };

  const eventosFiltrados = useMemo(() => {
    const termo = (busca || '').trim().toLowerCase();
    if (!termo) return eventos;
    return eventos.filter((e) => {
      const codigoMatch = String(e.codigo_evento).includes(termo);
      const descMatch = (e.descricao || '').toLowerCase().includes(termo);
      return codigoMatch || descMatch;
    });
  }, [eventos, busca]);

  const totalPaginas = Math.max(1, Math.ceil(eventosFiltrados.length / porPagina));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
  const eventosPagina = useMemo(() => {
    const start = (paginaAtual - 1) * porPagina;
    return eventosFiltrados.slice(start, start + porPagina);
  }, [eventosFiltrados, paginaAtual, porPagina]);

  useEffect(() => {
    setPagina(1);
  }, [busca, porPagina]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    try {
      const full = {
        codigo_evento: parseInt(formData.codigo_evento, 10),
        descricao: formData.descricao?.trim() ?? '',
        tipo: formData.tipo,
        inss_mensal: formData.inss_mensal ?? 'ISENTO',
        fgts_mensal: formData.fgts_mensal ?? 'ISENTO',
        irrf_mensal: formData.irrf_mensal ?? 'ISENTO',
        inss_13: formData.inss_13 ?? 'ISENTO',
        fgts_13: formData.fgts_13 ?? 'ISENTO',
        irrf_13: formData.irrf_13 ?? 'ISENTO',
        inss_ferias: formData.inss_ferias ?? 'ISENTO',
        fgts_ferias: formData.fgts_ferias ?? 'ISENTO',
        irrf_ferias: formData.irrf_ferias ?? 'ISENTO',
      };
      if (editando) {
        const { codigo_evento: _cod, ...updatePayload } = full;
        await eventosAPI.update(editando.codigo_evento, updatePayload);
        setEditando(null);
      } else {
        await eventosAPI.create(full);
      }
      resetForm();
      carregarEventos();
    } catch (error) {
      const msg = mensagemErro(error.response?.data?.detail) || 'Erro ao salvar evento';
      setErro(msg);
    }
  };

  const handleEdit = (evento) => {
    setEditando(evento);
    setFormData({
      codigo_evento: evento.codigo_evento,
      descricao: evento.descricao,
      tipo: evento.tipo,
      inss_mensal: normalizarIncidencia(evento.inss_mensal),
      fgts_mensal: normalizarIncidencia(evento.fgts_mensal),
      irrf_mensal: normalizarIncidencia(evento.irrf_mensal),
      inss_13: normalizarIncidencia(evento.inss_13),
      fgts_13: normalizarIncidencia(evento.fgts_13),
      irrf_13: normalizarIncidencia(evento.irrf_13),
      inss_ferias: normalizarIncidencia(evento.inss_ferias),
      fgts_ferias: normalizarIncidencia(evento.fgts_ferias),
      irrf_ferias: normalizarIncidencia(evento.irrf_ferias),
    });
  };

  const handleDelete = async (codigo) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await eventosAPI.delete(codigo);
      carregarEventos();
    } catch (error) {
      setErro('Erro ao excluir evento');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo_evento: '',
      descricao: '',
      tipo: 'Provento',
      inss_mensal: 'ISENTO',
      fgts_mensal: 'ISENTO',
      irrf_mensal: 'ISENTO',
      inss_13: 'ISENTO',
      fgts_13: 'ISENTO',
      irrf_13: 'ISENTO',
      inss_ferias: 'ISENTO',
      fgts_ferias: 'ISENTO',
      irrf_ferias: 'ISENTO',
    });
    setEditando(null);
  };

  const opcoesIncidencia = [
    { value: 'SOMA', label: 'Soma (+)' },
    { value: 'DIMINUI', label: 'Diminui (−)' },
    { value: 'ISENTO', label: 'Isento (0)' },
  ];
  const tiposIncidencia = [
    { label: 'Mensal', campos: ['inss_mensal', 'fgts_mensal', 'irrf_mensal'] },
    { label: '13º Salário', campos: ['inss_13', 'fgts_13', 'irrf_13'] },
    { label: 'Férias', campos: ['inss_ferias', 'fgts_ferias', 'irrf_ferias'] },
  ];

  const FormularioIncidencias = ({ formData, setFormData, compact = false, ultimoCampoRef, onUltimoCampoTab }) => {
    const ultimoCampo = 'irrf_ferias'; // último campo na ordem: Mensal -> 13º -> Férias, último é irrf_ferias
    return (
      <div className={compact ? 'flex flex-wrap gap-x-4 gap-y-2 items-end' : 'space-y-2'}>
        {tiposIncidencia.map((tipo) => (
          <div key={tipo.label} className={compact ? 'flex items-center gap-1.5' : 'border border-gray-200 p-2 rounded bg-gray-50/50'}>
            {compact && <span className="text-xs font-medium text-gray-600 w-14 shrink-0">{tipo.label}</span>}
            {!compact && <h4 className="text-xs font-semibold text-gray-700 mb-1.5">{tipo.label}</h4>}
            <div className={compact ? 'flex gap-1 items-end' : 'grid grid-cols-3 gap-2'}>
              {tipo.campos.map((campo) => (
                <div key={campo} className={compact ? 'flex flex-col items-center gap-0.5' : ''}>
                  <label className="block text-[10px] text-gray-500 mb-0.5">{campo.split('_')[0].toUpperCase()}</label>
                  <select
                    ref={campo === ultimoCampo ? ultimoCampoRef : undefined}
                    value={formData[campo] ?? 'ISENTO'}
                    onChange={(e) => setFormData({ ...formData, [campo]: e.target.value })}
                    onKeyDown={campo === ultimoCampo && onUltimoCampoTab ? (e) => {
                      if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        onUltimoCampoTab();
                      }
                    } : undefined}
                    className={`border border-gray-300 rounded text-sm ${compact ? 'w-14 px-1 py-1' : 'w-full px-1.5 py-1'}`}
                    title={compact ? `${campo.split('_')[0]} (${tipo.label})` : undefined}
                  >
                    {opcoesIncidencia.map((op) => (
                      <option key={op.value} value={op.value}>{compact ? (op.value === 'SOMA' ? '+' : op.value === 'DIMINUI' ? '−' : '0') : op.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cadastro de Eventos</h2>

      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      )}

      {/* Formulário compacto para Adicionar */}
      {!editando && (
        <form onSubmit={handleSubmit} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div className="w-20">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Código</label>
              <input
                ref={primeiroCampoRef}
                type="number"
                required
                value={formData.codigo_evento}
                onChange={(e) => setFormData({ ...formData, codigo_evento: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    ultimoCampoFormRef.current?.focus();
                  }
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Descrição</label>
              <input
                type="text"
                required
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              >
                <option value="Provento">Provento</option>
                <option value="Desconto">Desconto</option>
              </select>
            </div>
            <button type="submit" className="px-3 py-1.5 text-sm bg-redepetro-red text-white rounded hover:bg-redepetro-dark">
              Adicionar
            </button>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-1">Incidências</span>
            <FormularioIncidencias
              formData={formData}
              setFormData={setFormData}
              compact
              ultimoCampoRef={ultimoCampoFormRef}
              onUltimoCampoTab={() => primeiroCampoRef.current?.focus()}
            />
          </div>
        </form>
      )}

      {/* Barra de pesquisa fixa no topo da tabela */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-t-lg px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <label className="sr-only">Pesquisar</label>
          <input
            type="text"
            placeholder="Pesquisar por código ou descrição (ex: Falta, 23)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-redepetro-red focus:border-redepetro-red"
          />
          <span className="text-sm text-gray-500">
            {eventosFiltrados.length} de {eventos.length} evento(s)
          </span>
        </div>
      </div>

      {/* Tabela com paginação */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Carregando...</p>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Mensal: INSS FGTS IRRF">Mensal</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="13º: INSS FGTS IRRF">13º</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Férias: INSS FGTS IRRF">Férias</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventosPagina.map((evento) => (
                    <tr key={evento.codigo_evento} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{evento.codigo_evento}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 max-w-[280px] truncate" title={evento.descricao}>{evento.descricao}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs ${evento.tipo === 'Provento' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {evento.tipo}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="inline-flex gap-0.5" title="INSS FGTS IRRF">
                          <IconeIncidencia valor={evento.inss_mensal} />
                          <IconeIncidencia valor={evento.fgts_mensal} />
                          <IconeIncidencia valor={evento.irrf_mensal} />
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="inline-flex gap-0.5">
                          <IconeIncidencia valor={evento.inss_13} />
                          <IconeIncidencia valor={evento.fgts_13} />
                          <IconeIncidencia valor={evento.irrf_13} />
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="inline-flex gap-0.5">
                          <IconeIncidencia valor={evento.inss_ferias} />
                          <IconeIncidencia valor={evento.fgts_ferias} />
                          <IconeIncidencia valor={evento.irrf_ferias} />
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button type="button" onClick={() => handleEdit(evento)} className="text-redepetro-red hover:text-redepetro-dark mr-2 text-sm font-medium">
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDelete(evento.codigo_evento)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de paginação */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Itens por página:</span>
                <select
                  value={porPagina}
                  onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual >= totalPaginas}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Edição (compacto) */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => resetForm()}>
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Editar Evento — {editando.codigo_evento}</h3>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap items-end gap-3 mb-3">
                  <div className="w-16">
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Código</label>
                    <input type="text" value={formData.codigo_evento} readOnly className="w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Descrição</label>
                    <input
                      type="text"
                      required
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="Provento">Provento</option>
                      <option value="Desconto">Desconto</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="block text-xs font-medium text-gray-600 mb-1">Incidências</span>
                  <FormularioIncidencias formData={formData} setFormData={setFormData} compact />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1.5 text-sm bg-redepetro-red text-white rounded hover:bg-redepetro-dark">
                    Salvar
                  </button>
                  <button type="button" onClick={() => resetForm()} className="px-3 py-1.5 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TabEventos;
