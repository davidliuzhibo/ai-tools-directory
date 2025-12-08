import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category');

    if (!query.trim()) {
      return NextResponse.json({ tools: [] });
    }

    const where: any = {
      isPublished: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    const tools = await prisma.tool.findMany({
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
      take: 50,
    });

    return NextResponse.json({ tools, count: tools.length });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}
