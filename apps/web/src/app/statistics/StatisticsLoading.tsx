import { Card } from '@/components/Card'
import PageTitle from '@/components/PageTitle'
import StatisticsSkeleton from './StatisticsSkeleton'

export default function StatisticsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle spacing={8}>Estadísticas</PageTitle>
      <div className="mb-6 h-[42px] animate-pulse rounded-xl bg-gray-200" aria-hidden="true" />
      <Card padding={0}>
        <StatisticsSkeleton />
      </Card>
    </div>
  )
}
