import { prisma } from '../src/lib/prisma';

interface GitHubRepoInfo {
  owner: string;
  repo: string;
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
    console.error('解析 GitHub URL 失败:', url, error);
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

    // 如果有 GitHub Token，添加到请求头中以提高 API 限制
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`仓库不存在: ${owner}/${repo}`);
        return null;
      }
      if (response.status === 403) {
        console.warn('GitHub API 限制，请添加 GITHUB_TOKEN 环境变量');
        return null;
      }
      console.warn(`获取仓库信息失败 (${response.status}): ${owner}/${repo}`);
      return null;
    }

    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error(`获取 GitHub Stars 失败: ${owner}/${repo}`, error);
    return null;
  }
}

// 更新所有工具的 GitHub Stars 数据
async function updateAllGitHubStars() {
  try {
    console.log('开始更新 GitHub Stars 数据...\n');

    // 获取所有有 GitHub URL 的工具指标
    const metrics = await prisma.ranking_metrics.findMany({
      where: {
        githubUrl: {
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

    let successCount = 0;
    let failCount = 0;

    for (const metric of metrics) {
      if (!metric.githubUrl) continue;

      const repoInfo = parseGitHubUrl(metric.githubUrl);
      if (!repoInfo) {
        console.log(`❌ ${metric.tools.name}: 无效的 GitHub URL - ${metric.githubUrl}`);
        failCount++;
        continue;
      }

      console.log(`正在更新: ${metric.tools.name} (${repoInfo.owner}/${repoInfo.repo})...`);

      const stars = await fetchGitHubStars(repoInfo.owner, repoInfo.repo);

      if (stars !== null) {
        await prisma.ranking_metrics.update({
          where: { id: metric.id },
          data: {
            githubStars: stars,
            lastUpdated: new Date(),
          },
        });
        console.log(`✅ ${metric.tools.name}: ${stars} stars\n`);
        successCount++;
      } else {
        console.log(`❌ ${metric.tools.name}: 获取失败\n`);
        failCount++;
      }

      // 添加延迟以避免触发 GitHub API 限制
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n更新完成！');
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${failCount}`);
    console.log(`总计: ${metrics.length}`);
  } catch (error) {
    console.error('更新 GitHub Stars 失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
updateAllGitHubStars().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
