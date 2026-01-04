import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ToolContent from './ToolContent';

// 允许访问未预生成的动态路由
export const dynamicParams = true;
// 使用动态渲染
export const dynamic = 'force-dynamic';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

async function getToolData(slug: string) {
  const tool = await prisma.tools.findUnique({
    where: { slug },
    include: {
      categories: true,
      ranking_metrics: true,
    },
  });

  return tool;
}

export async function generateMetadata({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolData(slug);

  if (!tool) {
    return {
      title: '工具未找到',
    };
  }

  return {
    title: `${tool.name} - ${tool.categories.name}类AI工具`,
    description: tool.description || `${tool.name} - 发现并使用最好的AI工具`,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolData(slug);

  if (!tool) {
    notFound();
  }

  return <ToolContent tool={tool} />;
}

  export async function generateStaticParams() {
    // 在 Docker 构建时跳过静态生成，改为动态渲染
    if (process.env.SKIP_STATIC_GENERATION === 'true' || !process.env.DATABASE_URL?.includes('mysql://')) {
      return [];
    }

    const tools = await prisma.tools.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });

    return tools.map((tool) => ({
      slug: tool.slug,
    }));
  }
