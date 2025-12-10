import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ToolContent from './ToolContent';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

async function getToolData(slug: string) {
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      rankingMetrics: true,
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
    title: `${tool.name} - ${tool.category.name}类AI工具`,
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
  const tools = await prisma.tool.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });

  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}
