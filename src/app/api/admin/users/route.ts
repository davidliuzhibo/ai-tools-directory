import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin';

// 获取所有用户
export async function GET() {
  try {
    // 检查管理员权限
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            favorites: true,
            comments: true,
          },
        },
        admins: {
          select: {
            role: true,
          },
        },
      },
    });

    // 移除敏感信息
    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user as any;
      return safeUser;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
