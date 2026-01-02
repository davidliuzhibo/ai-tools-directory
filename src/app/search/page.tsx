import { Suspense } from 'react';
import { Spin } from 'antd';
import SearchContent from './SearchContent';

export const metadata = {
  title: '搜索 - AI工具大全',
  description: '搜索并发现最好的 AI 工具',
};

function SearchFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
