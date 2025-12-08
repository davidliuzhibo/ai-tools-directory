import { notFound } from 'next/navigation';
import { Typography, Tag, Button, Card, Row, Col, Breadcrumb, Divider, Tooltip } from 'antd';
import {
  HomeOutlined,
  LinkOutlined,
  StarOutlined,
  GithubOutlined,
  AppleOutlined,
  WindowsOutlined,
  AndroidOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

const { Title, Paragraph, Text } = Typography;

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

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolData(slug);

  if (!tool) {
    notFound();
  }

  const platformAvailability = tool.platformAvailability as any;

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
                title: <Link href={`/category/${tool.category.slug}`}>{tool.category.name}</Link>,
              },
              {
                title: tool.name,
              },
            ]}
          />
        </div>
      </div>

      {/* Tool Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
              {tool.logoUrl ? (
                <Image
                  src={tool.logoUrl}
                  alt={tool.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
              ) : (
                <div className="text-4xl font-bold text-gray-300">{tool.name[0]}</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <Title level={1} className="m-0 mb-2">
                {tool.name}
              </Title>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Tag color={tool.category.icon}>{tool.category.icon} {tool.category.name}</Tag>
                <Tag color={teamOriginMap[tool.teamOrigin].color}>
                  {teamOriginMap[tool.teamOrigin].label}
                </Tag>
                <Tag color={pricingTypeMap[tool.pricingType].color}>
                  {pricingTypeMap[tool.pricingType].label}
                </Tag>
                <Tag icon={<StarOutlined />} color="gold">
                  评分: {tool.rankingScore.toFixed(1)}/100
                </Tag>
              </div>

              {/* Description */}
              {tool.description && (
                <Paragraph className="text-lg text-gray-600 mb-4">
                  {tool.description}
                </Paragraph>
              )}

              {/* Platform Icons */}
              {platformAvailability && (
                <div className="flex items-center gap-3 mb-4">
                  <Text type="secondary">支持平台:</Text>
                  {platformAvailability.pc && (
                    <Tooltip title="PC端">
                      <WindowsOutlined className="text-xl text-gray-600" />
                    </Tooltip>
                  )}
                  {platformAvailability.ios && (
                    <Tooltip title="iOS">
                      <AppleOutlined className="text-xl text-gray-600" />
                    </Tooltip>
                  )}
                  {platformAvailability.android && (
                    <Tooltip title="Android">
                      <AndroidOutlined className="text-xl text-gray-600" />
                    </Tooltip>
                  )}
                  {platformAvailability.web && (
                    <Tooltip title="Web网页">
                      <GlobalOutlined className="text-xl text-gray-600" />
                    </Tooltip>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {tool.websiteUrl && (
                  <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="primary" size="large" icon={<LinkOutlined />}>
                      访问官网
                    </Button>
                  </a>
                )}
                {tool.rankingMetrics?.githubUrl && (
                  <a
                    href={tool.rankingMetrics.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="large" icon={<GithubOutlined />}>
                      GitHub ({tool.rankingMetrics.githubStars.toLocaleString()} stars)
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Details */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="详细介绍">
              {tool.fullDescription ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: tool.fullDescription }}
                />
              ) : (
                <Paragraph type="secondary">
                  {tool.description || '暂无详细介绍'}
                </Paragraph>
              )}
            </Card>

            {tool.pricingDetails && (
              <Card title="定价信息" className="mt-6">
                <Paragraph>{tool.pricingDetails}</Paragraph>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            {/* Metrics */}
            {tool.rankingMetrics && (
              <Card title="数据指标" className="mb-6">
                <div className="space-y-3">
                  {tool.rankingMetrics.githubStars > 0 && (
                    <div className="flex justify-between">
                      <Text type="secondary">GitHub Stars:</Text>
                      <Text strong>{tool.rankingMetrics.githubStars.toLocaleString()}</Text>
                    </div>
                  )}
                  {tool.rankingMetrics.productHuntVotes > 0 && (
                    <div className="flex justify-between">
                      <Text type="secondary">Product Hunt 投票:</Text>
                      <Text strong>{tool.rankingMetrics.productHuntVotes.toLocaleString()}</Text>
                    </div>
                  )}
                  {tool.rankingMetrics.appStoreRating > 0 && (
                    <div className="flex justify-between">
                      <Text type="secondary">App Store 评分:</Text>
                      <Text strong>{tool.rankingMetrics.appStoreRating}/5.0</Text>
                    </div>
                  )}
                  <Divider className="my-3" />
                  <div className="flex justify-between">
                    <Text type="secondary">综合评分:</Text>
                    <Text strong className="text-lg text-blue-600">
                      {tool.rankingScore.toFixed(1)}/100
                    </Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Category */}
            <Card title="所属分类">
              <Link href={`/category/${tool.category.slug}`}>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-3xl">{tool.category.icon}</div>
                  <div>
                    <Text strong>{tool.category.name}</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {tool.category.description}
                    </Text>
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
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
