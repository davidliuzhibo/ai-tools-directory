import { prisma } from '../src/lib/prisma';

interface ProductHuntInfo {
  slug: string;
}

// 从 Product Hunt URL 中提取产品 slug
function parseProductHuntUrl(url: string): ProductHuntInfo | null {
  try {
    // 支持格式: https://www.producthunt.com/posts/product-name
    const match = url.match(/producthunt\.com\/posts\/([^\/\?#]+)/);
    if (match) {
      return {
        slug: match[1],
      };
    }
    return null;
  } catch (error) {
    console.error('解析 Product Hunt URL 失败:', url, error);
    return null;
  }
}

// 获取 Product Hunt 产品的投票数
async function fetchProductHuntVotes(slug: string): Promise<number | null> {
  try {
    const token = process.env.PRODUCTHUNT_API_TOKEN;

    if (!token) {
      console.warn('未设置 PRODUCTHUNT_API_TOKEN 环境变量');
      return null;
    }

    // Product Hunt GraphQL API
    const query = `
      query {
        post(slug: "${slug}") {
          votesCount
        }
      }
    `;

    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`产品不存在: ${slug}`);
        return null;
      }
      if (response.status === 401) {
        console.warn('Product Hunt API Token 无效');
        return null;
      }
      console.warn(`获取产品信息失败 (${response.status}): ${slug}`);
      return null;
    }

    const result = await response.json();

    if (result.errors) {
      console.warn(`GraphQL 错误: ${slug}`, result.errors);
      return null;
    }

    if (!result.data || !result.data.post) {
      console.warn(`未找到产品: ${slug}`);
      return null;
    }

    return result.data.post.votesCount || 0;
  } catch (error) {
    console.error(`获取 Product Hunt 投票数失败: ${slug}`, error);
    return null;
  }
}

// 更新所有工具的 Product Hunt 投票数据
async function updateAllProductHuntVotes() {
  try {
    console.log('开始更新 Product Hunt 投票数据...\n');

    // 获取所有有 Product Hunt URL 的工具指标
    const metrics = await prisma.ranking_metrics.findMany({
      where: {
        productHuntUrl: {
          not: null,
        },
      },
      include: {
        tools: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`找到 ${metrics.length} 个需要更新的工具\n`);

    if (!process.env.PRODUCTHUNT_API_TOKEN) {
      console.error('❌ 错误: 未设置 PRODUCTHUNT_API_TOKEN 环境变量');
      console.log('请访问 https://www.producthunt.com/v2/oauth/applications 获取 API Token');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const metric of metrics) {
      if (!metric.productHuntUrl) continue;

      const productInfo = parseProductHuntUrl(metric.productHuntUrl);
      if (!productInfo) {
        console.log(`❌ ${metric.tools.name}: 无效的 Product Hunt URL - ${metric.productHuntUrl}`);
        failCount++;
        continue;
      }

      console.log(`正在更新: ${metric.tools.name} (${productInfo.slug})...`);

      const votes = await fetchProductHuntVotes(productInfo.slug);

      if (votes !== null) {
        await prisma.ranking_metrics.update({
          where: { id: metric.id },
          data: {
            productHuntVotes: votes,
            lastUpdated: new Date(),
          },
        });
        console.log(`✅ ${metric.tools.name}: ${votes} votes\n`);
        successCount++;
      } else {
        console.log(`❌ ${metric.tools.name}: 获取失败\n`);
        failCount++;
      }

      // 添加延迟以避免触发 API 限制
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('\n更新完成！');
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${failCount}`);
    console.log(`总计: ${metrics.length}`);
  } catch (error) {
    console.error('更新 Product Hunt 投票数失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
updateAllProductHuntVotes().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
