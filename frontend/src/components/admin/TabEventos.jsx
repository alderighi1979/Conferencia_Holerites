import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../../services/api';

function TabEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo_evento: '',
    descricao: '',
    tipo: 'Provento',
    inss_mensal: 'I',
    fgts_mensal: 'I',
    irrf_mensal: 'I',
    inss_13: 'I',
    fgts_13: 'I',
    irrf_13: 'I',
    inss_ferias: 'I',
    fgts_ferias: 'I',
    irrf_ferias: 'I',
  });
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const response = await eventosAPI.getAll();
      setEventos(response.data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setErro('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const data = {
        codigo_evento: parseInt(formData.codigo_evento),
        descricao: formData.descricao,
        tipo: formData.tipo,
        inss_mensal: formData.inss_mensal,
        fgts_mensal: formData.fgts_mensal,
        irrf_mensal: formData.irrf_mensal,
        inss_13: formData.inss_13,
        fgts_13: formData.fgts_13,
        irrf_13: formData.irrf_13,
        inss_ferias: formData.inss_ferias,
        fgts_ferias: formData.fgts_ferias,
        irrf_ferias: formData.irrf_ferias,
      };

      if (editando) {
        await eventosAPI.update(editando.codigo_evento, data);
      } else {
        await eventosAPI.create(data);
      }

      resetForm();
      carregarEventos();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao salvar evento');
    }
  };

  const handleEdit = (evento) => {
    setEditando(evento);
    setFormData({
      codigo_evento: evento.codigo_evento,
      descricao: evento.descricao,
      tipo: evento.tipo,
      inss_mensal: evento.inss_mensal,
      fgts_mensal: evento.fgts_mensal,
      irrf_mensal: evento.irrf_mensal,
      inss_13: evento.inss_13,
      fgts_13: evento.fgts_13,
      irrf_13: evento.irrf_13,
      inss_ferias: evento.inss_ferias,
      fgts_ferias: evento.fgts_ferias,
      irrf_ferias: evento.irrf_ferias,
    });
  };

  const handleDelete = async (codigo) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

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
      inss_mensal: 'I',
      fgts_mensal: 'I',
      irrf_mensal: 'I',
      inss_13: 'I',
      fgts_13: 'I',
      irrf_13: 'I',
      inss_ferias: 'I',
      fgts_ferias: 'I',
      irrf_ferias: 'I',
    });
    setEditando(null);
  };

  const tiposIncidencia = [
    { label: 'Mensal', campos: ['inss_mensal', 'fgts_mensal', 'irrf_mensal'] },
    { label: '13º Salário', campos: ['inss_13', 'fgts_13', 'irrf_13'] },
    { label: 'Férias', campos: ['inss_ferias', 'fgts_ferias', 'irrf_ferias'] },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventos</h2>

      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código do Evento
            </label>
            <input
              type="number"
              required
              value={formData.codigo_evento}
              onChange={(e) => setFormData({ ...formData, codigo_evento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!!editando}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Provento">Provento</option>
            <option value="Desconto">Desconto</option>
          </select>
        </div>

        {/* Incidências */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incidências
          </label>
          <div className="space-y-4">
            {tiposIncidencia.map((tipo) => (
              <div key={tipo.label} className="border p-3 rounded-md">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{tipo.label}</h4>
                <div className="grid grid-cols-3 gap-4">
                  {tipo.campos.map((campo) => (
                    <div key={campo}>
                      <label className="block text-xs text-gray-600 mb-1">
                        {campo.split('_')[0].toUpperCase()}
                      </label>
                      <select
                        value={formData[campo]}
                        onChange={(e) => setFormData({ ...formData, [campo]: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="I">Isento</option>
                        <option value="S">Sim</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-redepetro-red text-white rounded-md hover:bg-redepetro-dark transition-colors"
          >
            {editando ? 'Atualizar' : 'Adicionar'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventos.map((evento) => (
                <tr key={evento.codigo_evento}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {evento.codigo_evento}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {evento.descricao}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      evento.tipo === 'Provento' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {evento.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(evento)}
                      className="text-redepetro-red hover:text-redepetro-dark mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(evento.codigo_evento)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TabEventos;
