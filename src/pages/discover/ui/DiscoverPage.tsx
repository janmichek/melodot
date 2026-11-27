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
          onDiscoverAgain={() => setDiscoveryData(null)}/>
      </section>
    )
  }

  return (
    <section className="discover-page">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="enter">
          <p className="eyebrow text-acid">Now listening / Polkadot Hub</p>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,8vw,7.2rem)] leading-[0.84] tracking-[-0.05em] text-cream">
            Hear it.
            <br />
            Tip it.
            <br />
            <span className="whitespace-nowrap italic text-acid">On-chain.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            A song hits. You want to say thank you. Donalyze listens for a few seconds,
            finds the artist, and sends your gratitude straight to them — no label, no
            platform, no waiting.
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-5">
            <div>
              <dt className="eyebrow">Sample</dt>
              <dd className="mt-1 font-display text-2xl">3–15s</dd>
            </div>
            <div>
              <dt className="eyebrow">Platform fee</dt>
              <dd className="mt-1 font-display text-2xl">1%</dd>
            </div>
            <div>
              <dt className="eyebrow">Settlement</dt>
              <dd className="mt-1 font-display text-2xl">Direct</dd>
            </div>
          </dl>

          <p className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            Testnet only · PAS · chain 420420417
          </p>
        </div>

        <div className="enter-2 relative">
          <div className="absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(215,255,95,0.12),transparent_65%)]" />
          <DiscoveryRecorder onDiscoveryComplete={setDiscoveryData} />
          <p
            className="mt-8 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground"
            data-testid="record-hint">
            Tap the record · keep the song playing · we do the rest
          </p>
        </div>
      </div>
    </section>
  )
}
