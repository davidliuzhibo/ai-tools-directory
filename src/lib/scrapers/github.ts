import axios from 'axios';
import { ScrapedTool } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  homepage: string | null;
}

/**
 * 搜索GitHub上的AI工具仓库
 * @param query 搜索关键词
 * @param maxResults 最大结果数
 * @returns 抓取的工具数据数组
 */
export async function scrapeGitHub(
  query: string = 'ai tool',
  maxResults: number = 50
): Promise<ScrapedTool[]> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `${GITHUB_API_BASE}/search/repositories`,
      {
        headers,
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: Math.min(maxResults, 100),
        },
      }
    );

    const repos: GitHubRepo[] = response.data.items;

    return repos.map((repo) => ({
      name: repo.name,
      description: repo.description || undefined,
      websiteUrl: repo.homepage || repo.html_url,
      githubUrl: repo.html_url,
      stars: repo.stargazers_count,
    }));
  } catch (error) {
    console.error('GitHub爬取错误:', error);
    throw new Error('GitHub数据获取失败');
  }
}

/**
 * 获取单个GitHub仓库的详细信息
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @returns 仓库详细信息
 */
export async function getGitHubRepoDetails(
  owner: string,
  repo: string
): Promise<ScrapedTool> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers }
    );

    const repoData: GitHubRepo = response.data;

    return {
      name: repoData.name,
      description: repoData.description || undefined,
      websiteUrl: repoData.homepage || repoData.html_url,
      githubUrl: repoData.html_url,
      stars: repoData.stargazers_count,
    };
  } catch (error) {
    console.error(`获取仓库 ${owner}/${repo} 详情失败:`, error);
    throw new Error('GitHub仓库详情获取失败');
  }
}

/**
 * 从多个关键词搜索并合并结果
 * @param keywords 关键词数组
 * @returns 去重后的工具数组
 */
export async function searchMultipleKeywords(
  keywords: string[]
): Promise<ScrapedTool[]> {
  const allTools: ScrapedTool[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords) {
    try {
      const tools = await scrapeGitHub(keyword, 30);

      for (const tool of tools) {
        if (tool.githubUrl && !seenUrls.has(tool.githubUrl)) {
          seenUrls.add(tool.githubUrl);
          allTools.push(tool);
        }
      }

      // 避免GitHub API限流
      await sleep(1000);
    } catch (error) {
      console.error(`搜索关键词 "${keyword}" 失败:`, error);
    }
  }

  return allTools;
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
