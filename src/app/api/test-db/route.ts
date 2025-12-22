import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 测试数据库连接
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;

    // 测试 User 表
    const userCount = await prisma.users.count();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        queryTest: result,
        userCount,
        prismaExists: !!prisma,
        prismaUsersExists: !!prisma.users,
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      prismaExists: !!prisma,
    }, { status: 500 });
  }
}
