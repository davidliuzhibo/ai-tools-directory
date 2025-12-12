import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有用户
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            favorites: true,
            comments: true,
          },
        },
        admin: {
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
