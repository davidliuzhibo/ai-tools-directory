'use client';

import { useState } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  AppstoreOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">仪表盘</Link>,
    },
    {
      key: '/admin/tools',
      icon: <ToolOutlined />,
      label: <Link href="/admin/tools">工具管理</Link>,
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/categories">分类管理</Link>,
    },
    {
      key: '/admin/use-cases',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/use-cases">使用案例</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">用户管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="p-4">
          <Title
            level={4}
            className="text-white text-center"
            style={{ color: 'white', margin: 0 }}
          >
            {collapsed ? 'AI' : 'AI工具管理'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div className="flex justify-between items-center px-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div>
              <Link href="/">
                <Button type="link">返回前台</Button>
              </Link>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
