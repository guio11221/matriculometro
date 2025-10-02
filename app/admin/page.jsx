'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Upload, Trash2, Edit, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Utilitários de Exportação/Importação CSV ---

// Converte dados JSON para CSV formatado
const convertToCSV = (data) => {
  const headers = ["id", "category", "target", "achieved", "createdAt", "updatedAt"];
  const csvRows = [];

  // Adiciona o cabeçalho
  csvRows.push(headers.join(','));

  // Adiciona as linhas de dados
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) {
        value = '';
      }
      // Formata datas para o CSV
      if (header.includes('At') && value) {
        value = new Date(value).toISOString();
      }
      // Garante que valores com vírgulas ou aspas sejam encapsulados
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
};



// Processa o upload do arquivo CSV
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const goals = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue; // Ignora linhas mal formatadas

    const goal = {};
    headers.forEach((header, index) => {
      let value = values[index].trim().replace(/^"|"$/g, '').replace(/""/g, '"');

      if (header === 'id' || header === 'target' || header === 'achieved') {
        goal[header] = parseInt(value, 10);
      } else if (header.includes('At') && value) {
        goal[header] = new Date(value);
      } else {
        goal[header] = value;
      }
    });

    // A importação deve focar apenas em category, target e achieved
    // O ID é ignorado na criação, mas útil para mapeamento
    if (goal.category && goal.target !== undefined && goal.achieved !== undefined) {
      goals.push({
        category: goal.category,
        target: goal.target,
        achieved: goal.achieved
      });
    }
  }
  return goals;
};

// --- 1. Componente Modal ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 transform transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};


// --- 2. Componente Formulário ---
const AdminGoalForm = ({ onSubmit, initialGoal, isEditing }) => {
  // Inicializa os estados com valores seguros
  const [category, setCategory] = useState(initialGoal?.category || '');
  const [target, setTarget] = useState(initialGoal?.target || 0);
  const [achieved, setAchieved] = useState(initialGoal?.achieved || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!category.trim()) {
      setError('A categoria é obrigatória.');
      return;
    }
    if (target < 0 || achieved < 0) {
      setError('Alvo e Matriculados não podem ser negativos.');
      return;
    }

    onSubmit({
      category: category.trim(),
      target: parseInt(target, 10) || 0,
      achieved: parseInt(achieved, 10) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-sm text-red-600 font-medium p-2 bg-red-100 rounded-lg">{error}</p>}

      {/* Categoria */}
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
          Categoria (Ex: Maternal Manhã)
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      {/* Alvo Inicial */}
      <div>
        <label htmlFor="target" className="block text-sm font-semibold text-gray-700">
          Alvo Inicial de Matrículas
        </label>
        <input
          type="number"
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          min="0"
          required
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      {/* Já Matriculados */}
      <div>
        <label htmlFor="achieved" className="block text-sm font-semibold text-gray-700">
          Matriculados Atuais
        </label>
        <input
          type="number"
          id="achieved"
          value={achieved}
          onChange={(e) => setAchieved(e.target.value)}
          min="0"
          required
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      {/* Botão */}
      <button
        type="submit"
        className="w-full justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01]"
      >
        {isEditing ? 'Salvar Edição' : 'Cadastrar Novo Objetivo'}
      </button>
    </form>
  );
};


// --- Funções de Persistência com API REST ---
const API_ENDPOINT = '/api/goals';

const fetchGoals = async () => {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Erro ao buscar objetivos: ${response.statusText}`);
    }
    const data = await response.json();
    // Ordena por categoria
    return data.sort((a, b) => a.category.localeCompare(b.category));
  } catch (error) {
    console.error("Erro no fetchGoals:", error);
    return [];
  }
};

const createGoal = async (newGoal) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoal),
    });
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || `Erro ao criar objetivo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro no createGoal:", error);
    throw error;
  }
};

const deleteGoal = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || `Erro ao excluir objetivo: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Erro no deleteGoal:", error);
    throw error;
  }
};

const updateGoal = async (id, updatedFields) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || `Erro ao atualizar objetivo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro no updateGoal:", error);
    throw error;
  }
};


