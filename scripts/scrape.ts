import { PrismaClient } from '@prisma/client';
import { GitHubScraper } from '../src/lib/scrapers/GitHubScraper';
import { ProductHuntScraper } from '../src/lib/scrapers/ProductHuntScraper';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

// 工具数据类型定义
interface ToolInput {
  name: string;
  slug: string;
  websiteUrl: string;
  description: string;
  teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
  pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
  githubUrl?: string;
  productHuntUrl?: string;
}

// 示例工具列表（GitHub 仓库）
const AI_TOOLS: Array<{
  categorySlug: string;
  tools: ToolInput[];
}> = [
  {
    categorySlug: 'language',
    tools: [
      {
        name: 'ChatGPT',
        slug: 'chatgpt',
        websiteUrl: 'https://chat.openai.com',
        description: 'OpenAI开发的强大对话AI，支持多种任务',
        teamOrigin: 'OVERSEAS' as const,
        pricingType: 'FREEMIUM' as const,
      },
    ],
  },
  {
    categorySlug: 'code',
    tools: [
      {
        name: 'GitHub Copilot',
        slug: 'github-copilot',
        websiteUrl: 'https://github.com/features/copilot',
        githubUrl: 'https://github.com/features/copilot',
        description: 'AI编程助手，提高开发效率',
        teamOrigin: 'OVERSEAS' as const,
        pricingType: 'PAID' as const,
      },
    ],
  },
  {
    categorySlug: 'image',
    tools: [
      {
        name: 'Stable Diffusion',
        slug: 'stable-diffusion',
        websiteUrl: 'https://stability.ai',
        githubUrl: 'https://github.com/Stability-AI/stablediffusion',
        description: '开源的AI图像生成模型',
        teamOrigin: 'OVERSEAS' as const,
        pricingType: 'FREE' as const,
      },
    ],
  },
];

async function scrapeAndSave() {
  console.log('开始数据采集...\n');

  const githubScraper = new GitHubScraper(process.env.GITHUB_TOKEN);
  const productHuntScraper = new ProductHuntScraper(process.env.PRODUCT_HUNT_API_KEY);

  for (const category of AI_TOOLS) {
    console.log(`\n处理分类: ${category.categorySlug}`);

    // 获取分类
    const dbCategory = await prisma.categories.findUnique({
      where: { slug: category.categorySlug },
    });

    if (!dbCategory) {
      console.error(`分类不存在: ${category.categorySlug}`);
      continue;
    }

    for (const toolData of category.tools) {
      console.log(`\n处理工具: ${toolData.name}`);

      try {
        // 抓取 GitHub 数据
        let githubData = null;
        if (toolData.githubUrl) {
          githubData = await githubScraper.scrape(toolData.githubUrl);
          await sleep(1000); // API 限流
        }

        // 合并数据
        const finalData = {
          ...toolData,
          ...(githubData || {}),
        };

        // 计算排名分数
        const rankingScore = calculateRankingScore({
          githubStars: githubData?.githubStars || 0,
          productHuntVotes: 0,
        });

        // 保存或更新工具
        const tool = await prisma.tools.upsert({
          where: { slug: finalData.slug },
          update: {
            name: finalData.name,
            description: finalData.description,
            websiteUrl: finalData.websiteUrl,
            logoUrl: finalData.logoUrl,
            teamOrigin: finalData.teamOrigin,
            pricingType: finalData.pricingType,
            rankingScore,
          },
          create: {
            id: randomUUID(),
            name: finalData.name,
            slug: finalData.slug,
            description: finalData.description,
            websiteUrl: finalData.websiteUrl,
            logoUrl: finalData.logoUrl,
            teamOrigin: finalData.teamOrigin,
            pricingType: finalData.pricingType,
            rankingScore,
            categoryId: dbCategory.id,
            updatedAt: new Date(),
          },
        });

        console.log(`✓ 已保存: ${tool.name} (评分: ${rankingScore})`);

        // 保存排名指标
        if (githubData) {
          await prisma.ranking_metrics.upsert({
            where: { toolId: tool.id },
            update: {
              githubStars: githubData.githubStars || 0,
              githubUrl: githubData.githubUrl,
              lastUpdated: new Date(),
            },
            create: {
              id: randomUUID(),
              toolId: tool.id,
              githubStars: githubData.githubStars || 0,
              githubUrl: githubData.githubUrl,
            },
          });
        }
      } catch (error: any) {
        console.error(`处理失败: ${toolData.name}`, error.message);
      }
    }
  }

  console.log('\n\n数据采集完成!');
}

/**
 * 计算综合排名分数
 */
function calculateRankingScore(metrics: {
  githubStars: number;
  productHuntVotes: number;
}): number {
  // 简单的加权算法
  const githubWeight = 0.6;
  const productHuntWeight = 0.4;

  // 对数标准化
  const githubScore = Math.log10(metrics.githubStars + 1) * 10;
  const productHuntScore = Math.log10(metrics.productHuntVotes + 1) * 10;

  const score = githubScore * githubWeight + productHuntScore * productHuntWeight;

  // 限制在 0-100 之间
  return Math.min(100, Math.max(0, score));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 执行脚本
scrapeAndSave()
  .catch((e) => {
    console.error('采集失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
