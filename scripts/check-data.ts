import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    // 检查分类数据
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { tools: true }
        }
      }
    });

    console.log('\n📊 分类数据统计：');
    console.log('================');
    categories.forEach(cat => {
      console.log(`${cat.name} (${cat.slug}): ${cat._count.tools} 个工具`);
    });

    // 检查工具总数
    const toolsCount = await prisma.tools.count();
    const publishedToolsCount = await prisma.tools.count({
      where: { isPublished: true }
    });

    console.log('\n🔧 工具数据统计：');
    console.log('================');
    console.log(`总工具数: ${toolsCount}`);
    console.log(`已发布工具数: ${publishedToolsCount}`);

    // 检查视频分类的工具
    const videoCategory = await prisma.categories.findUnique({
      where: { slug: 'video' },
      include: {
        tools: {
          select: {
            id: true,
            name: true,
            isPublished: true
          }
        }
      }
    });

    if (videoCategory) {
      console.log('\n🎬 视频分类工具列表：');
      console.log('================');
      if (videoCategory.tools.length > 0) {
        videoCategory.tools.forEach(tool => {
          console.log(`- ${tool.name} (${tool.isPublished ? '已发布' : '未发布'})`);
        });
      } else {
        console.log('⚠️  该分类下暂无工具');
      }
    }

    console.log('\n✅ 数据检查完成！\n');
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
