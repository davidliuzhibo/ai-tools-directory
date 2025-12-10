'use client';

import { Typography, Row, Col, Breadcrumb, Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import ToolCard from '@/components/tool/ToolCard';

const { Title, Paragraph } = Typography;

interface CategoryContentProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    tools: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      logoUrl: string | null;
      websiteUrl: string | null;
      teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
      pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
      rankingScore: number;
      platformAvailability: any;
    }>;
  };
}

export default function CategoryContent({ category }: CategoryContentProps) {
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
                  platformAvailability={tool.platformAvailability}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无工具" className="my-16" />
        )}
      </section>
    </div>
  );
}
