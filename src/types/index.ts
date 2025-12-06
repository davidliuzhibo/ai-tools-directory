// 工具相关类型
export interface ToolCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  teamOrigin: 'DOMESTIC' | 'OUTBOUND' | 'OVERSEAS';
  pricingType: 'FREE' | 'PAID' | 'FREEMIUM';
  rankingScore: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  platformAvailability?: {
    pc?: boolean;
    ios?: boolean;
    android?: boolean;
    web?: boolean;
  };
}

// 分类相关类型
export interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count: {
    tools: number;
  };
}

// 爬虫数据类型
export interface ScrapedTool {
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  githubUrl?: string;
  productHuntUrl?: string;
  stars?: number;
  votes?: number;
}

// 排名权重配置
export interface RankingWeights {
  githubStars: number;
  productHuntVotes: number;
  appStoreRating: number;
  monthlyActiveUsers: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  githubStars: 0.3,
  productHuntVotes: 0.2,
  appStoreRating: 0.2,
  monthlyActiveUsers: 0.3,
};
