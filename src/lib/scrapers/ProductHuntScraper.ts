import { BaseScraper, ToolData } from './BaseScraper';
import * as cheerio from 'cheerio';

export class ProductHuntScraper extends BaseScraper {
  private apiKey?: string;

  constructor(apiKey?: string) {
    super({
      headers: apiKey
        ? { Authorization: `Bearer ${apiKey}` }
        : {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
    });
    this.apiKey = apiKey;
  }

  /**
   * 从 Product Hunt URL 提取 slug
   */
  private parseProductHuntUrl(url: string): string | null {
    const match = url.match(/producthunt\.com\/posts\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  /**
   * 抓取 Product Hunt 产品信息（通过网页抓取）
   */
  async scrape(productHuntUrl: string): Promise<Partial<ToolData> | null> {
    try {
      const slug = this.parseProductHuntUrl(productHuntUrl);
      if (!slug) {
        console.error('无效的 Product Hunt URL:', productHuntUrl);
        return null;
      }

      console.log(`正在抓取 Product Hunt: ${slug}...`);

      // 使用网页抓取方式
      const html = await this.fetchWithRetry(productHuntUrl);
      const $ = cheerio.load(html);

      // 尝试提取信息（Product Hunt 的结构可能会变化）
      const name = $('h1').first().text().trim();
      const description = $('meta[property="og:description"]').attr('content');
      const votes = this.extractVotes($);

      return this.cleanData({
        name,
        description,
        productHuntUrl,
        productHuntVotes: votes,
      });
    } catch (error: any) {
      console.error('Product Hunt 抓取失败:', error.message);
      return null;
    }
  }

  /**
   * 从页面提取投票数
   */
  private extractVotes($: cheerio.CheerioAPI): number {
    // 尝试多种选择器
    const selectors = [
      '[data-test="vote-button"] span',
      '.vote-count',
      '[class*="voteCount"]',
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const votes = parseInt(text.replace(/\D/g, ''), 10);
      if (!isNaN(votes)) {
        return votes;
      }
    }

    return 0;
  }

  /**
   * 批量抓取多个产品
   */
  async scrapeMultiple(
    productHuntUrls: string[]
  ): Promise<Array<Partial<ToolData> | null>> {
    const results: Array<Partial<ToolData> | null> = [];

    for (const url of productHuntUrls) {
      const result = await this.scrape(url);
      results.push(result);

      // 避免请求过快
      await this.sleep(2000);
    }

    return results;
  }
}
