'use client';

import { useState, useEffect } from 'react';
import { Card, Empty, Row, Col, Typography, message, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ToolCard from '@/components/tool/ToolCard';

const { Title } = Typography;

interface Favorite {
  id: string;
  tool: any;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      message.warning('请先登录');
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        message.error('获取收藏列表失败');
      }
    } catch (error) {
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Title level={2}>我的收藏</Title>

        {favorites.length === 0 ? (
          <Card>
            <Empty
              description="暂无收藏"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {favorites.map((favorite) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={favorite.id}>
                <ToolCard tool={favorite.tool} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
