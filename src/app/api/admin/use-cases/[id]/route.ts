import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

// PUT /api/admin/use-cases/[id] - 更新使用案例
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminStatus = await isAdmin(session.user.id);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      contentType,
      contentUrl,
      thumbnailUrl,
      textContent,
      categoryId,
      relatedToolIds,
      order,
    } = body;

    // 检查使用案例是否存在
    const existingUseCase = await prisma.use_cases.findUnique({
      where: { id },
    });

    if (!existingUseCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // 如果更新了分类，验证分类是否存在
    if (categoryId && categoryId !== existingUseCase.categoryId) {
      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // 更新使用案例
    const updatedUseCase = await prisma.use_cases.update({
      where: { id },
      data: {
        title,
        description,
        contentType,
        contentUrl,
        thumbnailUrl,
        textContent,
        categoryId,
        relatedToolIds,
        order,
        updatedAt: new Date(),
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUseCase);
  } catch (error) {
    console.error('Error updating use case:', error);
    return NextResponse.json(
      { error: 'Failed to update use case' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/use-cases/[id] - 删除使用案例
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminStatus = await isAdmin(session.user.id);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 检查使用案例是否存在
    const existingUseCase = await prisma.use_cases.findUnique({
      where: { id },
    });

    if (!existingUseCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // 删除使用案例
    await prisma.use_cases.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting use case:', error);
    return NextResponse.json(
      { error: 'Failed to delete use case' },
      { status: 500 }
    );
  }
}
