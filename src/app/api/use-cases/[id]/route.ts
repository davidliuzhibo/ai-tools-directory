import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/use-cases/[id] - 获取单个使用案例
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = await prisma.use_cases.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });

    if (!useCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // 如果有关联工具，获取工具信息
    let relatedTools = [];
    if (useCase.relatedToolIds) {
      const toolIds = useCase.relatedToolIds as string[];
      relatedTools = await prisma.tools.findMany({
        where: {
          id: {
            in: toolIds,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          description: true,
        },
      });
    }

    return NextResponse.json({
      ...useCase,
      relatedTools,
    });
  } catch (error) {
    console.error('Error fetching use case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case' },
      { status: 500 }
    );
  }
}
