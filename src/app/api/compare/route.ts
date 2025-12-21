import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/compare?ids=id1,id2,id3 - 获取要对比的工具
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Missing tool IDs' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',').filter(id => id.trim());

    if (ids.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tools are required for comparison' },
        { status: 400 }
      );
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 tools can be compared at once' },
        { status: 400 }
      );
    }

    const tools = await prisma.tools.findMany({
      where: {
        id: {
          in: ids,
        },
        isPublished: true,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
        },
        ranking_metrics: {
          select: {
            githubStars: true,
            githubUrl: true,
            productHuntVotes: true,
            productHuntUrl: true,
            appStoreRating: true,
            monthlyActiveUsers: true,
          },
        },
      },
    });

    if (tools.length === 0) {
      return NextResponse.json(
        { error: 'No tools found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Error fetching tools for comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
