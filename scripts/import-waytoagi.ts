import { WaytoAGIScraper } from '../src/lib/scrapers/WaytoAGIScraper';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface CategoryMapping {
  [key: string]: string;
}

// 分类映射（将 WaytoAGI 的分类映射到本地分类）
const CATEGORY_MAPPING: CategoryMapping = {
  '对话': 'language',
  '语言': 'language',
  'AI对话': 'language',
  '画图': 'image',
  '图像': 'image',
  '图像生成': 'image',
  '编程': 'code',
  '代码': 'code',
  '开发': 'code',
  '视频': 'video',
  '音频': 'video',
  '笔记': 'note',
  '写作': 'note',
  '助理': 'assistant',
  '智能助手': 'assistant',
};

/**
 * 将 WaytoAGI 分类映射到本地分类
 */
function mapCategory(waytoagiCategory: string): string {
  // 直接匹配
  if (CATEGORY_MAPPING[waytoagiCategory]) {
    return CATEGORY_MAPPING[waytoagiCategory];
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (waytoagiCategory.includes(key) || key.includes(waytoagiCategory)) {
      return value;
    }
  }

  // 默认返回 language 分类
  return 'language';
}

/**
 * 生成 slug（URL 友好的标识符）
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 从 WaytoAGI 导入工具数据
 */
async function importFromWaytoAGI() {
  console.log('🚀 开始从 WaytoAGI 导入数据...\n');

  const scraper = new WaytoAGIScraper({
    headless: false, // 设置为 false 以便手动登录
  });

  try {
    // 1. 抓取数据
    console.log('📥 正在抓取 WaytoAGI 数据...');
    const tools = await scraper.scrape();
    console.log(`✓ 成功抓取 ${tools.length} 个工具\n`);

    // 2. 获取所有分类
    const categories = await prisma.categories.findMany();
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    // 3. 导入到数据库
    console.log('💾 正在导入到数据库...\n');

    let imported = 0;
    let skipped = 0;
    let updated = 0;

    for (const tool of tools) {
      try {
        // 映射分类
        const categorySlug = mapCategory(tool.category);
        const categoryId = categoryMap.get(categorySlug);

        if (!categoryId) {
          console.log(`⚠️  跳过 ${tool.name}: 分类 "${categorySlug}" 不存在`);
          skipped++;
          continue;
        }

        // 生成 slug
        const slug = generateSlug(tool.name);

        // 检查工具是否已存在
        const existingTool = await prisma.tools.findUnique({
          where: { slug },
        });

        if (existingTool) {
          // 更新现有工具
          await prisma.tools.update({
            where: { slug },
            data: {
              description: tool.description || existingTool.description,
              websiteUrl: tool.url || existingTool.websiteUrl,
              dataSource: 'WAYTOAGI',
              updatedAt: new Date(),
              ranking_metrics: {
                upsert: {
                  create: {
                    id: randomUUID(),
                    waytoagiRanking: tool.ranking,
                    waytoagiUrl: 'https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb',
                  },
                  update: {
                    waytoagiRanking: tool.ranking,
                    waytoagiUrl: 'https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb',
                    lastUpdated: new Date(),
                  },
                },
              },
            },
          });

          console.log(`✓ 更新工具: ${tool.name}`);
          updated++;
        } else {
          // 创建新工具
          const toolId = randomUUID();

          await prisma.tools.create({
            data: {
              id: toolId,
              name: tool.name,
              slug,
              description: tool.description,
              websiteUrl: tool.url,
              categoryId,
              dataSource: 'WAYTOAGI',
              isPublished: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              ranking_metrics: {
                create: {
                  id: randomUUID(),
                  waytoagiRanking: tool.ranking,
                  waytoagiUrl: 'https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb',
                },
              },
            },
          });

          console.log(`✓ 导入新工具: ${tool.name}`);
          imported++;
        }

        // 添加延迟以避免数据库过载
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`❌ 导入 ${tool.name} 失败:`, error.message);
        skipped++;
      }
    }

    // 4. 输出统计
    console.log('\n📊 导入统计:');
    console.log(`  新导入: ${imported} 个`);
    console.log(`  更新: ${updated} 个`);
    console.log(`  跳过: ${skipped} 个`);
    console.log(`  总计: ${tools.length} 个\n`);

    console.log('✅ 导入完成！');
  } catch (error: any) {
    console.error('❌ 导入失败:', error.message);
    throw error;
  } finally {
    await scraper.close();
    await prisma.$disconnect();
  }
}

// 执行导入
if (require.main === module) {
  importFromWaytoAGI()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { importFromWaytoAGI };