// --- 3. Componente Principal MatriculometroAdmin ---

const MatriculometroAdmin = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [goalsPerPage, setGoalsPerPage] = useState(5); // Padrão
  const goalsPerPageOptions = [5, 10, 20];

  // Função para carregar dados
  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGoals();
      setGoals(data);
      setCurrentPage(1); // Volta para a primeira página ao recarregar
    } catch (e) {
      setNotification({ message: 'Falha ao carregar dados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregamento inicial
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Função para mostrar notificação
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // --- Ações de CRUD (Chamando as Funções REST) ---

  const handleCreateOrUpdate = async (goalData) => {
    try {
      if (isEditing) {
        await updateGoal(currentGoal.id, goalData);
        showNotification(`Objetivo "${goalData.category}" atualizado com sucesso!`, 'success');
      } else {
        await createGoal(goalData);
        showNotification(`Objetivo "${goalData.category}" cadastrado com sucesso!`, 'success');
      }
      setIsModalOpen(false);
      loadGoals();
    } catch (error) {
      showNotification(`Erro: ${error.message || 'Falha na operação.'}`, 'error');
    }
  };

  const handleDelete = async (id, category) => {
    // Usando o Modal customizado em vez de window.confirm
    if (window.confirm(`Tem certeza que deseja EXCLUIR o objetivo "${category}"? Esta ação é irreversível.`)) {
      try {
        await deleteGoal(id);
        showNotification(`Objetivo "${category}" excluído com sucesso.`, 'success');
        loadGoals();
      } catch (error) {
        showNotification(`Erro ao excluir: ${error.message || 'Falha na exclusão.'}`, 'error');
      }
    }
  };

  // Faz o download do arquivo CSV
  const downloadJson = async () => {
    try {
      const response = await fetch('/api/goals/export'); // sua rota de exportação
      if (!response.ok) throw new Error(`Erro ao exportar JSON: ${response.statusText}`);

      const blob = await response.blob(); // transforma em blob para download
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'enrollment_goals.json'; // nome do arquivo
      a.click();

      window.URL.revokeObjectURL(url); // limpa referência
    } catch (error) {
      console.error("Falha ao baixar JSON:", error);
    }
  };

  const importJson = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || !Array.isArray(data)) {
        alert(`Formato inválido. Esperado: ${JSON.stringify(
        {
          id: 1,
          category: "1º ano manhã",
          target: 20,
          achieved: 0,
          createdAt: "2025-10-01T20:59:02.670Z",
          updatedAt: "2025-10-02T12:02:36.059Z",
        },
        null,
        2
      )}`);
        return;
      }

      const response = await fetch('/api/goals/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao importar JSON");
      }

      alert(`✅ Importação concluída: ${result.count} objetivos processados.`);

      // 🔄 Recarrega a tela após a importação
      window.location.reload();

    } catch (error) {
      console.error("Falha ao importar JSON:", error);
      alert(error.message || "Erro ao importar o arquivo. Verifique o formato do JSON.");
    }
  };

  const handleEditClick = (goal) => {
    setCurrentGoal(goal);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setCurrentGoal(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };



  // --- Funções de Importação/Exportação ---
  const handleExportJson = () => {
    downloadJson(goals);
    showNotification('Dados exportados para objetivos_matriculometro.csv', 'info');
  };


  // --- Lógica de Paginação ---
  const totalPages = Math.ceil(goals.length / goalsPerPage);
  const indexOfLastGoal = currentPage * goalsPerPage;
  const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;

  const currentGoals = useMemo(() => {
    return goals.slice(indexOfFirstGoal, indexOfLastGoal);
  }, [goals, indexOfFirstGoal, indexOfLastGoal]);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4 p-4 bg-white rounded-xl shadow-md">
      {/* Itens por página */}
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <span>Objetivos por página:</span>
        <select
          value={goalsPerPage}
          onChange={(e) => {
            setGoalsPerPage(Number(e.target.value));
            setCurrentPage(1); // Volta para a primeira página
          }}
          className="p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {goalsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Status e Navegação */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima Página"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- Renderização Principal ---

  if (loading) {
    return <div className="p-8 text-center text-xl font-medium text-blue-600">Carregando dados...</div>;
  }

  // Cálculos de Totais
  const totalGoals = goals.reduce((sum, g) => sum + g.target, 0);
  const totalAchieved = goals.reduce((sum, g) => sum + g.achieved, 0);
  const progressPercent = totalGoals > 0 ? (totalAchieved / totalGoals) * 100 : 0;


  const notificationClasses = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Painel de Gestão de Metas</h1>
      <p className="text-gray-500 mb-6">Gerencie os objetivos de matrícula por categoria.</p>

      {/* Notificação */}
      {notification.message && (
        <div
          className={`p-4 mb-4 rounded-lg border-l-4 font-medium shadow-md ${notificationClasses[notification.type]}`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      {/* Resumo Rápido */}
      <div className="bg-white p-5 rounded-xl shadow-lg mb-6 border-l-4 border-blue-600">
        <p className="text-md font-semibold text-gray-700">
          <span className="text-xl font-bold text-gray-800">{goals.length}</span> Objetivos Ativos | Progresso Geral:
          <span className="text-2xl font-extrabold text-blue-600 ml-2">{totalAchieved}</span> /
          <span className="text-2xl font-extrabold text-gray-800">{totalGoals}</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          ></div>
        </div>
        <span className="text-sm font-semibold text-gray-600 mt-1 block">{progressPercent.toFixed(1)}% Completo</span>
      </div>

      {/* Ações: Adicionar, Importar, Exportar */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mb-6">



        {/* Botão de Importar JSON */}
        <label
          htmlFor="import-json"
          className="flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors transform hover:scale-[1.01] cursor-pointer"
          title="Importar dados de um arquivo JSON"
        >
          <Upload className="h-5 w-5" />
          <span>Importar JSON</span>
        </label>
        <input
          type="file"
          id="import-json"
          accept=".json"
          className="hidden"
          onChange={importJson}
        />


        {/* Botão de Exportar em json */}
        <button
          onClick={handleExportJson}
          className="flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors transform hover:scale-[1.01]"
          title="Exportar dados para CSV"
        >
          <Download className="h-5 w-5" />
          <span>Exportar JSON</span>
        </button>

        {/* Botão de Adicionar */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors transform hover:scale-[1.01]"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Objetivo</span>
        </button>
      </div>

      {/* Tabela de Gerenciamento */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Alvo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Realizadas
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Restantes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentGoals.map((goal) => {
              const progress = goal.target > 0 ? (goal.achieved / goal.target) * 100 : 0;
              const remaining = Math.max(0, goal.target - goal.achieved);

              return (
                <tr key={goal.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {goal.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {goal.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    {goal.achieved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                    {remaining}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{progress.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="text-blue-600 hover:text-blue-800 transition-colors font-semibold p-1 rounded-md hover:bg-blue-100"
                      title="Editar Alvo e Categoria"
                    >
                      <Edit className="w-4 h-4 inline-block" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id, goal.category)}
                      className="text-red-600 hover:text-red-800 transition-colors font-semibold p-1 rounded-md hover:bg-red-100"
                      title="Excluir Objetivo"
                    >
                      <Trash2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {goals.length === 0 && (
          <p className="text-center py-10 text-lg text-gray-500">Nenhum objetivo cadastrado. Comece adicionando um novo.</p>
        )}
      </div>

      {/* Controles de Paginação */}
      {goals.length > 0 && totalPages > 1 && <PaginationControls />}

      {/* Modal para Cadastro/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Objetivo' : 'Cadastrar Novo Objetivo'}
      >
        <AdminGoalForm
          onSubmit={handleCreateOrUpdate}
          initialGoal={currentGoal}
          isEditing={isEditing}
        />
      </Modal>
    </div>
  );
};

export default MatriculometroAdmin;
