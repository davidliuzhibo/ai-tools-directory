'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  message,
  Avatar,
  Badge,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  _count?: {
    favorites: number;
    comments: number;
  };
  admin?: {
    role: string;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '头像',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar src={record.image} icon={<UserOutlined />} size="large" />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      key: 'role',
      width: 100,
      render: (_, record) => {
        if (record.admin) {
          const colorMap: any = {
            ADMIN: 'red',
            EDITOR: 'orange',
          };
          return (
            <Tag color={colorMap[record.admin.role]}>
              {record.admin.role}
            </Tag>
          );
        }
        return <Tag>用户</Tag>;
      },
    },
    {
      title: '收藏数',
      key: 'favoritesCount',
      width: 100,
      render: (_, record) => (
        <Badge count={record._count?.favorites || 0} showZero />
      ),
    },
    {
      title: '评论数',
      key: 'commentsCount',
      width: 100,
      render: (_, record) => (
        <Badge count={record._count?.comments || 0} showZero />
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>用户管理</Title>
        <div className="text-gray-500">
          总用户数: {users.length}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
