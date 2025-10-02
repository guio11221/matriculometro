import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    await prisma.enrollmentGoal.deleteMany({});
    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        {
          error: `Formato inválido. Esperado um array de objetos no formato: ${JSON.stringify(
            {
              id: 56,
              category: "1º ano manhã",
              target: 20,
              achieved: 0,
              createdAt: "2025-10-01T20:59:02.670Z",
              updatedAt: "2025-10-02T12:02:36.059Z",
            },
            null,
            2
          )}`,
        },
        { status: 400 }
      );
    }

    const goals = body;

    // Verifica duplicados ANTES de inserir
    for (const goal of goals) {
      const exists = await prisma.enrollmentGoal.findFirst({
        where: { category: goal.category },
      });

      if (exists) {
        return NextResponse.json(
          {
            error: `O objetivo com categoria '${goal.category}' já existe no banco.`
          },
          { status: 409 }
        );
      }
    }

    // Insere todos de uma vez
    const created = await prisma.enrollmentGoal.createMany({
      data: goals.map((g) => ({
        category: g.category,
        target: g.target,
        achieved: g.achieved,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      })),
    });

    return NextResponse.json(
      { message: "Importação concluída.", count: created.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao importar JSON:", error);
    return NextResponse.json(
      { error: "Falha ao importar dados." },
      { status: 500 }
    );
  }
}
