import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

/**
 * PUT /api/goals/[id]
 * Atualiza COMPLETAMENTE um objetivo de matrícula por ID, focando em 'category' e 'target'.
 * Corpo esperado: { category: string, target: number }
 * O ID é lido dos parâmetros da URL.
 */
export async function PUT(request, context) {
  try {
    // CORREÇÃO: Usar 'await' para desestruturar 'params' e resolver a Promise do Next.js
    const { id: idParam } = await context.params; 
    const id = parseInt(idParam, 10); // Converte o ID

    const body = await request.json();
    const { category, target, achieved } = body;

    // Validação
    if (!id || !category || target === undefined) {
      return NextResponse.json(
        { error: "ID inválido ou campos 'category' e 'target' são obrigatórios." },
        { status: 400 }
      );
    }

    // Atualização
    const updatedGoal = await prisma.enrollmentGoal.update({
      where: { id },
      data: {
        category: category.trim(),
        target: parseInt(target, 10) || 0,
        achieved: parseInt(achieved, 10) || 0,
        updatedAt: new Date(),
    }
    });

    // Usando NextResponse.json em vez de Response.json para consistência
    return NextResponse.json(updatedGoal, { status: 200 }); 
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error);

    // Trata erro de categoria duplicada (Unicidade)
    if (error.code === 'P2002') {
      return NextResponse.json( // Usando NextResponse.json para consistência
        { error: `A categoria '${context.params?.category}' já existe. Escolha outro nome.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Falha ao atualizar objetivo de matrícula.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]
 * Exclui um objetivo de matrícula por ID.
 * O ID é lido dos parâmetros da URL.
 */
export async function DELETE(request, context) {
  try {
    // CORREÇÃO: Usar 'await' para desestruturar 'params' e resolver a Promise do Next.js
    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10); // Converte o ID

    if (!id) {
      return NextResponse.json(
        { error: 'ID inválido para exclusão.' },
        { status: 400 }
      );
    }

    await prisma.enrollmentGoal.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // sucesso sem corpo
  } catch (error) {
    console.error('Erro ao excluir objetivo:', error);

    // Trata caso de registro não encontrado (ID inexistente)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Objetivo não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Falha ao excluir objetivo de matrícula.' },
      { status: 500 }
    );
  }
}
