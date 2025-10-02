'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GoalCard from './_components/GoalCard.jsx';

export default function MatriculometroClient() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Falha ao carregar objetivos');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => await fetchGoals();
    fetchData();
    const interval = setInterval(() => {
      if (isMounted) fetchData();
    }, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchGoals]);

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalAchieved = goals.reduce((sum, g) => sum + g.achieved, 0);

  const colorPalette = [
    'from-yellow-400 to-yellow-600',
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-pink-400 to-pink-600',
  ];

  const segments = goals.map((goal) => {
    const width = totalTarget > 0 ? (goal.target / totalTarget) * 100 : 0;
    const progressPercent = goal.target > 0 ? Math.min(100, (goal.achieved / goal.target) * 100) : 0;
    const colorIndex = goal.category
      ? Array.from(goal.category).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 4
      : 0;
    return {
      width,
      label: goal.category,
      target: goal.target,
      achieved: goal.achieved,
      colorClass: colorPalette[colorIndex],
      progressPercent,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
          Matriculômetro 2026 — Educação Adventista
        </h1>
        <p className="text-gray-600 text-lg">
          Visualização automática dos dados em tempo real.
        </p>
      </header>

      {/* Barra de Progresso Geral com gradiente animado */}
      <section className="mb-12 text-center relative">
        <div className="text-2xl font-semibold text-gray-700 mb-3">
          Progresso geral: {totalAchieved} / {totalTarget}
        </div>
        <div className="w-full max-w-4xl mx-auto h-6 bg-gray-300 rounded-full shadow-inner flex relative overflow-hidden">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className={`relative h-full cursor-pointer transition-transform duration-300 ease-out`}
              style={{
                width: `${seg.width}%`,
                transform: hoveredSegment === seg.label ? 'scaleY(1.3)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                zIndex: hoveredSegment === seg.label ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredSegment(seg.label)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {/* Gradiente animado tipo "líquido" */}
              <div
                className={`h-full w-full bg-gradient-to-r ${seg.colorClass} transition-all duration-1000`}
                style={{ clipPath: `inset(${100 - seg.progressPercent}% 0 0 0)` }}
              ></div>

              {/* Tooltip estilizado */}
              {hoveredSegment === seg.label && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                  {seg.label}: {seg.achieved}/{seg.target}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {loading ? (
          <p className="col-span-full text-center text-xl text-blue-500 font-medium py-10">
            Carregando objetivos...
          </p>
        ) : goals.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Nenhum objetivo cadastrado.
          </p>
        ) : (
          goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </section>
    </div>
  );
}