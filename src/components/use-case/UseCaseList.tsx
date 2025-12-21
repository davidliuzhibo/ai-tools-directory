'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Alert } from 'antd';
import UseCaseCard from './UseCaseCard';

interface UseCaseListProps {
  categoryId?: string;
  toolId?: string;
  limit?: number;
}

interface UseCase {
  id: string;
  title: string;
  description: string | null;
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
  thumbnailUrl: string | null;
  categories: {
    name: string;
    slug: string;
    icon: string | null;
  };
}

export default function UseCaseList({ categoryId, toolId, limit = 6 }: UseCaseListProps) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUseCases() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (toolId) params.append('toolId', toolId);
        params.append('limit', limit.toString());

        const response = await fetch(`/api/use-cases?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch use cases');
        }

        const data = await response.json();
        setUseCases(data.useCases);
      } catch (err) {
        console.error('Error fetching use cases:', err);
        setError('加载使用案例失败');
      } finally {
        setLoading(false);
      }
    }

    fetchUseCases();
  }, [categoryId, toolId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="错误"
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  if (useCases.length === 0) {
    return (
      <Empty
        description="暂无使用案例"
        className="py-12"
      />
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {useCases.map((useCase) => (
        <Col key={useCase.id} xs={24} sm={12} lg={8}>
          <UseCaseCard useCase={useCase} />
        </Col>
      ))}
    </Row>
  );
}
