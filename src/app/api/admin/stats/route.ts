import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取各种统计数据
    const [toolsCount, categoriesCount, usersCount, favoritesCount] =
      await Promise.all([
        prisma.tool.count(),
        prisma.category.count(),
        prisma.user.count(),
        prisma.favorite.count(),
      ]);

    return NextResponse.json({
      toolsCount,
      categoriesCount,
      usersCount,
      favoritesCount,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
