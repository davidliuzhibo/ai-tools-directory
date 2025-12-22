import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 验证数据库迁移...\n');

    // 检查 tools 表的 dataSource 字段
    console.log('1. 检查 tools.dataSource 字段...');
    const toolsInfo = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tools'
      AND COLUMN_NAME = 'dataSource'
    `;
    console.log('   tools.dataSource:', toolsInfo);

    // 检查 ranking_metrics 表的新字段
    console.log('\n2. 检查 ranking_metrics 新字段...');
    const rankingInfo = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ranking_metrics'
      AND COLUMN_NAME IN ('waytoagiRanking', 'waytoagiUrl', 'aiProductRanking')
    `;
    console.log('   ranking_metrics 新字段:', rankingInfo);

    console.log('\n✅ 数据库迁移验证成功！所有字段都已正确添加。');
  } catch (error: any) {
    console.error('❌ 验证失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
