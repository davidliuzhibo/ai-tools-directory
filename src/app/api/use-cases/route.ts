import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/use-cases - 获取使用案例列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const toolId = searchParams.get('toolId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 如果查询特定工具的案例，需要在 relatedToolIds JSON 中搜索
    if (toolId) {
      where.relatedToolIds = {
        path: '$',
        array_contains: toolId,
      };
    }

    const [useCases, total] = await Promise.all([
      prisma.use_cases.findMany({
        where,
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
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.use_cases.count({ where }),
    ]);

    return NextResponse.json({
      useCases,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching use cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use cases' },
      { status: 500 }
    );
  }
}
