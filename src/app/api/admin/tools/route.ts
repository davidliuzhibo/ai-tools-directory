import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin';
import { randomUUID } from 'crypto';

// 获取所有工具（管理后台用）
export async function GET() {
  try {
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const tools = await prisma.tools.findMany({
      include: {
        categories: true,
        ranking_metrics: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json(
      { error: '获取工具列表失败' },
      { status: 500 }
    );
  }
}

// 创建新工具
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminPermission();
    if (!session) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const body = await request.json();

    const tool = await prisma.tools.create({
      data: {
        id: randomUUID(),
        name: body.name,
        slug: body.slug,
        description: body.description,
        fullDescription: body.fullDescription,
        websiteUrl: body.websiteUrl,
        logoUrl: body.logoUrl,
        teamOrigin: body.teamOrigin,
        pricingType: body.pricingType,
        pricingDetails: body.pricingDetails,
        rankingScore: body.rankingScore || 0,
        platformAvailability: body.platformAvailability,
        categoryId: body.categoryId,
        isPublished: body.isPublished ?? true,
        isFeatured: body.isFeatured ?? false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(tool);
  } catch (error: any) {
    console.error('创建工具失败:', error);
    return NextResponse.json(
      { error: '创建工具失败: ' + error.message },
      { status: 500 }
    );
  }
}
