import { api } from '@/lib/api-client'
import type { DashboardSummary, RankingItem } from '@/types/analytics'
import type { PaginatedResponse } from '@/types/api'

export async function getAnalyticsSummary(
  period: '30d' | '60d' | '90d' = '30d',
): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/analytics/dashboard', {
    params: { period },
  })
  return data
}

export async function getRanking(
  page: number = 1,
  period: '30d' | '60d' | '90d' = '30d',
): Promise<PaginatedResponse<RankingItem>> {
  const { data } = await api.get<PaginatedResponse<RankingItem>>(
    '/analytics/ranking',
    { params: { page, period } },
  )
  return data
}
