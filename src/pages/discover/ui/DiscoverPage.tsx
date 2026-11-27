import {useState} from "react"
import {DiscoveryRecorder} from "@/features/discover"
import {DiscoveryCard} from "@/features/discover"
import {DiscoveryResult} from "@types"
import {Button} from "@/shared/ui/button"
import {usePageMeta} from "@/shared/lib/seo"

export function Discover() {
  usePageMeta({
    title: "Discover & tip artists — Donalyze",
    description: "Record a song, identify it, and tip the artist directly on Polkadot.",
    path: "/",
  })
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null)

  if (discoveryData) {
    return (
      <section className="py-4 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <p className="eyebrow text-acid">Match found</p>
            <p className="mt-1 font-display text-2xl">The moment, captured.</p>
          </div>
          <Button onClick={() => setDiscoveryData(null)} variant="outline" size="sm">
            ← Discover again
          </Button>
        </div>
        <DiscoveryCard
          discovery={discoveryData}
          onDiscoverAgain={() => setDiscoveryData(null)} />
      </section>
    )
  }

  return (
    <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-10">
      <div className="enter">
        <p className="eyebrow text-acid">Polkadot Hub TestNet</p>
        <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5.6rem)] leading-[0.9] tracking-[-0.04em] text-cream">
          Hear it. Tip it.
          <br />
          <span className="italic text-acid">On-chain.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          Record a few seconds of the song playing around you. Donalyze finds the artist
          and sends your tip straight to them — no label, no platform, no waiting.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          3–15s sample · 1% platform fee · direct to artist
        </p>
      </div>

      <div className="enter-2">
        <DiscoveryRecorder onDiscoveryComplete={setDiscoveryData} />
        <p
          className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground"
          data-testid="record-hint">
          Tap the record · keep the song playing
        </p>
      </div>
    </section>
  )
}
