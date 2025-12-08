'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Input, Row, Col, Breadcrumb, Empty, Spin, Select } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import ToolCard from '@/components/tool/ToolCard';

const { Title, Paragraph } = Typography;
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTools([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(category !== 'all' && { category }),
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
