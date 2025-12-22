import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin';

// 获取单个工具
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { id } = await params;
    const tool = await prisma.tools.findUnique({
      where: { id },
      include: {
        categories: true,
        ranking_metrics: true,
      },
    });

    if (!tool) {
      return NextResponse.json(
        { error: '工具不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('获取工具失败:', error);
    return NextResponse.json(
      { error: '获取工具失败' },
      { status: 500 }
    );
  }
}

// 更新工具
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

    const tool = await prisma.tools.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        fullDescription: body.fullDescription,
        websiteUrl: body.websiteUrl,
        logoUrl: body.logoUrl,
        teamOrigin: body.teamOrigin,
        pricingType: body.pricingType,
        pricingDetails: body.pricingDetails,
        rankingScore: body.rankingScore,
        platformAvailability: body.platformAvailability,
        categoryId: body.categoryId,
        dataSource: body.dataSource,
        isPublished: body.isPublished,
        isFeatured: body.isFeatured,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(tool);
  } catch (error: any) {
    console.error('更新工具失败:', error);
    return NextResponse.json(
      { error: '更新工具失败: ' + error.message },
      { status: 500 }
    );
  }
}

// 删除工具
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

    await prisma.tools.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除工具失败:', error);
    return NextResponse.json(
      { error: '删除工具失败: ' + error.message },
      { status: 500 }
    );
  }
}
