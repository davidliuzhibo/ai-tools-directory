import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CategoryContent from './CategoryContent';

// 强制动态渲染，不进行静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const category = await prisma.categories.findUnique({
    where: { slug },
    include: {
      tools: {
        where: { isPublished: true },
        orderBy: { rankingScore: 'desc' },
      },
    },
  });

  return category;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    return {
      title: '分类未找到',
    };
  }

  return {
    title: `${category.name}类AI工具 - AI工具大全`,
    description: category.description || `发现最好的${category.name}类AI工具`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  return <CategoryContent category={category} />;
}
