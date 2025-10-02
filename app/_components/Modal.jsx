'use client';

import React from 'react';

// Componente Modal simples e reutilizável
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose} // Fecha ao clicar fora
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4"
        onClick={(e) => e.stopPropagation()} // Impede que o clique interno feche o modal
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
