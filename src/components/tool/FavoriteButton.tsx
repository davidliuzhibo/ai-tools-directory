'use client';

import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  toolId: string;
  initialFavorited?: boolean;
}

export default function FavoriteButton({
  toolId,
  initialFavorited = false,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!session) {
      message.warning('请先登录');
      router.push('/auth/signin');
      return;
    }

    setLoading(true);

    try {
      if (favorited) {
        // 取消收藏
        const response = await fetch(`/api/favorites?toolId=${toolId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFavorited(false);
          message.success('已取消收藏');
        } else {
          const error = await response.json();
          message.error(error.error || '取消收藏失败');
        }
      } else {
        // 添加收藏
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ toolId }),
        });

        if (response.ok) {
          setFavorited(true);
          message.success('收藏成功');
        } else {
          const error = await response.json();
          message.error(error.error || '收藏失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={favorited ? 'primary' : 'default'}
      icon={favorited ? <HeartFilled /> : <HeartOutlined />}
      onClick={handleToggleFavorite}
      loading={loading}
      size="large"
    >
      {favorited ? '已收藏' : '收藏'}
    </Button>
  );
}
