import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  name: string;
  category: string;
  description?: string;
  url?: string;
  tags?: string;
  [key: string]: any;
}

// 分类映射（将中文分类映射到数据库中的slug）
const CATEGORY_MAPPING: { [key: string]: string } = {
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
  '办公': 'note',
  'PPT': 'note',
  '文档': 'note',
};

/**
 * 将分类映射到数据库slug
 */
function mapCategory(category: string): string {
  // 直接匹配
  if (CATEGORY_MAPPING[category]) {
    return CATEGORY_MAPPING[category];
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (category.includes(key) || key.includes(category)) {
      return value;
    }
  }

  // 默认返回 language 分类
  return 'language';
}

/**
 * 生成 slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 解析CSV文件
 */
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return [];
  }

  // 解析表头
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  // 解析数据行
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: CSVRow = { name: '', category: '' };

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * 从CSV导入工具数据
 */
async function importFromCSV(csvFilePath: string) {
  console.log('🚀 开始从CSV导入数据...\n');

  // 读取CSV文件
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV文件不存在: ${csvFilePath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`📄 读取到 ${rows.length} 条数据\n`);

  // 获取所有分类
  const categories = await prisma.categories.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  console.log('💾 开始导入到数据库...\n');

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      // 必填字段检查
      if (!row.name || row.name.trim() === '') {
        skipped++;
        continue;
      }

      // 映射分类
      const categorySlug = mapCategory(row.category || '');
      const categoryId = categoryMap.get(categorySlug);

      if (!categoryId) {
        console.log(`⚠️  跳过 ${row.name}: 分类 "${categorySlug}" 不存在`);
        skipped++;
        continue;
      }

      // 生成 slug
      const slug = generateSlug(row.name);

      // 解析标签
      const tags = row.tags ? row.tags.split(/[,，;；]/).map(t => t.trim()).filter(t => t) : [];

      // 检查工具是否已存在
      const existingTool = await prisma.tools.findUnique({
        where: { slug },
      });

      if (existingTool) {
        // 更新现有工具
        await prisma.tools.update({
          where: { slug },
          data: {
            description: row.description || existingTool.description,
            websiteUrl: row.url || existingTool.websiteUrl,
            dataSource: 'WAYTOAGI',
            updatedAt: new Date(),
          },
        });

        console.log(`✓ 更新工具: ${row.name}`);
        updated++;
      } else {
        // 创建新工具
        const toolId = randomUUID();

        await prisma.tools.create({
          data: {
            id: toolId,
            name: row.name,
            slug,
            description: row.description,
            websiteUrl: row.url,
            categoryId,
            dataSource: 'WAYTOAGI',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log(`✓ 导入新工具: ${row.name}`);
        imported++;
      }

      // 添加延迟避免数据库过载
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error: any) {
      console.error(`❌ 导入 ${row.name} 失败:`, error.message);
      skipped++;
    }
  }

  // 输出统计
  console.log('\n📊 导入统计:');
  console.log(`  新导入: ${imported} 个`);
  console.log(`  更新: ${updated} 个`);
  console.log(`  跳过: ${skipped} 个`);
  console.log(`  总计: ${rows.length} 个\n`);

  console.log('✅ 导入完成！');
}

// 执行导入
if (require.main === module) {
  const csvPath = process.argv[2] || path.join(process.cwd(), 'data', 'waytoagi-tools.csv');

  console.log(`CSV文件路径: ${csvPath}\n`);

  importFromCSV(csvPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { importFromCSV };
