import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseScraper, ScraperConfig, ToolData } from './BaseScraper';

interface WaytoAGIConfig extends ScraperConfig {
  feishuEmail?: string;
  feishuPassword?: string;
  headless?: boolean;
}

interface WaytoAGIToolData {
  name: string;
  category: string;
  description?: string;
  url?: string;
  ranking?: number;
  tags?: string[];
  [key: string]: any;
}

export class WaytoAGIScraper extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  protected config: WaytoAGIConfig;

  constructor(config: WaytoAGIConfig = {}) {
    super();
    this.config = {
      headless: false, // 设置为 false 以便手动登录
      ...config,
    };
  }

  /**
   * 初始化浏览器
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      });

      this.page = await this.browser.newPage();

      // 设置用户代理以避免被检测为机器人
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
    }
  }

  /**
   * 登录飞书（如果提供了凭证则自动登录，否则等待手动登录）
   */
  private async login(): Promise<void> {
    if (!this.page) {
      throw new Error('浏览器未初始化');
    }

    console.log('正在访问 WaytoAGI 飞书文档...');

    // 访问目标页面
    await this.page.goto(
      'https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb?table=tblXKIWDjaTx7Lkl&view=vewYE1Jfjg',
      { waitUntil: 'networkidle2', timeout: 60000 }
    );

    // 检查是否需要登录
    const needsLogin = await this.page.evaluate(() => {
      return window.location.href.includes('login') ||
             document.querySelector('input[type="password"]') !== null;
    });

    if (needsLogin) {
      if (this.config.feishuEmail && this.config.feishuPassword) {
        console.log('正在自动登录...');
        // 自动登录逻辑（需要根据实际登录页面调整选择器）
        await this.page.type('input[type="email"]', this.config.feishuEmail);
        await this.page.type('input[type="password"]', this.config.feishuPassword);
        await this.page.click('button[type="submit"]');
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        console.log('⚠️  请在浏览器窗口中手动登录飞书账号');
        console.log('登录后，脚本将自动继续...');

        // 等待用户手动登录（检测 URL 变化或特定元素出现）
        await this.page.waitForFunction(
          () => {
            return !window.location.href.includes('login') &&
                   (document.querySelector('[data-testid="table-view"]') !== null ||
                    document.querySelector('.table-view') !== null);
          },
          { timeout: 300000 } // 5分钟超时
        );

        console.log('✓ 登录成功！');
      }
    }
  }

  /**
   * 抓取飞书表格数据
   */
  async scrape(): Promise<WaytoAGIToolData[]> {
    try {
      await this.initBrowser();
      await this.login();

      if (!this.page) {
        throw new Error('浏览器未初始化');
      }

      console.log('正在等待表格加载...');

      // 等待表格加载
      await this.page.waitForSelector('.table-view, [data-testid="table-view"]', {
        timeout: 30000,
      });

      console.log('正在提取数据...');

      // 提取表格数据
      const tools = await this.page.evaluate(() => {
        const results: WaytoAGIToolData[] = [];

        // 查找所有表格行（需要根据实际 DOM 结构调整选择器）
        const rows = document.querySelectorAll('.table-row, [data-testid="table-row"]');

        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('.table-cell, [data-testid="table-cell"]');

          if (cells.length > 0) {
            const tool: WaytoAGIToolData = {
              name: cells[0]?.textContent?.trim() || '',
              category: cells[1]?.textContent?.trim() || '',
              description: cells[2]?.textContent?.trim() || '',
              url: cells[3]?.querySelector('a')?.href || '',
              ranking: index + 1,
            };

            // 只添加有效数据
            if (tool.name) {
              results.push(tool);
            }
          }
        });

        return results;
      });

      console.log(`✓ 成功提取 ${tools.length} 个工具数据`);

      return tools;
    } catch (error: any) {
      console.error('WaytoAGI 抓取失败:', error.message);
      throw error;
    }
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * 导出数据到 JSON
   */
  async exportToJSON(filename: string = 'waytoagi-tools.json'): Promise<void> {
    const tools = await this.scrape();
    const fs = require('fs');
    const path = require('path');

    const outputPath = path.join(process.cwd(), 'data', filename);

    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2), 'utf-8');
    console.log(`✓ 数据已导出到: ${outputPath}`);
  }
}
