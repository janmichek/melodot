import {StatisticsDashboard} from "@/components/StatisticsDashboard"
import {PageHeader} from "@/components/ui/page-header"

export function Statistics() {
  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Statistics"
        description="Platform activity and metrics"/>

      <StatisticsDashboard />
    </section>
  )
}
