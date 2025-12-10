import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMoreTools() {
  console.log('开始添加更多示例工具数据...\n');

  // 获取所有分类
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const moreTools = [
    // 更多语言类工具
    {
      name: '通义千问',
      slug: 'tongyi-qianwen',
      categorySlug: 'language',
      description: '阿里云推出的超大规模语言模型',
      websiteUrl: 'https://tongyi.aliyun.com',
      teamOrigin: 'DOMESTIC',
      pricingType: 'FREE',
      rankingScore: 82,
      platformAvailability: { web: true },
    },
    {
      name: 'Gemini',
      slug: 'gemini',
      categorySlug: 'language',
      description: 'Google的多模态AI模型',
      websiteUrl: 'https://gemini.google.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 88,
      platformAvailability: { web: true, ios: true, android: true },
    },
    {
      name: 'Llama 2',
      slug: 'llama-2',
      categorySlug: 'language',
      description: 'Meta开源的大语言模型',
      websiteUrl: 'https://llama.meta.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREE',
      rankingScore: 84,
      platformAvailability: { web: true },
    },

    // 更多画图类工具
    {
      name: 'Leonardo.AI',
      slug: 'leonardo-ai',
      categorySlug: 'image',
      description: 'AI游戏资产和图像生成工具',
      websiteUrl: 'https://leonardo.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 85,
      platformAvailability: { web: true },
    },
    {
      name: '文心一格',
      slug: 'yige',
      categorySlug: 'image',
      description: '百度的AI艺术和创意辅助平台',
      websiteUrl: 'https://yige.baidu.com',
      teamOrigin: 'DOMESTIC',
      pricingType: 'FREEMIUM',
      rankingScore: 78,
      platformAvailability: { web: true },
    },
    {
      name: 'Canva AI',
      slug: 'canva-ai',
      categorySlug: 'image',
      description: 'Canva内置的AI设计助手',
      websiteUrl: 'https://www.canva.com/ai-image-generator',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 83,
      platformAvailability: { web: true, ios: true, android: true },
    },

    // 更多编程类工具
    {
      name: 'Tabnine',
      slug: 'tabnine',
      categorySlug: 'code',
      description: 'AI代码补全工具，支持多种IDE',
      websiteUrl: 'https://www.tabnine.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 80,
      platformAvailability: { pc: true },
    },
    {
      name: 'Replit AI',
      slug: 'replit-ai',
      categorySlug: 'code',
      description: '在线IDE集成的AI编程助手',
      websiteUrl: 'https://replit.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 79,
      platformAvailability: { web: true },
    },
    {
      name: 'Amazon CodeWhisperer',
      slug: 'codewhisperer',
      categorySlug: 'code',
      description: '亚马逊的AI代码生成工具',
      websiteUrl: 'https://aws.amazon.com/codewhisperer',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREE',
      rankingScore: 81,
      platformAvailability: { pc: true },
    },

    // 更多视频类工具
    {
      name: 'HeyGen',
      slug: 'heygen',
      categorySlug: 'video',
      description: 'AI数字人视频生成平台',
      websiteUrl: 'https://heygen.com',
      teamOrigin: 'OUTBOUND',
      pricingType: 'FREEMIUM',
      rankingScore: 86,
      platformAvailability: { web: true },
    },
    {
      name: 'Synthesia',
      slug: 'synthesia',
      categorySlug: 'video',
      description: 'AI视频生成和虚拟主播平台',
      websiteUrl: 'https://synthesia.io',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 84,
      platformAvailability: { web: true },
    },
    {
      name: 'D-ID',
      slug: 'd-id',
      categorySlug: 'video',
      description: 'AI数字人视频创作工具',
      websiteUrl: 'https://www.d-id.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 82,
      platformAvailability: { web: true },
    },

    // 更多笔记类工具
    {
      name: 'Mem',
      slug: 'mem',
      categorySlug: 'note',
      description: 'AI驱动的个人知识管理工具',
      websiteUrl: 'https://mem.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 78,
      platformAvailability: { web: true, ios: true },
    },
    {
      name: 'Reflect',
      slug: 'reflect',
      categorySlug: 'note',
      description: '支持AI的网络化笔记工具',
      websiteUrl: 'https://reflect.app',
      teamOrigin: 'OVERSEAS',
      pricingType: 'PAID',
      rankingScore: 76,
      platformAvailability: { web: true, ios: true },
    },

    // 更多个人助理类
    {
      name: 'You.com',
      slug: 'you-com',
      categorySlug: 'assistant',
      description: 'AI搜索引擎和聊天助手',
      websiteUrl: 'https://you.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 81,
      platformAvailability: { web: true },
    },
    {
      name: 'Character.AI',
      slug: 'character-ai',
      categorySlug: 'assistant',
      description: 'AI角色对话和创作平台',
      websiteUrl: 'https://character.ai',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 85,
      platformAvailability: { web: true, ios: true, android: true },
    },
    {
      name: 'Poe',
      slug: 'poe',
      categorySlug: 'assistant',
      description: 'Quora推出的多模型AI聊天平台',
      websiteUrl: 'https://poe.com',
      teamOrigin: 'OVERSEAS',
      pricingType: 'FREEMIUM',
      rankingScore: 84,
      platformAvailability: { web: true, ios: true, android: true },
    },
  ];

  for (const toolData of moreTools) {
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

  // 统计数据
  const totalTools = await prisma.tool.count();
  console.log(`\n总计工具数: ${totalTools}`);

  console.log('\n更多数据添加完成!');
}

addMoreTools()
  .catch((e) => {
    console.error('添加失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
