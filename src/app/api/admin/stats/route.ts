import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin';

export async function GET() {
  try {
    // 检查管理员权限
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    // 获取各种统计数据
    const [toolsCount, categoriesCount, usersCount, favoritesCount] =
      await Promise.all([
        prisma.tools.count(),
        prisma.categories.count(),
        prisma.users.count(),
        prisma.favorites.count(),
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
