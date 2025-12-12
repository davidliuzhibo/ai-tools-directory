import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有分类
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { tools: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, order } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: '名称和 slug 不能为空' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: '该 slug 已存在' },
        { status: 400 }
      );
    }

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        order: order || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
