import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseScraper, ScraperConfig, ToolData } from './BaseScraper';
import fs from 'fs';
import path from 'path';

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
        console.log('\n========================================');
        console.log('⚠️  请在浏览器窗口中手动登录飞书账号');
        console.log('登录后，请确认页面已完全加载显示工具卡片');
        console.log('然后等待脚本自动继续（最多 5 分钟）...');
        console.log('========================================\n');

        // 等待用户手动登录（检测 URL 变化或特定元素出现）
        await this.page.waitForFunction(
          () => {
            // 检查是否已登录并且页面加载完成
            const notLoginPage = !window.location.href.includes('login');
            // 检查页面上是否有链接（表示内容已加载）
            const hasLinks = document.querySelectorAll('a[href]').length > 50;
            return notLoginPage && hasLinks;
          },
          { timeout: 300000 } // 5分钟超时
        );

        console.log('✓ 检测到登录成功，页面已加载！');
        console.log('等待 10 秒确保所有动态内容加载完成...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
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

      // 等待页面完全加载 - 增加等待时间
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒

      // 滚动页面以加载所有卡片
      console.log('正在滚动页面加载所有内容...');
      await this.page.evaluate(async () => {
        // 滚动到页面底部多次，确保所有内容加载
        for (let i = 0; i < 10; i++) {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(resolve => setTimeout(resolve, 1500)); // 每次滚动后等待1.5秒
        }
        // 滚动回顶部
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      });

      console.log('等待内容完全加载...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 再等待5秒

      // 截图调试
      await this.page.screenshot({ path: 'debug-waytoagi.png', fullPage: true });
      console.log('✓ 已保存调试截图: debug-waytoagi.png');

      // 打印页面 URL 和标题
      const url = this.page.url();
      const title = await this.page.title();
      console.log(`当前页面: ${url}`);
      console.log(`页面标题: ${title}`);

      // 尝试多个可能的选择器
      const possibleSelectors = [
        'table',
        '.table-view',
        '[data-testid="table-view"]',
        '[class*="table"]',
        '[class*="Table"]',
        '.grid',
        '[role="grid"]',
        '[role="table"]',
      ];

      let foundSelector = null;
      for (const selector of possibleSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 });
          foundSelector = selector;
          console.log(`✓ 找到元素: ${selector}`);
          break;
        } catch (e) {
          console.log(`未找到元素: ${selector}`);
        }
      }

      if (!foundSelector) {
        // 打印页面 HTML 以便调试
        const bodyHTML = await this.page.evaluate(() => document.body.innerHTML);
        console.log('\n页面 HTML 片段:');
        console.log(bodyHTML.substring(0, 1000));
        throw new Error('无法找到表格元素，请检查页面结构或确保已登录');
      }

      console.log('正在提取数据...');

      // 检查是否有 iframe
      const frames = this.page.frames();
      console.log(`页面共有 ${frames.length} 个 frame`);

      // 查找包含表格内容的 iframe
      let contentFrame = null;
      for (const frame of frames) {
        const url = frame.url();
        console.log(`Frame URL: ${url.substring(0, 100)}`);

        // 尝试在每个frame中查找链接
        try {
          const links = await frame.$$('a[href]');
          if (links.length > 10) {
            // 检查是否有外部链接
            let hasExternal = false;
            for (let i = 0; i < Math.min(10, links.length); i++) {
              const href = await links[i].evaluate(el => el.getAttribute('href'));
              if (href && href.startsWith('http') && !href.includes('feishu.cn')) {
                hasExternal = true;
                console.log(`✓ 在 frame 中找到外部链接: ${href}`);
                break;
              }
            }

            if (hasExternal) {
              contentFrame = frame;
              console.log(`✓ 使用此 frame 进行数据提取`);
              break;
            }
          }
        } catch (e) {
          // Frame 可能无法访问，跳过
        }
      }

      if (!contentFrame) {
        console.log('⚠️  未找到包含工具数据的 iframe，使用主页面');
        contentFrame = this.page.mainFrame();
      }

      // 在找到的 frame 中提取数据
      const result = await contentFrame.evaluate(() => {
        const results: any[] = [];
        const debugInfo: string[] = [];

        // 查找所有外部链接
        const allLinks = document.querySelectorAll('a[href]');
        const externalLinks: HTMLAnchorElement[] = [];

        debugInfo.push(`Frame 中有 ${allLinks.length} 个链接`);

        allLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          if (href && href.startsWith('http') && !href.includes('feishu.cn')) {
            externalLinks.push(link as HTMLAnchorElement);
          }
        });

        debugInfo.push(`其中 ${externalLinks.length} 个外部链接`);

        // 打印前10个外部链接
        externalLinks.slice(0, 10).forEach((link, i) => {
          debugInfo.push(`外部链接 ${i + 1}: ${link.textContent?.trim().substring(0, 30)} -> ${link.href.substring(0, 60)}`);
        });

        // 从外部链接提取工具信息
        const processedUrls = new Set<string>();

        externalLinks.forEach(link => {
          const url = link.href;
          if (processedUrls.has(url)) return;
          processedUrls.add(url);

          // 向上查找父容器
          let container: Element | null = link;
          for (let i = 0; i < 8; i++) {
            container = container?.parentElement || null;
            if (!container) break;

            const childCount = container.children.length;
            const textLength = container.textContent?.trim().length || 0;

            if (childCount >= 2 && childCount <= 30 && textLength > 20 && textLength < 1500) {
              break;
            }
          }

          if (!container) container = link.parentElement;
          if (!container) return;

          // 提取名称
          let name = '';
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"]');
          if (headings.length > 0) {
            name = headings[0].textContent?.trim() || '';
          }

          if (!name) {
            name = link.textContent?.trim() || '';
          }

          // 提取分类标签
          const tags: string[] = [];
          const tagEls = container.querySelectorAll('[class*="tag"], [class*="label"], [class*="badge"]');
          tagEls.forEach(tag => {
            const text = tag.textContent?.trim();
            if (text && text.length < 50) tags.push(text);
          });

          // 提取描述
          let description = '';
          const paras = container.querySelectorAll('p, div');
          for (const p of Array.from(paras)) {
            const text = p.textContent?.trim() || '';
            if (text.length > 30 && text.length < 800) {
              description = text;
              break;
            }
          }

          // 清理名称
          name = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

          if (name && name.length >= 2 && name.length <= 100) {
            results.push({
              name: name.substring(0, 100),
              category: tags[0] || '未分类',
              description: description.substring(0, 500),
              url,
              ranking: results.length + 1,
              tags: tags.slice(0, 5),
            });

            if (results.length <= 5) {
              debugInfo.push(`\n工具 ${results.length}: ${name} -> ${url.substring(0, 40)}`);
            }
          }
        });

        debugInfo.push(`\n✓ 成功提取 ${results.length} 个工具`);
        return { tools: results, debugInfo };
      });

      // 打印调试信息
      console.log('\n调试信息:');
      result.debugInfo.forEach(info => console.log(`  ${info}`));
      console.log('');

      const tools = result.tools;

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
