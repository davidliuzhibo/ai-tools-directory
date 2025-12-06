import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Title level={1} className="text-center mb-8">
          AI工具大全
        </Title>
        <Paragraph className="text-center text-lg text-gray-600">
          发现和使用最好的AI工具
        </Paragraph>

        <div className="mt-12 text-center">
          <Paragraph>
            网站正在开发中...
          </Paragraph>
        </div>
      </div>
    </main>
  );
}
