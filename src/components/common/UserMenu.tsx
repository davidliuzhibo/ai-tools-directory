'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Dropdown, Avatar, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      signOut({ callbackUrl: '/' });
    } else if (key === 'favorites') {
      router.push('/favorites');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
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
