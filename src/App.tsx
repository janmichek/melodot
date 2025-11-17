import "./App.css"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {AppSidebar} from "@/components/AppSidebar"
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import {Discover} from "@/pages/Discover"
import {Claim} from "@/pages/Claim"
import {Donations} from "@/pages/Donations"
import {Owner} from "@/pages/Owner"
import {About} from "@/pages/About"
import {Statistics} from "@/pages/Statistics"
import {AppHeader} from "@/components/AppHeader"

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider
        defaultOpen
        style={
          {
            "--sidebar-width": "13rem",
            "--sidebar-width-mobile": "9rem",
          } as React.CSSProperties
        }>
        <SidebarInset className="bg-background flex flex-col min-h-0">
          <AppHeader />
          <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0 mx-auto w-full max-w-[1200px]">
            <main className="flex flex-1 flex-col min-h-0">
              <Routes>
                <Route path="/" element={<Discover />} />
                <Route path="/donations" element={<Donations />} />
                <Route path="/claim" element={<Claim />} />
                <Route path="/about" element={<About />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/owner" element={<Owner />} />
              </Routes>
            </main>
          </div>
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
