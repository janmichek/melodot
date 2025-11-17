import {SidebarTrigger} from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      data-testid="header">
      <div className="flex items-center justify-end px-4 py-3">
        <SidebarTrigger className="ml-auto" />
      </div>
    </header>
  )
}
