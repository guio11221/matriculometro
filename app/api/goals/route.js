import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/goals
 * Retorna todos os objetivos de matrícula. Cria os objetivos iniciais se não existirem.
 */
export async function GET() {
  try {
    let goals = await prisma.enrollmentGoal.findMany({
      orderBy: { category: "asc" },
    });

    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar objetivos:", error);
    return NextResponse.json(
      { error: "Falha ao buscar objetivos de matrícula." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/goals
 * Atualiza um único objetivo de matrícula (target ou achieved) por ID.
 * Corpo esperado: { id: number, target?: number, achieved?: number }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, target, achieved } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    if (target === undefined && achieved === undefined) {
      return NextResponse.json(
        { error: "É necessário informar pelo menos target ou achieved." },
        { status: 400 }
      );
    }

    const dataToUpdate = {};
    if (target !== undefined && !isNaN(parseInt(target))) {
      dataToUpdate.target = parseInt(target);
    }
    if (achieved !== undefined && !isNaN(parseInt(achieved))) {
      dataToUpdate.achieved = parseInt(achieved);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado válido para atualização." },
        { status: 400 }
      );
    }

    const updatedGoal = await prisma.enrollmentGoal.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedGoal, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar objetivo:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Objetivo não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao atualizar objetivo de matrícula." },
      { status: 500 }
    );
  }
}

