import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取工具的评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (!toolId) {
      return NextResponse.json({ error: '工具ID不能为空' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        toolId,
        parentId: null, // 只获取顶级评论
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { toolId, content, parentId } = await request.json();

    // 验证
    if (!toolId || !content?.trim()) {
      return NextResponse.json(
        { error: '工具ID和评论内容不能为空' },
        { status: 400 }
      );
    }

    // 检查工具是否存在
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json({ error: '工具不存在' }, { status: 404 });
    }

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json({ error: '父评论不存在' }, { status: 404 });
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        toolId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ error: '创建评论失败' }, { status: 500 });
  }
}
