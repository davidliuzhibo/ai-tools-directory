'use client';

import {
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Breadcrumb,
  Image as AntImage,
} from 'antd';
import {
  HomeOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Paragraph, Text } = Typography;

interface UseCaseContentProps {
  useCase: {
    id: string;
    title: string;
    description: string | null;
    contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
    contentUrl: string | null;
    thumbnailUrl: string | null;
    textContent: string | null;
    categories: {
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      description: string | null;
    };
  };
  relatedTools: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    pricingType: string;
    teamOrigin: string;
    categories: {
      name: string;
      icon: string | null;
    };
  }>;
}

const contentTypeConfig = {
  TEXT: { icon: <FileTextOutlined />, label: '文字教程', color: 'blue' },
  IMAGE: { icon: <PictureOutlined />, label: '图文案例', color: 'green' },
  VIDEO: { icon: <PlayCircleOutlined />, label: '视频教程', color: 'red' },
};

const teamOriginMap = {
  DOMESTIC: { label: '国内团队', color: 'red' },
  OUTBOUND: { label: '出海团队', color: 'orange' },
  OVERSEAS: { label: '海外团队', color: 'blue' },
};

const pricingTypeMap = {
  FREE: { label: '免费', color: 'green' },
  PAID: { label: '付费', color: 'gold' },
  FREEMIUM: { label: '部分免费', color: 'cyan' },
};

export default function UseCaseContent({ useCase, relatedTools }: UseCaseContentProps) {
  const config = contentTypeConfig[useCase.contentType];

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
                title: (
                  <Link href={`/category/${useCase.categories.slug}`}>
                    {useCase.categories.name}
                  </Link>
                ),
              },
              {
                title: '使用案例',
              },
              {
                title: useCase.title,
              },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Tag color={config.color} icon={config.icon} className="text-base px-3 py-1">
              {config.label}
            </Tag>
            <Tag className="text-base px-3 py-1">
              {useCase.categories.icon} {useCase.categories.name}
            </Tag>
          </div>

          <Title level={1} className="mb-4">
            {useCase.title}
          </Title>

          {useCase.description && (
            <Paragraph className="text-lg text-gray-600">
              {useCase.description}
            </Paragraph>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card>
              {/* Thumbnail */}
              {useCase.thumbnailUrl && (
                <div className="mb-6">
                  <AntImage
                    src={useCase.thumbnailUrl}
                    alt={useCase.title}
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Video */}
              {useCase.contentType === 'VIDEO' && useCase.contentUrl && (
                <div className="mb-6">
                  <video
                    src={useCase.contentUrl}
                    controls
                    className="w-full rounded-lg"
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              )}

              {/* Text Content */}
              {useCase.textContent && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: useCase.textContent }}
                />
              )}

              {/* Image Content */}
              {useCase.contentType === 'IMAGE' && useCase.contentUrl && (
                <div className="mb-6">
                  <AntImage
                    src={useCase.contentUrl}
                    alt={useCase.title}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Category Card */}
            <Card title="所属分类" className="mb-6">
              <Link href={`/category/${useCase.categories.slug}`}>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-3xl">{useCase.categories.icon}</div>
                  <div>
                    <Text strong>{useCase.categories.name}</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {useCase.categories.description}
                    </Text>
                  </div>
                </div>
              </Link>
            </Card>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <Card title="相关工具">
                <div className="space-y-4">
                  {relatedTools.map((tool) => (
                    <Link key={tool.id} href={`/tool/${tool.slug}`}>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          {tool.logoUrl ? (
                            <Image
                              src={tool.logoUrl}
                              alt={tool.name}
                              width={40}
                              height={40}
                              className="rounded-lg object-contain"
                            />
                          ) : (
                            <div className="text-xl font-bold text-gray-300">
                              {tool.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text strong className="block truncate">
                            {tool.name}
                          </Text>
                          <div className="flex gap-1 mt-1">
                            <Tag
                              color={pricingTypeMap[tool.pricingType as keyof typeof pricingTypeMap]?.color}
                            >
                              {pricingTypeMap[tool.pricingType as keyof typeof pricingTypeMap]?.label}
                            </Tag>
                            <Tag
                              color={teamOriginMap[tool.teamOrigin as keyof typeof teamOriginMap]?.color}
                            >
                              {teamOriginMap[tool.teamOrigin as keyof typeof teamOriginMap]?.label}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </section>
    </div>
  );
}
