import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ToolContent from './ToolContent';

// 强制动态渲染，不进行静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

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
