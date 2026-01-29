import React, { useState, useEffect } from 'react';
import { irrfAPI } from '../../services/api';

function TabIRRF() {
  const [faixas, setFaixas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    faixa_inicial: '',
    faixa_final: '',
    aliquota: '',
    parcela_deduzir: '',
    valor_por_dependente: '',
  });
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarFaixas();
  }, []);

  const carregarFaixas = async () => {
    setLoading(true);
    try {
      const response = await irrfAPI.getAll();
      setFaixas(response.data);
    } catch (error) {
      console.error('Erro ao carregar faixas:', error);
      setErro('Erro ao carregar faixas de IRRF');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const data = {
        faixa_inicial: parseFloat(formData.faixa_inicial),
        faixa_final: parseFloat(formData.faixa_final),
        aliquota: parseFloat(formData.aliquota),
        parcela_deduzir: parseFloat(formData.parcela_deduzir) || 0,
        valor_por_dependente: parseFloat(formData.valor_por_dependente) || 0,
      };

      if (editando) {
        await irrfAPI.update(editando.id, data);
      } else {
        await irrfAPI.create(data);
      }

      resetForm();
      carregarFaixas();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao salvar faixa');
    }
  };

  const handleEdit = (faixa) => {
    setEditando(faixa);
    setFormData({
      faixa_inicial: faixa.faixa_inicial,
      faixa_final: faixa.faixa_final,
      aliquota: faixa.aliquota,
      parcela_deduzir: faixa.parcela_deduzir,
      valor_por_dependente: faixa.valor_por_dependente,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta faixa?')) {
      return;
    }

    try {
      await irrfAPI.delete(id);
      carregarFaixas();
    } catch (error) {
      setErro('Erro ao excluir faixa');
    }
  };

  const resetForm = () => {
    setFormData({
      faixa_inicial: '',
      faixa_final: '',
      aliquota: '',
      parcela_deduzir: '',
      valor_por_dependente: '',
    });
    setEditando(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tabela IRRF</h2>

      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faixa Inicial
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.faixa_inicial}
              onChange={(e) => setFormData({ ...formData, faixa_inicial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faixa Final
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.faixa_final}
              onChange={(e) => setFormData({ ...formData, faixa_final: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alíquota (%)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.aliquota}
              onChange={(e) => setFormData({ ...formData, aliquota: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parcela a Deduzir
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.parcela_deduzir}
              onChange={(e) => setFormData({ ...formData, parcela_deduzir: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor por Dependente
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor_por_dependente}
              onChange={(e) => setFormData({ ...formData, valor_por_dependente: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  Faixa Inicial
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Faixa Final
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alíquota (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Parcela a Deduzir
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor por Dependente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faixas.map((faixa) => (
                <tr key={faixa.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    R$ {faixa.faixa_inicial.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    R$ {faixa.faixa_final.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {faixa.aliquota}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    R$ {faixa.parcela_deduzir.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    R$ {faixa.valor_por_dependente.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(faixa)}
                      className="text-redepetro-red hover:text-redepetro-dark mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(faixa.id)}
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

export default TabIRRF;
