import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category');
    const pricingType = searchParams.get('pricing');
    const teamOrigin = searchParams.get('team');
    const sortBy = searchParams.get('sortBy') || 'rankingScore';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {
      isPublished: true,
    };

    // 搜索关键词
    if (query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // 分类筛选
    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    // 价格类型筛选
    if (pricingType && pricingType !== 'all') {
      where.pricingType = pricingType;
    }

    // 团队来源筛选
    if (teamOrigin && teamOrigin !== 'all') {
      where.teamOrigin = teamOrigin;
    }

    // 排序配置
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'rankingScore') {
      orderBy.rankingScore = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
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
      orderBy,
      take: 100,
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
