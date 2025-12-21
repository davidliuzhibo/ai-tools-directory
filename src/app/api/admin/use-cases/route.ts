import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

// POST /api/admin/use-cases - 创建使用案例（需要管理员权限）
export async function POST(request: Request) {
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

    // 验证必填字段
    if (!title || !contentType || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // 创建使用案例
    const useCase = await prisma.use_cases.create({
      data: {
        id: `uc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title,
        description,
        contentType,
        contentUrl,
        thumbnailUrl,
        textContent,
        categoryId,
        relatedToolIds: relatedToolIds || [],
        order: order || 0,
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

    return NextResponse.json(useCase);
  } catch (error) {
    console.error('Error creating use case:', error);
    return NextResponse.json(
      { error: 'Failed to create use case' },
      { status: 500 }
    );
  }
}

// GET /api/admin/use-cases - 获取所有使用案例（管理员视图）
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [useCases, total] = await Promise.all([
      prisma.use_cases.findMany({
        where,
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
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.use_cases.count({ where }),
    ]);

    return NextResponse.json({
      useCases,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching use cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use cases' },
      { status: 500 }
    );
  }
}
