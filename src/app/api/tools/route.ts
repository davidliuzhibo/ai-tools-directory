import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
              slug: true,
              icon: true,
            },
          },
        },
        orderBy: {
          rankingScore: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.tool.count({ where }),
    ]);

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json(
      { error: '获取工具列表失败' },
      { status: 500 }
    );
  }
}
