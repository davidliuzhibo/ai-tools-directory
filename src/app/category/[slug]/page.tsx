import { notFound } from 'next/navigation';
import { Typography, Row, Col, Breadcrumb, Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ToolCard from '@/components/tool/ToolCard';

const { Title, Paragraph } = Typography;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined /> 首页
                  </Link>
                ),
              },
              {
                title: '分类',
              },
              {
                title: category.name,
              },
            ]}
          />
        </div>
      </div>

      {/* Category Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{category.icon}</div>
            <div>
              <Title level={1} className="text-white m-0">
                {category.name}类AI工具
              </Title>
              <Paragraph className="text-blue-100 text-lg mb-0">
                共 {category.tools.length} 个工具
              </Paragraph>
            </div>
          </div>
          {category.description && (
            <Paragraph className="text-blue-50 text-lg max-w-3xl">
              {category.description}
            </Paragraph>
          )}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {category.tools.length > 0 ? (
          <Row gutter={[24, 24]}>
            {category.tools.map((tool) => (
              <Col key={tool.id} xs={24} sm={12} lg={6}>
                <ToolCard
                  id={tool.id}
                  name={tool.name}
                  slug={tool.slug}
                  description={tool.description}
                  logoUrl={tool.logoUrl}
                  websiteUrl={tool.websiteUrl}
                  teamOrigin={tool.teamOrigin}
                  pricingType={tool.pricingType}
                  rankingScore={tool.rankingScore}
                  platformAvailability={
                    tool.platformAvailability
                      ? (tool.platformAvailability as any)
                      : undefined
                  }
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="暂无工具"
            className="my-16"
          />
        )}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}
