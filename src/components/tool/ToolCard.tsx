'use client';

import { Card, Tag, Button, Tooltip } from 'antd';
import { StarOutlined, LinkOutlined, AppleOutlined, WindowsOutlined, AndroidOutlined, GlobalOutlined, SwapOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { addToCompare } from './CompareButton';

interface ToolCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
  pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
  rankingScore: number;
  platformAvailability?: {
    pc?: boolean;
    ios?: boolean;
    android?: boolean;
    web?: boolean;
  };
}

const teamOriginMap = {
  DOMESTIC: { label: '国内团队', color: 'red' },
  OUTBOUND: { label: '出海团队', color: 'orange' },
  OVERSEAS: { label: '海外团队', color: 'blue' },
};

const pricingTypeMap = {
  FREE: { label: '免费', color: 'green' },
  PAID: { label: '付费', color: 'gold' },
  FREEMIUM: { label: '部分免费', color: 'cyan' },
};

export default function ToolCard({
  id,
  name,
  slug,
  description,
  logoUrl,
  websiteUrl,
  teamOrigin,
  pricingType,
  rankingScore,
  platformAvailability,
}: ToolCardProps) {
  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCompare({ id, name, slug, logoUrl });
  };

  return (
    <Card
      hoverable
      className="h-full transition-shadow hover:shadow-lg"
      cover={
        <div className="relative h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <div className="text-4xl font-bold text-gray-300">{name[0]}</div>
          )}
          <div className="absolute top-2 right-2">
            <Tooltip title={`综合评分: ${rankingScore}/100`}>
              <div className="bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <StarOutlined className="text-yellow-500 mr-1" />
                {rankingScore}
              </div>
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Title */}
        <Link href={`/tool/${slug}`}>
          <h3 className="text-lg font-bold hover:text-blue-600 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 h-10">
          {description || '暂无描述'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Tag color={teamOriginMap[teamOrigin].color}>
            {teamOriginMap[teamOrigin].label}
          </Tag>
          <Tag color={pricingTypeMap[pricingType].color}>
            {pricingTypeMap[pricingType].label}
          </Tag>
        </div>

        {/* Platform Icons */}
        {platformAvailability && (
          <div className="flex items-center gap-2 text-gray-500">
            {platformAvailability.pc && (
              <Tooltip title="PC端">
                <WindowsOutlined className="text-lg" />
              </Tooltip>
            )}
            {platformAvailability.ios && (
              <Tooltip title="iOS">
                <AppleOutlined className="text-lg" />
              </Tooltip>
            )}
            {platformAvailability.android && (
              <Tooltip title="Android">
                <AndroidOutlined className="text-lg" />
              </Tooltip>
            )}
            {platformAvailability.web && (
              <Tooltip title="Web网页">
                <GlobalOutlined className="text-lg" />
              </Tooltip>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/tool/${slug}`} className="flex-1">
            <Button type="primary" block>
              查看详情
            </Button>
          </Link>
          <Tooltip title="加入对比">
            <Button icon={<SwapOutlined />} onClick={handleAddToCompare} />
          </Tooltip>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button icon={<LinkOutlined />} />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
