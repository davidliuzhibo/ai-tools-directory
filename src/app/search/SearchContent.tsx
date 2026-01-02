'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Input, Row, Col, Breadcrumb, Empty, Spin, Select, Card, Space, Tag } from 'antd';
import { HomeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import Link from 'next/link';
import ToolCard from '@/components/tool/ToolCard';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
  pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
  rankingScore: number;
  platformAvailability?: any;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [pricingType, setPricingType] = useState<string>('all');
  const [teamOrigin, setTeamOrigin] = useState<string>('all');
  const [platform, setPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rankingScore');

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, category, pricingType, teamOrigin, platform, sortBy]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(category !== 'all' && { category }),
        ...(pricingType !== 'all' && { pricing: pricingType }),
        ...(teamOrigin !== 'all' && { team: teamOrigin }),
        ...(platform !== 'all' && { platform }),
        sortBy,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      console.error('搜索失败:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    performSearch(value);
    // 更新 URL
    const url = new URL(window.location.href);
    url.searchParams.set('q', value);
    window.history.pushState({}, '', url.toString());
  };

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
                title: '搜索',
              },
            ]}
          />
        </div>
      </div>

      {/* Search Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={2} className="mb-6">
            搜索 AI 工具
          </Title>

          <div className="max-w-2xl">
            <Search
              placeholder="搜索工具名称或描述..."
              allowClear
              enterButton="搜索"
              size="large"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />

            {query && (
              <Paragraph className="mt-4 text-gray-600">
                搜索 "<strong>{query}</strong>" 找到 {tools.length} 个结果
              </Paragraph>
            )}
          </div>

          {/* Filters */}
          <Card className="mt-6" title={<><FilterOutlined /> 筛选条件</>}>
            <Space wrap size="large">
              <div>
                <Text type="secondary" className="mr-2">分类:</Text>
                <Select
                  value={category}
                  onChange={setCategory}
                  style={{ width: 150 }}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'language', label: '💬 语言' },
                    { value: 'image', label: '🎨 画图' },
                    { value: 'code', label: '💻 编程' },
                    { value: 'video', label: '🎬 视频' },
                    { value: 'note', label: '📝 笔记' },
                    { value: 'assistant', label: '🤖 个人助理' },
                  ]}
                />
              </div>

              <div>
                <Text type="secondary" className="mr-2">价格:</Text>
                <Select
                  value={pricingType}
                  onChange={setPricingType}
                  style={{ width: 150 }}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'FREE', label: '免费' },
                    { value: 'FREEMIUM', label: '部分免费' },
                    { value: 'PAID', label: '付费' },
                  ]}
                />
              </div>

              <div>
                <Text type="secondary" className="mr-2">团队:</Text>
                <Select
                  value={teamOrigin}
                  onChange={setTeamOrigin}
                  style={{ width: 150 }}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'DOMESTIC', label: '国内团队' },
                    { value: 'OUTBOUND', label: '出海团队' },
                    { value: 'OVERSEAS', label: '海外团队' },
                  ]}
                />
              </div>

              <div>
                <Text type="secondary" className="mr-2">平台:</Text>
                <Select
                  value={platform}
                  onChange={setPlatform}
                  style={{ width: 150 }}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'pc', label: '💻 PC' },
                    { value: 'ios', label: '🍎 iOS' },
                    { value: 'android', label: '🤖 Android' },
                    { value: 'web', label: '🌐 Web' },
                  ]}
                />
              </div>

              <div>
                <Text type="secondary" className="mr-2">排序:</Text>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 150 }}
                  options={[
                    { value: 'rankingScore', label: '按评分' },
                    { value: 'name', label: '按名称' },
                    { value: 'createdAt', label: '按时间' },
                  ]}
                />
              </div>
            </Space>
          </Card>
        </div>
      </section>

      {/* Search Results */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" />
          </div>
        ) : tools.length > 0 ? (
          <Row gutter={[24, 24]}>
            {tools.map((tool) => (
              <Col key={tool.id} xs={24} sm={12} lg={6}>
                <ToolCard {...tool} />
              </Col>
            ))}
          </Row>
        ) : query ? (
          <Empty
            description={`没有找到匹配 "${query}" 的工具`}
            className="my-16"
          />
        ) : (
          <Empty
            description="请输入关键词搜索 AI 工具"
            className="my-16"
          />
        )}
      </section>
    </div>
  );
}
