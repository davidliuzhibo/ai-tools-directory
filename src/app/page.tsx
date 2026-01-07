import { Typography, Row, Col, Divider } from "antd";
import CategoryCard from "@/components/common/CategoryCard";
import ToolCard from "@/components/tool/ToolCard";
import prisma from "@/lib/prisma";

const { Title, Paragraph } = Typography;

// 强制动态渲染，不进行静态生成
export const dynamic = 'force-dynamic';

// 从数据库获取分类及工具数量
async function getCategoriesWithCount() {
  const categories = await prisma.categories.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { tools: { where: { isPublished: true } } }
      }
    }
  });

  return categories.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    icon: cat.icon || '📁',
    toolCount: cat._count.tools
  }));
}

// 获取精选工具（如果没有设置 featured，则按评分取前4个）
async function getFeaturedTools() {
  // 先尝试获取精选工具
  let tools = await prisma.tools.findMany({
    where: {
      isPublished: true,
      isFeatured: true
    },
    orderBy: { rankingScore: 'desc' },
    take: 4,
  });

  // 如果没有精选工具，则按评分获取前4个
  if (tools.length === 0) {
    tools = await prisma.tools.findMany({
      where: { isPublished: true },
      orderBy: { rankingScore: 'desc' },
      take: 4,
    });
  }

  // 转换数据类型以匹配 ToolCard props
  return tools.map(tool => ({
    ...tool,
    platformAvailability: tool.platformAvailability as any
  }));
}

export default async function Home() {
  const categories = await getCategoriesWithCount();
  const featuredTools = await getFeaturedTools();
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
