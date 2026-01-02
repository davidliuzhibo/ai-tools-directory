import { Suspense } from 'react';
import { Card, Spin } from 'antd';
import SignInContent from './SignInContent';

export const metadata = {
  title: '登录 - AI工具大全',
  description: '登录到 AI工具大全',
};

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
