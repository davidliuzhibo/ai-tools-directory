import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testCategoryQuery() {
  try {
    console.log('🔍 测试分类查询...\n');

    const category = await prisma.categories.findUnique({
      where: { slug: 'video' },
      include: {
        tools: {
          where: { isPublished: true },
          orderBy: { rankingScore: 'desc' },
        },
      },
    });

    console.log('\n📋 查询结果：');
    console.log('================');
    if (category) {
      console.log(`分类: ${category.name}`);
      console.log(`工具数量: ${category.tools.length}`);
      console.log('\n工具列表:');
      category.tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name} (评分: ${tool.rankingScore})`);
      });
    } else {
      console.log('未找到分类');
    }

    console.log('\n✅ 查询完成！\n');
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryQuery();
