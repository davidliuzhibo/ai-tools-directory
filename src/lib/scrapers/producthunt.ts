import puppeteer from 'puppeteer';
import { ScrapedTool } from '@/types';

const PRODUCT_HUNT_BASE = 'https://www.producthunt.com';

interface ProductHuntTool {
  name: string;
  tagline: string;
  url: string;
  votesCount: number;
  websiteUrl?: string;
}

/**
 * 使用Puppeteer爬取Product Hunt的AI工具
 * @param topic 主题/标签 (如 'artificial-intelligence')
 * @param maxResults 最大结果数
 * @returns 抓取的工具数据
 */
export async function scrapeProductHunt(
  topic: string = 'artificial-intelligence',
  maxResults: number = 50
): Promise<ScrapedTool[]> {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    // 访问Product Hunt主题页
    const url = `${PRODUCT_HUNT_BASE}/topics/${topic}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 等待产品列表加载
    await page.waitForSelector('[data-test="post-item"]', { timeout: 10000 });

    // 提取产品数据
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-test="post-item"]');
      const results: ProductHuntTool[] = [];

      items.forEach((item) => {
        try {
          const nameEl = item.querySelector('h3');
          const taglineEl = item.querySelector('[data-test="post-tagline"]');
          const votesEl = item.querySelector('[data-test="vote-count"]');
          const linkEl = item.querySelector('a[href^="/posts/"]');

          if (nameEl && linkEl) {
            results.push({
              name: nameEl.textContent?.trim() || '',
              tagline: taglineEl?.textContent?.trim() || '',
              url: (linkEl as HTMLAnchorElement).href,
              votesCount: parseInt(votesEl?.textContent || '0'),
            });
          }
        } catch (err) {
          console.error('解析产品项出错:', err);
        }
      });

      return results.slice(0, 50); // 限制数量
    });

    await browser.close();

    // 转换为标准格式
    return products.slice(0, maxResults).map((product) => ({
      name: product.name,
      description: product.tagline,
      productHuntUrl: product.url,
      votes: product.votesCount,
    }));
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Product Hunt爬取错误:', error);
    throw new Error('Product Hunt数据获取失败');
  }
}

/**
 * 爬取Product Hunt首页的热门产品
 * @param maxResults 最大结果数
 * @returns 热门工具数据
 */
export async function scrapeTrendingProducts(
  maxResults: number = 20
): Promise<ScrapedTool[]> {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    await page.goto(PRODUCT_HUNT_BASE, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-test="post-item"]', { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-test="post-item"]');
      const results: ProductHuntTool[] = [];

      items.forEach((item) => {
        try {
          const nameEl = item.querySelector('h3');
          const taglineEl = item.querySelector('[data-test="post-tagline"]');
          const votesEl = item.querySelector('[data-test="vote-count"]');
          const linkEl = item.querySelector('a[href^="/posts/"]');

          if (nameEl && linkEl) {
            results.push({
              name: nameEl.textContent?.trim() || '',
              tagline: taglineEl?.textContent?.trim() || '',
              url: (linkEl as HTMLAnchorElement).href,
              votesCount: parseInt(votesEl?.textContent || '0'),
            });
          }
        } catch (err) {
          console.error('解析产品项出错:', err);
        }
      });

      return results;
    });

    await browser.close();

    return products.slice(0, maxResults).map((product) => ({
      name: product.name,
      description: product.tagline,
      productHuntUrl: product.url,
      votes: product.votesCount,
    }));
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Product Hunt热门产品爬取错误:', error);
    throw new Error('Product Hunt热门产品获取失败');
  }
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
