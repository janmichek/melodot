import {Link} from "react-router-dom"
import {SidebarTrigger} from "@/shared/ui/sidebar"
import {ModeToggle} from "@/shared/ui/mode-toggle"
import {Logo} from "@/shared/ui/logo"
import {passetHub} from "@/shared/config"

export function AppHeader() {
  return (
    <header className="app-header" data-testid="header">
      <div className="app-header__inner">
        <Link to="/" className="brand-lockup" aria-label="Donalyze home">
          <Logo size="sm" className="brand-lockup__mark" />
          <span className="brand-lockup__word">Donalyze</span>
          <span className="brand-lockup__meta">Hear it. Tip it. On-chain.</span>
        </Link>

        <div className="header-actions">
          <span className="chain-badge">
            {passetHub.name} · {passetHub.id}
          </span>
          <ModeToggle />
          <SidebarTrigger />
        </div>
      </div>
    </header>
  )
}
