import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleTools() {
  console.log('开始添加示例工具数据...\n');

  // 获取所有分类
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const tools = [
    // 语言类工具
    {
      name: 'ChatGPT',
      slug: 'chatgpt',
      categorySlug: 'language',
      description: 'OpenAI开发的强大对话AI，支持多种任务',
      websiteUrl: 'https://chat.openai.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 95,
      platformAvailability: { pc: true, ios: true, android: true, web: true },
    },
    {
      name: '文心一言',
      slug: 'wenxin',
      categorySlug: 'language',
      description: '百度开发的中文大语言模型',
      websiteUrl: 'https://yiyan.baidu.com',
      teamOrigin: 'DOMESTIC',
      pricingType: 'FREE',
      rankingScore: 85,
      platformAvailability: { pc: true, web: true },
    },
    {
      name: 'Claude',
      slug: 'claude',
      categorySlug: 'language',
      description: 'Anthropic开发的AI助手，擅长长文本理解',
      websiteUrl: 'https://claude.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 90,
      platformAvailability: { web: true },
    },
    {
      name: '讯飞星火',
      slug: 'xinghuo',
      categorySlug: 'language',
      description: '科大讯飞的认知大模型',
      websiteUrl: 'https://xinghuo.xfyun.cn',
      teamOrigin: 'DOMESTIC',
      pricingType: 'FREE',
      rankingScore: 80,
      platformAvailability: { web: true, android: true },
    },

    // 画图类工具
    {
      name: 'Midjourney',
      slug: 'midjourney',
      categorySlug: 'image',
      description: '领先的AI图像生成工具',
      websiteUrl: 'https://midjourney.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 92,
      platformAvailability: { web: true },
    },
    {
      name: 'Stable Diffusion',
      slug: 'stable-diffusion',
      categorySlug: 'image',
      description: '开源的AI图像生成模型',
      websiteUrl: 'https://stability.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREE',
      rankingScore: 88,
      platformAvailability: { pc: true, web: true },
    },
    {
      name: 'DALL-E 3',
      slug: 'dalle-3',
      categorySlug: 'image',
      description: 'OpenAI的图像生成模型',
      websiteUrl: 'https://openai.com/dall-e-3',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 90,
      platformAvailability: { web: true },
    },

    // 编程类工具
    {
      name: 'GitHub Copilot',
      slug: 'github-copilot',
      categorySlug: 'code',
      description: 'AI编程助手，提高开发效率',
      websiteUrl: 'https://github.com/features/copilot',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 90,
      platformAvailability: { pc: true, web: true },
    },
    {
      name: 'Cursor',
      slug: 'cursor',
      categorySlug: 'code',
      description: 'AI驱动的代码编辑器',
      websiteUrl: 'https://cursor.sh',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 87,
      platformAvailability: { pc: true },
    },
    {
      name: 'Codeium',
      slug: 'codeium',
      categorySlug: 'code',
      description: '免费的AI代码补全工具',
      websiteUrl: 'https://codeium.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREE',
      rankingScore: 82,
      platformAvailability: { pc: true, web: true },
    },

    // 视频类工具
    {
      name: 'Runway',
      slug: 'runway',
      categorySlug: 'video',
      description: 'AI视频生成和编辑工具',
      websiteUrl: 'https://runwayml.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 88,
      platformAvailability: { web: true },
    },
    {
      name: 'Pika',
      slug: 'pika',
      categorySlug: 'video',
      description: 'AI视频生成平台',
      websiteUrl: 'https://pika.art',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 85,
      platformAvailability: { web: true },
    },

    // 笔记类工具
    {
      name: 'Notion AI',
      slug: 'notion-ai',
      categorySlug: 'note',
      description: 'Notion内置的AI写作助手',
      websiteUrl: 'https://notion.so/product/ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 86,
      platformAvailability: { pc: true, ios: true, android: true, web: true },
    },
    {
      name: 'Obsidian',
      slug: 'obsidian',
      categorySlug: 'note',
      description: '强大的本地笔记应用',
      websiteUrl: 'https://obsidian.md',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 84,
      platformAvailability: { pc: true, ios: true, android: true },
    },

    // 个人助理类
    {
      name: 'Perplexity',
      slug: 'perplexity',
      categorySlug: 'assistant',
      description: 'AI搜索引擎和问答助手',
      websiteUrl: 'https://perplexity.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 87,
      platformAvailability: { web: true, ios: true, android: true },
    },
    {
      name: 'Pi',
      slug: 'pi',
      categorySlug: 'assistant',
      description: 'Inflection AI的个人智能助手',
      websiteUrl: 'https://pi.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREE',
      rankingScore: 83,
      platformAvailability: { web: true, ios: true },
    },
  ];

  for (const toolData of tools) {
    const categoryId = categoryMap.get(toolData.categorySlug);
    if (!categoryId) {
      console.log(`⚠ 分类不存在: ${toolData.categorySlug}`);
      continue;
    }

    try {
      const tool = await prisma.tool.upsert({
        where: { slug: toolData.slug },
        update: {
          name: toolData.name,
          description: toolData.description,
          websiteUrl: toolData.websiteUrl,
          teamOrigin: toolData.teamOrigin as any,
          pricingType: toolData.pricingType as any,
          rankingScore: toolData.rankingScore,
          platformAvailability: toolData.platformAvailability,
        },
        create: {
          name: toolData.name,
          slug: toolData.slug,
          description: toolData.description,
          websiteUrl: toolData.websiteUrl,
          teamOrigin: toolData.teamOrigin as any,
          pricingType: toolData.pricingType as any,
          rankingScore: toolData.rankingScore,
          platformAvailability: toolData.platformAvailability,
          categoryId,
        },
      });

      console.log(`✓ ${tool.name} (${toolData.categorySlug})`);
    } catch (error: any) {
      console.error(`✗ ${toolData.name}: ${error.message}`);
    }
  }

  console.log('\n示例数据添加完成!');
}

addSampleTools()
  .catch((e) => {
    console.error('添加失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
