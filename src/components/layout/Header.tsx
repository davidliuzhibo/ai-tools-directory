'use client';

import Link from 'next/link';
import { Layout, Menu, Input, Button } from 'antd';
import { SearchOutlined, HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import UserMenu from '@/components/common/UserMenu';

const { Header: AntHeader } = Layout;
const { Search } = Input;

export default function Header() {
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link href="/">首页</Link>,
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: '分类',
      children: [
        { key: 'language', label: <Link href="/category/language">语言</Link> },
        { key: 'image', label: <Link href="/category/image">画图</Link> },
        { key: 'code', label: <Link href="/category/code">编程</Link> },
        { key: 'video', label: <Link href="/category/video">视频</Link> },
        { key: 'note', label: <Link href="/category/note">笔记</Link> },
        { key: 'assistant', label: <Link href="/category/assistant">个人助理</Link> },
      ],
    },
    {
      key: 'about',
      label: <Link href="/about">排名标准</Link>,
    },
  ];

  const handleSearch = (value: string) => {
    if (value.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(value)}`;
    }
  };

  return (
    <AntHeader className="bg-white shadow-sm sticky top-0 z-50 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI工具大全
          </div>
        </Link>

        {/* Navigation Menu */}
        <div className="flex-1 mx-8">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="border-0 bg-transparent"
            style={{ minWidth: 0, flex: 'auto' }}
          />
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <Search
            placeholder="搜索AI工具..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
          />

          <Link href="/admin">
            <Button type="text">管理后台</Button>
          </Link>

          <UserMenu />
        </div>
      </div>
    </AntHeader>
  );
}
