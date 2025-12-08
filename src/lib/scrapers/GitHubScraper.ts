import { BaseScraper, ToolData } from './BaseScraper';

interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  homepage: string | null;
  owner: {
    avatar_url: string;
  };
}

export class GitHubScraper extends BaseScraper {
  private githubToken?: string;

  constructor(githubToken?: string) {
    super({
      headers: githubToken
        ? { Authorization: `token ${githubToken}` }
        : {},
    });
    this.githubToken = githubToken;
  }

  /**
   * 从 GitHub URL 提取所有者和仓库名
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  }

  /**
   * 抓取 GitHub 仓库信息
   */
  async scrape(githubUrl: string): Promise<Partial<ToolData> | null> {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        console.error('无效的 GitHub URL:', githubUrl);
        return null;
      }

      const { owner, repo } = parsed;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      console.log(`正在抓取 GitHub: ${owner}/${repo}...`);

      const data: GitHubRepoInfo = await this.fetchWithRetry(apiUrl);

      return this.cleanData({
        name: data.name,
        description: data.description,
        websiteUrl: data.homepage || data.html_url,
        githubUrl: data.html_url,
        githubStars: data.stargazers_count,
        logoUrl: data.owner.avatar_url,
      });
    } catch (error: any) {
      console.error('GitHub 抓取失败:', error.message);
      return null;
    }
  }

  /**
   * 批量抓取多个仓库
   */
  async scrapeMultiple(githubUrls: string[]): Promise<Array<Partial<ToolData> | null>> {
    const results: Array<Partial<ToolData> | null> = [];

    for (const url of githubUrls) {
      const result = await this.scrape(url);
      results.push(result);

      // GitHub API 限流：每个请求间隔 1 秒
      await this.sleep(1000);
    }

    return results;
  }
}
