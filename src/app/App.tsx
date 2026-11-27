import "./styles/App.css"
import {BrowserRouter, Link, Route, Routes} from "react-router-dom"
import {AppSidebar} from "@/widgets/app-shell"
import {SidebarInset, SidebarProvider} from "@/shared/ui/sidebar"
import {Discover} from "@/pages/discover"
import {Claim} from "@/pages/claim"
import {Donations} from "@/pages/donations"
import {Owner} from "@/pages/owner"
import {About} from "@/pages/about"
import {Statistics} from "@/pages/statistics"
import {AppHeader} from "@/widgets/app-shell"
import {useWeb3AuthContext} from "@/entities/contract"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function ConfigBanner() {
  const {contractAddress} = useWeb3AuthContext()
  if (contractAddress && contractAddress.toLowerCase() !== ZERO_ADDRESS) {return null}
  return (
    <div className="border-b border-coral/30 bg-coral/10 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
      Donate contract not configured · donations are disabled until the deployment address is set
    </div>
  )
}

function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <span>No middlemen</span> · Direct to artists · <span>1% platform fee</span> · Polkadot Hub
        TestNet · <span>Hear it. Tip it. On-chain.</span> · Built for the moment the song hits ·
      </div>
      <div className="marquee__track">
        <span>No middlemen</span> · Direct to artists · <span>1% platform fee</span> · Polkadot Hub
        TestNet · <span>Hear it. Tip it. On-chain.</span> · Built for the moment the song hits ·
      </div>
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="mt-32 border-t border-border/70 pt-8 pb-4">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-3xl leading-none">Gratitude, settled on-chain.</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Donalyze is an open-source music discovery and tipping experiment on Polkadot Hub
            TestNet. Test PAS only.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <Link to="/about" className="hover:text-acid">About</Link>
          <Link to="/statistics" className="hover:text-acid">Statistics</Link>
          <a
            href="https://github.com/janmichek/melodot"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-acid">
            GitHub
          </a>
          <a href="/llms.txt" className="hover:text-acid">llms.txt</a>
        </div>
      </div>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
        © {new Date().getFullYear()} Donalyze · Polkadot Hub TestNet · Not financial advice
      </p>
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider
        defaultOpen
        className="app-shell"
        style={
          {
            "--sidebar-width": "19rem",
            "--sidebar-width-mobile": "18rem",
          } as React.CSSProperties
        }>
        <SidebarInset className="app-frame bg-transparent">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-acid focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.16em] focus:text-ink">
            Skip to content
          </a>
          <AppHeader />
          <ConfigBanner />
          <Marquee />
          <div id="main" className="app-main">
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/claim" element={<Claim />} />
              <Route path="/about" element={<About />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/owner" element={<Owner />} />
            </Routes>
            <AppFooter />
          </div>
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
