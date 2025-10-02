import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const goals = await prisma.enrollmentGoal.findMany({
      orderBy: { category: 'asc' },
    });

    // Retorna como JSON puro para download
    return NextResponse.json(goals, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="enrollment_goals.json"',
      },
    });
  } catch (error) {
    console.error("Erro ao exportar objetivos:", error);
    return NextResponse.json({ error: "Falha ao exportar objetivos" }, { status: 500 });
  }
}
