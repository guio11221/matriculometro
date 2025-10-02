'use client';

import React, { useState, useEffect, useCallback } from 'react';

// --- GoalCard somente leitura ---
const GoalCard = ({ goal }) => {
  const progress = goal.target > 0 ? Math.min(100, (goal.achieved / goal.target) * 100) : 0;
  const remaining = Math.max(0, goal.target - goal.achieved);

  const colorIndex = goal.category
    ? Array.from(goal.category).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 4
    : 0;

  const colors = [
    { text: 'text-yellow-600', bg: 'bg-yellow-500' },
    { text: 'text-green-600', bg: 'bg-green-500' },
    { text: 'text-blue-600', bg: 'bg-blue-500' },
    { text: 'text-pink-600', bg: 'bg-pink-500' },
  ];

  let { text: textColor, bg: progressColor } = colors[colorIndex];
  if (progress >= 100) {
    textColor = 'text-green-700';
    progressColor = 'bg-green-500';
  }

  return (
    <div className="w-full max-w-xs bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-base font-extrabold ${textColor}`}>{goal.category}</h3>
        <span
          className={`text-sm font-bold text-white px-2 py-0.5 rounded-md shadow ${
            progress >= 100 ? 'bg-green-600' : 'bg-gray-400'
          }`}
        >
          {progress.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-center space-x-1 w-full mb-3">
        <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-100 flex-shrink-0"></div>
        <div className="flex-grow h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-100 flex-shrink-0"></div>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-5 text-center">
        <div>
          <span className="text-xs font-semibold text-gray-800">{goal.target}</span>
          <p className="text-[9px] text-gray-500 uppercase">Alvo</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-green-600">{goal.achieved}</span>
          <p className="text-[9px] text-gray-500 uppercase">Realizadas</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-red-600">{remaining}</span>
          <p className="text-[9px] text-gray-500 uppercase">Restantes</p>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
