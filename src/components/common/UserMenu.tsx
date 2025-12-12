'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button, Dropdown, Avatar, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button type="text" loading>
        加载中...
      </Button>
    );
  }

  if (!session) {
    return (
      <Space>
        <Link href="/auth/signin">
          <Button type="default">登录</Button>
        </Link>
        <Link href="/auth/signup">
          <Button type="primary">注册</Button>
        </Link>
      </Space>
    );
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">个人资料</Link>,
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: <Link href="/favorites">我的收藏</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">设置</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        signOut({ callbackUrl: '/' });
      },
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
      <Space className="cursor-pointer hover:opacity-80 transition-opacity">
        <Avatar
          src={session.user.image}
          icon={<UserOutlined />}
          size="default"
        />
        <span className="hidden md:inline">{session.user.name}</span>
      </Space>
    </Dropdown>
  );
}
