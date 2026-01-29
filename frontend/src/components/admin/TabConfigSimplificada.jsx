import React, { useState, useEffect } from 'react';
import { configSimplificadaAPI } from '../../services/api';

function TabConfigSimplificada() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    valor_desconto_padrao: '',
  });
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarConfigs();
  }, []);

  const carregarConfigs = async () => {
    setLoading(true);
    try {
      const response = await configSimplificadaAPI.getAll();
      setConfigs(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setErro('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const data = {
        valor_desconto_padrao: parseFloat(formData.valor_desconto_padrao),
      };

      if (editando) {
        await configSimplificadaAPI.update(editando.id, data);
      } else {
        await configSimplificadaAPI.create(data);
      }

      resetForm();
      carregarConfigs();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao salvar configuração');
    }
  };

  const handleEdit = (config) => {
    setEditando(config);
    setFormData({
      valor_desconto_padrao: config.valor_desconto_padrao,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      await configSimplificadaAPI.delete(id);
      carregarConfigs();
    } catch (error) {
      setErro('Erro ao excluir configuração');
    }
  };

  const resetForm = () => {
    setFormData({
      valor_desconto_padrao: '',
    });
    setEditando(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuração Simplificada</h2>

      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Desconto Padrão
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.valor_desconto_padrao}
              onChange={(e) => setFormData({ ...formData, valor_desconto_padrao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
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
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor do Desconto Padrão
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {config.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    R$ {config.valor_desconto_padrao.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-redepetro-red hover:text-redepetro-dark mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
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

export default TabConfigSimplificada;
