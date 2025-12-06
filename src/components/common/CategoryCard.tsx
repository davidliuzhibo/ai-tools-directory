'use client';

import { Card } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  toolCount: number;
}

export default function CategoryCard({
  name,
  slug,
  description,
  icon,
  toolCount,
}: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`}>
      <Card
        hoverable
        className="h-full transition-all hover:shadow-xl hover:-translate-y-1"
      >
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="text-5xl">
            {icon || '🤖'}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold">{name}</h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
            {description || `探索${toolCount}个${name}类AI工具`}
          </p>

          {/* Tool Count */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{toolCount} 个工具</span>
              <RightOutlined className="text-gray-400" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
