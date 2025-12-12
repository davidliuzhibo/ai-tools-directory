'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import {
  ToolOutlined,
  AppstoreOutlined,
  UserOutlined,
  HeartOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

interface Stats {
  toolsCount: number;
  categoriesCount: number;
  usersCount: number;
  favoritesCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    toolsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    favoritesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>仪表盘</Title>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="AI工具总数"
              value={stats.toolsCount}
              prefix={<ToolOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分类总数"
              value={stats.categoriesCount}
              prefix={<AppstoreOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.usersCount}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="收藏总数"
              value={stats.favoritesCount}
              prefix={<HeartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近动态" className="mt-6">
        <p className="text-gray-500">暂无数据</p>
      </Card>
    </div>
  );
}
