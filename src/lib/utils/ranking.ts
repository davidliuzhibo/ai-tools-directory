import { RankingWeights, DEFAULT_RANKING_WEIGHTS } from '@/types';

export interface RankingMetricsData {
  githubStars: number;
  productHuntVotes: number;
  appStoreRating: number; // 0-5
  monthlyActiveUsers: number;
}

/**
 * 计算工具的综合排名分数
 * @param metrics 排名指标数据
 * @param weights 权重配置(可选)
 * @returns 0-100的综合分数
 */
export function calculateRankingScore(
  metrics: RankingMetricsData,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): number {
  // 归一化处理 - 将各项指标标准化到0-1范围
  const normalizedGithub = normalizeValue(metrics.githubStars, 0, 10000);
  const normalizedPH = normalizeValue(metrics.productHuntVotes, 0, 1000);
  const normalizedRating = normalizeValue(metrics.appStoreRating, 0, 5);
  const normalizedMAU = normalizeValue(metrics.monthlyActiveUsers, 0, 1000000);

  // 加权计算
  const score =
    normalizedGithub * weights.githubStars +
    normalizedPH * weights.productHuntVotes +
    normalizedRating * weights.appStoreRating +
    normalizedMAU * weights.monthlyActiveUsers;

  // 转换为0-100分数
  return Math.round(score * 100);
}

/**
 * 归一化函数 - 将值映射到0-1范围
 * @param value 原始值
 * @param min 最小值
 * @param max 最大值
 * @returns 0-1之间的值
 */
function normalizeValue(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

/**
 * 根据多个工具的指标计算排名
 * @param toolsMetrics 工具指标数组
 * @returns 按分数降序排列的工具ID数组
 */
export function rankTools(
  toolsMetrics: Array<{ id: string; metrics: RankingMetricsData }>
): Array<{ id: string; score: number }> {
  return toolsMetrics
    .map((tool) => ({
      id: tool.id,
      score: calculateRankingScore(tool.metrics),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * 获取指定分类的Top N工具
 * @param tools 工具列表
 * @param topN 取前N个
 * @returns Top N工具数组
 */
export function getTopNTools<T extends { rankingScore: number }>(
  tools: T[],
  topN: number = 5
): T[] {
  return tools
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, topN);
}
