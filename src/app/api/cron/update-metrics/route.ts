import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

interface ProductHuntInfo {
  slug: string;
}

// 从 GitHub URL 中提取仓库信息
function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 从 Product Hunt URL 中提取产品 slug
function parseProductHuntUrl(url: string): ProductHuntInfo | null {
  try {
    const match = url.match(/producthunt\.com\/posts\/([^\/\?#]+)/);
    if (match) {
      return {
        slug: match[1],
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 获取 GitHub 仓库的星标数
async function fetchGitHubStars(owner: string, repo: string): Promise<number | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AIBook-Collector',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error(`获取 GitHub Stars 失败: ${owner}/${repo}`, error);
    return null;
  }
}

// 获取 Product Hunt 产品的投票数
async function fetchProductHuntVotes(slug: string): Promise<number | null> {
  try {
    const token = process.env.PRODUCTHUNT_API_TOKEN;

    if (!token) {
      return null;
    }

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
      return null;
    }

    const result = await response.json();

    if (result.errors || !result.data || !result.data.post) {
      return null;
    }

    return result.data.post.votesCount || 0;
  } catch (error) {
    console.error(`获取 Product Hunt 投票数失败: ${slug}`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证请求来自 Vercel Cron（可选，增强安全性）
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    console.log('开始更新排名指标...');

    // 获取所有有外部链接的工具指标
    const metrics = await prisma.ranking_metrics.findMany({
      where: {
        OR: [
          { githubUrl: { not: null } },
          { productHuntUrl: { not: null } },
        ],
      },
      include: {
        tools: {
          select: {
            name: true,
          },
        },
      },
    });

    let successCount = 0;
    let failCount = 0;
    const results: any[] = [];

    for (const metric of metrics) {
      const result: any = {
        tool: metric.tools.name,
        github: null,
        productHunt: null,
      };

      // 更新 GitHub Stars
      if (metric.githubUrl) {
        const repoInfo = parseGitHubUrl(metric.githubUrl);
        if (repoInfo) {
          const stars = await fetchGitHubStars(repoInfo.owner, repoInfo.repo);
          if (stars !== null) {
            await prisma.ranking_metrics.update({
              where: { id: metric.id },
              data: {
                githubStars: stars,
                lastUpdated: new Date(),
              },
            });
            result.github = { stars, success: true };
            successCount++;
          } else {
            result.github = { success: false };
            failCount++;
          }
          // 添加延迟以避免触发 API 限制
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // 更新 Product Hunt 投票数
      if (metric.productHuntUrl) {
        const productInfo = parseProductHuntUrl(metric.productHuntUrl);
        if (productInfo) {
          const votes = await fetchProductHuntVotes(productInfo.slug);
          if (votes !== null) {
            await prisma.ranking_metrics.update({
              where: { id: metric.id },
              data: {
                productHuntVotes: votes,
                lastUpdated: new Date(),
              },
            });
            result.productHunt = { votes, success: true };
            successCount++;
          } else {
            result.productHunt = { success: false };
            failCount++;
          }
          // 添加延迟以避免触发 API 限制
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      results.push(result);
    }

    return NextResponse.json({
      message: '更新完成',
      totalMetrics: metrics.length,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    console.error('更新排名指标失败:', error);
    return NextResponse.json(
      { error: '更新失败', details: String(error) },
      { status: 500 }
    );
  }
}
