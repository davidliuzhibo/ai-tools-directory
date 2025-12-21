'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Drawer, List, message, Empty, Typography } from 'antd';
import { SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface Tool {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

const STORAGE_KEY = 'compare_tools';
const MAX_COMPARE = 4;

export default function CompareButton() {
  const router = useRouter();
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    // 从 localStorage 读取对比列表
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse compare list:', e);
      }
    }
  }, []);

  const updateStorage = (list: Tool[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setCompareList(list);
  };

  const removeTool = (id: string) => {
    const newList = compareList.filter((tool) => tool.id !== id);
    updateStorage(newList);
  };

  const clearAll = () => {
    updateStorage([]);
    message.success('已清空对比列表');
  };

  const startCompare = () => {
    if (compareList.length < 2) {
      message.warning('至少选择2个工具进行对比');
      return;
    }
    const ids = compareList.map((t) => t.id).join(',');
    router.push(`/compare?ids=${ids}`);
  };

  if (compareList.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={compareList.length} offset={[-5, 5]}>
          <Button
            type="primary"
            size="large"
            icon={<SwapOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="shadow-lg"
          >
            对比工具
          </Button>
        </Badge>
      </div>

      <Drawer
        title={`对比列表 (${compareList.length}/${MAX_COMPARE})`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        extra={
          compareList.length > 0 && (
            <Button size="small" onClick={clearAll}>
              清空
            </Button>
          )
        }
        footer={
          <div className="flex gap-2">
            <Button block onClick={() => setDrawerVisible(false)}>
              关闭
            </Button>
            <Button
              type="primary"
              block
              onClick={startCompare}
              disabled={compareList.length < 2}
            >
              开始对比 ({compareList.length})
            </Button>
          </div>
        }
      >
        {compareList.length === 0 ? (
          <Empty description="还没有添加对比工具" />
        ) : (
          <List
            dataSource={compareList}
            renderItem={(tool) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeTool(tool.id)}
                  >
                    移除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    tool.logoUrl ? (
                      <Image
                        src={tool.logoUrl}
                        alt={tool.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Text>{tool.name[0]}</Text>
                      </div>
                    )
                  }
                  title={
                    <Link href={`/tool/${tool.slug}`} onClick={() => setDrawerVisible(false)}>
                      {tool.name}
                    </Link>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
}

// 导出添加到对比列表的函数
export function addToCompare(tool: Tool) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let compareList: Tool[] = [];

  if (stored) {
    try {
      compareList = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse compare list:', e);
    }
  }

  // 检查是否已存在
  if (compareList.find((t) => t.id === tool.id)) {
    message.info('该工具已在对比列表中');
    return false;
  }

  // 检查数量限制
  if (compareList.length >= MAX_COMPARE) {
    message.warning(`最多只能对比 ${MAX_COMPARE} 个工具`);
    return false;
  }

  compareList.push(tool);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
  message.success('已加入对比列表');

  // 触发自定义事件通知更新
  window.dispatchEvent(new Event('storage'));

  return true;
}

// 检查工具是否在对比列表中
export function isInCompareList(toolId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  try {
    const compareList: Tool[] = JSON.parse(stored);
    return compareList.some((t) => t.id === toolId);
  } catch (e) {
    return false;
  }
}
