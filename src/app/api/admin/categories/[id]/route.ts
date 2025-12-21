import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin';

// 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, icon, order } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: '名称和 slug 不能为空' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const existing = await prisma.categories.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 如果修改了 slug，检查新 slug 是否已被使用
    if (slug !== existing.slug) {
      const slugExists = await prisma.categories.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: '该 slug 已存在' },
          { status: 400 }
        );
      }
    }

    // 更新分类
    const category = await prisma.categories.update({
      where: { id },
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
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { id } = await params;

    // 检查分类下是否有工具
    const toolCount = await prisma.tools.count({
      where: { categoryId: id },
    });

    if (toolCount > 0) {
      return NextResponse.json(
        { error: `该分类下有 ${toolCount} 个工具，无法删除` },
        { status: 400 }
      );
    }

    // 删除分类
    await prisma.categories.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
