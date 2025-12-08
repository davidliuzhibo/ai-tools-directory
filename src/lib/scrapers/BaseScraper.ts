import axios from 'axios';

export interface ScraperConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ToolData {
  name: string;
  slug: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  githubUrl?: string;
  githubStars?: number;
  productHuntUrl?: string;
  productHuntVotes?: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected axios;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      timeout: 10000,
      retries: 3,
      ...config,
    };

    this.axios = axios.create({
      timeout: this.config.timeout,
      headers: this.config.headers || {},
    });
  }

  /**
   * 主要的抓取方法
   */
  abstract scrape(input: any): Promise<any>;

  /**
   * 验证数据
   */
  protected validate(data: any): boolean {
    return !!data;
  }

  /**
   * 带重试的请求
   */
  protected async fetchWithRetry(
    url: string,
    retries: number = this.config.retries || 3
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.axios.get(url);
        return response.data;
      } catch (error: any) {
        console.log(`尝试 ${i + 1}/${retries} 失败: ${url}`);

        if (i === retries - 1) {
          throw error;
        }

        // 等待后重试
        await this.sleep(1000 * (i + 1));
      }
    }
  }

  /**
   * 延迟函数
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 清理和格式化数据
   */
  protected cleanData(data: any): any {
    // 移除空值和 undefined
    return Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null && v !== '')
    );
  }
}
