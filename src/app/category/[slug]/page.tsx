import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CategoryContent from './CategoryContent';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
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

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}
