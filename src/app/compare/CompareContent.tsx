'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Tag,
  Breadcrumb,
  Alert,
  Spin,
  Button,
  Tooltip,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text, Paragraph } = Typography;

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fullDescription: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
  pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
  pricingDetails: string | null;
  platformAvailability: any;
  rankingScore: number;
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  ranking_metrics: {
    githubStars: number;
    githubUrl: string | null;
    productHuntVotes: number;
    appStoreRating: number;
    monthlyActiveUsers: number;
  } | null;
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

export default function CompareContent({ ids }: { ids: string }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTools() {
      try {
        const response = await fetch(`/api/compare?ids=${ids}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch tools');
        }
        const data = await response.json();
        setTools(data.tools);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTools();
  }, [ids]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="加载对比数据..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
          />
        </div>
      </div>
    );
  }

  const renderCheckIcon = (value: boolean) => {
    return value ? (
      <CheckCircleOutlined className="text-green-500 text-xl" />
    ) : (
      <CloseCircleOutlined className="text-gray-300 text-xl" />
    );
  };

  const comparisonData = [
    {
      key: 'logo',
      feature: 'Logo',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          tool.logoUrl ? (
            <div className="flex justify-center">
              <Image
                src={tool.logoUrl}
                alt={tool.name}
                width={60}
                height={60}
                className="rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="text-3xl text-center">{tool.name[0]}</div>
          ),
        ])
      ),
    },
    {
      key: 'name',
      feature: '工具名称',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Link href={`/tool/${tool.slug}`} className="font-bold text-lg">
            {tool.name}
          </Link>,
        ])
      ),
    },
    {
      key: 'description',
      feature: '简介',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Text className="text-sm">{tool.description || '-'}</Text>,
        ])
      ),
    },
    {
      key: 'category',
      feature: '分类',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Tag>
            {tool.categories.icon} {tool.categories.name}
          </Tag>,
        ])
      ),
    },
    {
      key: 'pricing',
      feature: '价格类型',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Tag color={pricingTypeMap[tool.pricingType].color}>
            {pricingTypeMap[tool.pricingType].label}
          </Tag>,
        ])
      ),
    },
    {
      key: 'pricingDetails',
      feature: '定价详情',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Text className="text-sm">{tool.pricingDetails || '-'}</Text>,
        ])
      ),
    },
    {
      key: 'teamOrigin',
      feature: '团队来源',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Tag color={teamOriginMap[tool.teamOrigin].color}>
            {teamOriginMap[tool.teamOrigin].label}
          </Tag>,
        ])
      ),
    },
    {
      key: 'rankingScore',
      feature: '综合评分',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <Text strong className="text-lg text-blue-600">
            {tool.rankingScore.toFixed(1)}/100
          </Text>,
        ])
      ),
    },
    {
      key: 'pc',
      feature: '💻 PC端',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          renderCheckIcon(tool.platformAvailability?.pc),
        ])
      ),
    },
    {
      key: 'ios',
      feature: '🍎 iOS',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          renderCheckIcon(tool.platformAvailability?.ios),
        ])
      ),
    },
    {
      key: 'android',
      feature: '🤖 Android',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          renderCheckIcon(tool.platformAvailability?.android),
        ])
      ),
    },
    {
      key: 'web',
      feature: '🌐 Web',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          renderCheckIcon(tool.platformAvailability?.web),
        ])
      ),
    },
    {
      key: 'githubStars',
      feature: 'GitHub Stars',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          tool.ranking_metrics?.githubStars ? (
            <Text>{tool.ranking_metrics.githubStars.toLocaleString()}</Text>
          ) : (
            '-'
          ),
        ])
      ),
    },
    {
      key: 'productHuntVotes',
      feature: 'Product Hunt 投票',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          tool.ranking_metrics?.productHuntVotes ? (
            <Text>{tool.ranking_metrics.productHuntVotes.toLocaleString()}</Text>
          ) : (
            '-'
          ),
        ])
      ),
    },
    {
      key: 'appStoreRating',
      feature: 'App Store 评分',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          tool.ranking_metrics?.appStoreRating ? (
            <Text>{tool.ranking_metrics.appStoreRating}/5.0</Text>
          ) : (
            '-'
          ),
        ])
      ),
    },
    {
      key: 'links',
      feature: '链接',
      ...Object.fromEntries(
        tools.map((tool) => [
          tool.id,
          <div className="flex flex-col gap-2">
            {tool.websiteUrl && (
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Button type="primary" size="small" icon={<LinkOutlined />}>
                  官网
                </Button>
              </a>
            )}
            {tool.ranking_metrics?.githubUrl && (
              <a
                href={tool.ranking_metrics.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="small" icon={<GithubOutlined />}>
                  GitHub
                </Button>
              </a>
            )}
          </div>,
        ])
      ),
    },
  ];

  const columns = [
    {
      title: '对比项',
      dataIndex: 'feature',
      key: 'feature',
      width: 150,
      fixed: 'left' as const,
      className: 'font-semibold bg-gray-50',
    },
    ...tools.map((tool) => ({
      title: tool.name,
      dataIndex: tool.id,
      key: tool.id,
      width: 200,
      className: 'text-center',
    })),
  ];

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
                title: '工具对比',
              },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={2}>工具对比</Title>
          <Paragraph type="secondary">
            对比 {tools.length} 个工具的详细信息，帮助您做出更好的选择
          </Paragraph>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <Table
            columns={columns}
            dataSource={comparisonData}
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </section>
    </div>
  );
}
