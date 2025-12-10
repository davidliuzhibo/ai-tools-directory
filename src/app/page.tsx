'use client';

import { Typography, Row, Col, Divider } from "antd";
import CategoryCard from "@/components/common/CategoryCard";
import ToolCard from "@/components/tool/ToolCard";

const { Title, Paragraph } = Typography;

// 临时数据（后续会从数据库读取）
const categories = [
  { name: "语言", slug: "language", description: "ChatGPT等AI语言类工具", icon: "💬", toolCount: 15 },
  { name: "画图", slug: "image", description: "Midjourney等AI画图工具", icon: "🎨", toolCount: 12 },
  { name: "编程", slug: "code", description: "GitHub Copilot等AI编程助手", icon: "💻", toolCount: 20 },
  { name: "视频", slug: "video", description: "AI视频生成和编辑工具", icon: "🎬", toolCount: 8 },
  { name: "笔记", slug: "note", description: "Notion AI等智能笔记工具", icon: "📝", toolCount: 10 },
  { name: "个人助理", slug: "assistant", description: "多模态AI助手", icon: "🤖", toolCount: 18 },
];

const featuredTools = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    description: "OpenAI开发的强大对话AI，支持多种任务",
    logoUrl: null,
    websiteUrl: "https://chat.openai.com",
    teamOrigin: "OVERSEAS" as const,
    pricingType: "FREEMIUM" as const,
    rankingScore: 95,
    platformAvailability: { pc: true, ios: true, android: true, web: true },
  },
  {
    id: "2",
    name: "Midjourney",
    slug: "midjourney",
    description: "领先的AI图像生成工具",
    logoUrl: null,
    websiteUrl: "https://midjourney.com",
    teamOrigin: "OVERSEAS" as const,
    pricingType: "PAID" as const,
    rankingScore: 92,
    platformAvailability: { web: true },
  },
  {
    id: "3",
    name: "GitHub Copilot",
    slug: "github-copilot",
    description: "AI编程助手，提高开发效率",
    logoUrl: null,
    websiteUrl: "https://github.com/features/copilot",
    teamOrigin: "OVERSEAS" as const,
    pricingType: "PAID" as const,
    rankingScore: 90,
    platformAvailability: { pc: true, web: true },
  },
  {
    id: "4",
    name: "文心一言",
    slug: "wenxin",
    description: "百度开发的中文大语言模型",
    logoUrl: null,
    websiteUrl: "https://yiyan.baidu.com",
    teamOrigin: "DOMESTIC" as const,
    pricingType: "FREE" as const,
    rankingScore: 85,
    platformAvailability: { pc: true, web: true },
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Title level={1} className="text-5xl mb-6">
            发现最好的AI工具
          </Title>
          <Paragraph className="text-xl text-gray-600 mb-8">
            汇集全球优秀AI工具，提供分类展示、智能排名、使用案例
          </Paragraph>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <Title level={2} className="text-center mb-8">
          热门分类
        </Title>
        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col key={category.slug} xs={24} sm={12} md={8} lg={6}>
              <CategoryCard
                name={category.name}
                slug={category.slug}
                description={category.description}
                icon={category.icon}
                toolCount={category.toolCount}
              />
            </Col>
          ))}
        </Row>
      </section>

      <Divider />

      {/* Featured Tools Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Title level={2} className="text-center mb-8">
          精选工具
        </Title>
        <Row gutter={[24, 24]}>
          {featuredTools.map((tool) => (
            <Col key={tool.id} xs={24} sm={12} lg={6}>
              <ToolCard {...tool} />
            </Col>
          ))}
        </Row>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Row gutter={[24, 24]} className="text-center">
            <Col xs={24} md={8}>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">AI工具</div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">工具分类</div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-4xl font-bold mb-2">每周</div>
              <div className="text-blue-100">自动更新</div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}
