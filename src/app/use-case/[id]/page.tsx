import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UseCaseContent from './UseCaseContent';

export default async function UseCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useCase = await prisma.use_cases.findUnique({
    where: { id },
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
    },
  });

  if (!useCase) {
    notFound();
  }

  // 获取关联工具
  let relatedTools: any[] = [];
  if (useCase.relatedToolIds) {
    const toolIds = useCase.relatedToolIds as string[];
    relatedTools = await prisma.tools.findMany({
      where: {
        id: {
          in: toolIds,
        },
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        description: true,
        pricingType: true,
        teamOrigin: true,
        categories: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });
  }

  return <UseCaseContent useCase={useCase} relatedTools={relatedTools} />;
}
