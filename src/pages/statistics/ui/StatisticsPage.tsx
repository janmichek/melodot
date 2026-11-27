import {StatisticsDashboard} from "@/widgets/statistics"
import {PageHeader} from "@/shared/ui/page-header"

import {usePageMeta} from "@/shared/lib/seo"

export function Statistics() {
  usePageMeta({
    title: "Platform statistics — Donalyze",
    description: "Live donation totals, artist counts, and platform fee metrics on Polkadot Hub TestNet.",
    path: "/statistics",
  })
  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Statistics"
        description="Platform activity and metrics"/>

      <StatisticsDashboard />
    </section>
  )
}
