import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据...');

  // 创建分类
  const categories = [
    {
      name: '语言',
      slug: 'language',
      description: 'ChatGPT等AI语言类工具，包括对话助手、写作辅助等',
      icon: '💬',
      order: 1,
    },
    {
      name: '画图',
      slug: 'image',
      description: 'Midjourney等AI画图工具，包括图像生成、编辑等',
      icon: '🎨',
      order: 2,
    },
    {
      name: '编程',
      slug: 'code',
      description: 'GitHub Copilot等AI编程助手，提高开发效率',
      icon: '💻',
      order: 3,
    },
    {
      name: '视频',
      slug: 'video',
      description: 'AI视频生成和编辑工具',
      icon: '🎬',
      order: 4,
    },
    {
      name: '笔记',
      slug: 'note',
      description: 'Notion AI等智能笔记工具',
      icon: '📝',
      order: 5,
    },
    {
      name: '个人助理',
      slug: 'assistant',
      description: '多模态AI助手',
      icon: '🤖',
      order: 6,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log(`✓ 创建分类: ${category.name}`);
  }

  console.log('\n数据填充完成!');
}

main()
  .catch((e) => {
    console.error('数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
