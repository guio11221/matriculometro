'use client';

import React, { useState } from 'react';

const AdminGoalForm = ({ onSubmit, initialGoal, isEditing }) => {
  const [category, setCategory] = useState(initialGoal?.category || '');
  const [target, setTarget] = useState(initialGoal?.target || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category.trim()) return;

    onSubmit({
      id: isEditing ? initialGoal.id : undefined, // 🔑 agora passa o ID
      category: category.trim(),
      target: parseInt(target) || 0,
      achieved: isEditing ? initialGoal.achieved : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoria */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Categoria (Ex: Maternal manhã)
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Alvo */}
      <div>
        <label htmlFor="target" className="block text-sm font-medium text-gray-700">
          Alvo Inicial de Matrículas
        </label>
        <input
          type="number"
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          min="0"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Matrículas realizadas (somente leitura no modo edição) */}
      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Matrículas já realizadas
          </label>
          <input
            type="number"
            value={initialGoal.achieved}
            readOnly
            disabled
            className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm p-2 border text-gray-600 cursor-not-allowed"
          />
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {isEditing ? 'Salvar Edição' : 'Cadastrar Novo Objetivo'}
      </button>
    </form>
  );
};

export default AdminGoalForm;
