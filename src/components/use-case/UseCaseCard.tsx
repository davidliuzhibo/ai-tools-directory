'use client';

import { Card, Typography, Tag, Image as AntImage } from 'antd';
import {
  PlayCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

interface UseCaseCardProps {
  useCase: {
    id: string;
    title: string;
    description: string | null;
    contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
    thumbnailUrl: string | null;
    categories: {
      name: string;
      slug: string;
      icon: string | null;
    };
  };
}

const contentTypeConfig = {
  TEXT: { icon: <FileTextOutlined />, label: '文字教程', color: 'blue' },
  IMAGE: { icon: <PictureOutlined />, label: '图文案例', color: 'green' },
  VIDEO: { icon: <PlayCircleOutlined />, label: '视频教程', color: 'red' },
};

export default function UseCaseCard({ useCase }: UseCaseCardProps) {
  const config = contentTypeConfig[useCase.contentType];

  return (
    <Link href={`/use-case/${useCase.id}`}>
      <Card
        hoverable
        cover={
          useCase.thumbnailUrl ? (
            <div className="h-48 overflow-hidden bg-gray-100">
              <AntImage
                alt={useCase.title}
                src={useCase.thumbnailUrl}
                preview={false}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
              <div className="text-6xl text-gray-300">{config.icon}</div>
            </div>
          )
        }
        className="h-full"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
            <Tag>{useCase.categories.icon} {useCase.categories.name}</Tag>
          </div>

          <Title level={5} className="m-0 line-clamp-2">
            {useCase.title}
          </Title>

          {useCase.description && (
            <Paragraph
              type="secondary"
              className="m-0 line-clamp-2 text-sm"
              ellipsis={{ rows: 2 }}
            >
              {useCase.description}
            </Paragraph>
          )}
        </div>
      </Card>
    </Link>
  );
}
