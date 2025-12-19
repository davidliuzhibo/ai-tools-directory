import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// 获取用户的收藏列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const favorites = await prisma.favorites.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tools: {
          include: {
            categories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { toolId } = await request.json();

    if (!toolId) {
      return NextResponse.json({ error: '工具ID不能为空' }, { status: 400 });
    }

    // 检查工具是否存在
    const tool = await prisma.tools.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json({ error: '工具不存在' }, { status: 404 });
    }

    // 检查是否已收藏
    const existing = await prisma.favorites.findUnique({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: '已经收藏过了' }, { status: 400 });
    }

    // 创建收藏
    const favorite = await prisma.favorites.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        toolId,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ error: '添加收藏失败' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (!toolId) {
      return NextResponse.json({ error: '工具ID不能为空' }, { status: 400 });
    }

    // 删除收藏
    await prisma.favorites.delete({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId,
        },
      },
    });

    return NextResponse.json({ message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ error: '取消收藏失败' }, { status: 500 });
  }
}
