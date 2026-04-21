import {PageHeader} from "@/components/ui/page-header"

export function About() {
  return (
    <section className="space-y-6 pb-6">
      <PageHeader title="About"/>

      <div className="lg:max-w-1/2 space-y-4">
        <p className="text-base text-muted-foreground leading-relaxed">
          You know that feeling—when a song hits you <span className="text-foreground font-medium">just right</span>, and you're immersed in pure positivity and gratitude for the artist who created it.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          But expressing that appreciation? <span className="text-foreground font-medium">It's complicated.</span> Streaming royalties are opaque and minuscule. Social media feels distant. There's no direct way to say <span className="italic">"thank you"</span> in the moment when the music moves you.
        </p>
        <p className="text-base leading-relaxed">
          <span className="font-semibold">What if you could reward artists instantly?</span>
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          That's Melodot. Discover song by audio recognition and tip the artist <span className="text-foreground font-medium">directly and instantly</span>. Just pure appreciation, delivered the moment you feel it.
        </p>
      </div>

      <PageHeader title="How to use Melodot" className="mt-8"/>

      <div className="lg:max-w-1/2 space-y-3">
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">1</span>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Log in</span>
            — Connect with Web3 wallet or social media account.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">2</span>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Get test funds</span>
            — Visit the{' '}
            <a
              href="https://faucet.polkadot.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline">
              Polkadot faucet
            </a>{' '}
            to receive testnet tokens.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">3</span>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Discover</span>
            — Record song you hear. Melodot recognizes the artist.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">4</span>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Select amount</span>
            — Choose which artists to tip and set your donation.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">5</span>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Donate</span>
            — Send donation directly to artists via smart contract.
          </p>
        </div>
      </div>
    </section>
  )
}
