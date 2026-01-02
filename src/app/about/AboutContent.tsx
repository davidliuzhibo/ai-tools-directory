'use client';

import { Typography, Card, Row, Col, Divider, Breadcrumb } from 'antd';
import { HomeOutlined, StarOutlined, GithubOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined /> 首页
                  </Link>
                ),
              },
              {
                title: '排名标准',
              },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Title level={1} className="text-white">
            排名标准
          </Title>
          <Paragraph className="text-blue-50 text-lg">
            透明、公正的 AI 工具评分体系
          </Paragraph>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <Card className="mb-6">
          <Title level={2}>
            <StarOutlined className="mr-2" />
            关于我们的排名系统
          </Title>
          <Paragraph className="text-lg">
            AI工具大全采用多维度综合评分系统，基于客观数据和算法为每个 AI 工具计算排名分数（0-100分）。
            我们的目标是帮助用户快速找到最优质、最受欢迎的 AI 工具。
          </Paragraph>
        </Card>

        <Divider />

        {/* Ranking Factors */}
        <Title level={2} className="mb-6">评分维度</Title>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={12}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <GithubOutlined className="text-3xl text-gray-700" />
                <Title level={4} className="m-0">GitHub Stars</Title>
              </div>
              <Paragraph>
                开源项目的 GitHub Stars 数量反映了开发者社区的认可度。
                更多的 Stars 通常意味着更活跃的社区和更好的代码质量。
              </Paragraph>
              <Text type="secondary">权重: 60%</Text>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <TrophyOutlined className="text-3xl text-orange-500" />
                <Title level={4} className="m-0">Product Hunt 投票</Title>
              </div>
              <Paragraph>
                Product Hunt 是全球知名的产品发现平台，投票数体现了产品在科技圈的热度和用户认可度。
              </Paragraph>
              <Text type="secondary">权重: 40%</Text>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <StarOutlined className="text-3xl text-yellow-500" />
                <Title level={4} className="m-0">App Store 评分</Title>
              </div>
              <Paragraph>
                对于提供移动端应用的工具，我们也会参考 App Store 的用户评分和评价数量。
              </Paragraph>
              <Text type="secondary">参考指标</Text>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <RiseOutlined className="text-3xl text-green-500" />
                <Title level={4} className="m-0">月活跃用户</Title>
              </div>
              <Paragraph>
                估算的月活跃用户数（MAU）反映了工具的实际使用情况和用户粘性。
              </Paragraph>
              <Text type="secondary">参考指标</Text>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Algorithm */}
        <Card className="mb-6">
          <Title level={2}>排名算法</Title>
          <Paragraph className="text-lg mb-4">
            我们使用对数标准化算法来计算综合评分：
          </Paragraph>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <code className="text-sm">
              分数 = log₁₀(GitHub Stars + 1) × 10 × 0.6 + log₁₀(PH 投票 + 1) × 10 × 0.4
            </code>
          </div>

          <Paragraph>
            <strong>为什么使用对数标准化？</strong>
          </Paragraph>
          <ul>
            <li>避免头部工具与尾部工具的分数差距过大</li>
            <li>让中小型优质工具也有机会获得合理评分</li>
            <li>更符合用户价值感知的非线性特征</li>
          </ul>

          <Paragraph className="mt-4">
            最终分数限制在 0-100 分区间内，方便用户理解和对比。
          </Paragraph>
        </Card>

        <Divider />

        {/* Update Frequency */}
        <Card className="mb-6">
          <Title level={2}>数据更新</Title>
          <Paragraph className="text-lg">
            我们的爬虫系统每周自动采集最新数据，确保排名的时效性和准确性。
            用户也可以通过邮件向我们提交新工具或更新信息。
          </Paragraph>
        </Card>

        <Divider />

        {/* Transparency */}
        <Card>
          <Title level={2}>透明承诺</Title>
          <Paragraph className="text-lg">
            我们承诺：
          </Paragraph>
          <ul className="text-base">
            <li>不接受付费排名</li>
            <li>不人工干预算法结果</li>
            <li>所有评分数据来源公开透明</li>
            <li>定期公开排名算法细节</li>
            <li>欢迎社区监督和反馈</li>
          </ul>
        </Card>

        {/* Contact */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <Title level={3}>联系我们</Title>
          <Paragraph>
            如果您对排名系统有任何疑问或建议，欢迎通过以下方式联系我们：
          </Paragraph>
          <Paragraph>
            <Text strong>邮箱:</Text> contact@example.com
          </Paragraph>
        </Card>
      </section>
    </div>
  );
}
