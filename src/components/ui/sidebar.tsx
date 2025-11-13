import * as React from "react"
import {clsx} from "clsx"
import {Button} from "@/components/ui/button";

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "4rem"

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
} | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [_open, _setOpen] = React.useState(defaultOpen)
    const [openMobile, setOpenMobile] = React.useState(false)

    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
      },
      [setOpenProp, open]
    )

    return (
      <SidebarContext.Provider
        value={{
          open,
          setOpen,
          openMobile,
          setOpenMobile,
        }}
      >
        <div
          ref={ref}
          className={clsx("flex h-screen", className)}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(({ side = "left", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { open, openMobile, setOpenMobile } = useSidebar()

  const isIconCollapsible = collapsible === "icon"
  const isDesktopCollapsed = isIconCollapsible ? !open : false

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        data-desktop="true"
        data-state="expanded"
        data-collapsible="none"
        className={clsx(
          "sidebar-wrapper group/sidebar-wrapper flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm"
          style={{
            backgroundColor: "var(--sidebar-overlay)",
            WebkitBackdropFilter: "blur(2px)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        ref={ref}
        data-mobile="true"
        data-state={openMobile ? "expanded" : "collapsed"}
        data-collapsible={collapsible}
        className={clsx(
          "sidebar-wrapper group/sidebar-wrapper fixed inset-y-0 z-50 flex w-[--sidebar-width-mobile] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:hidden",
          side === "left" ? "left-0" : "right-0",
          openMobile
            ? "translate-x-0"
            : side === "left"
            ? "-translate-x-full"
            : "translate-x-full",
          className
        )}
        {...props}
      >
        {children}
      </div>

      {/* Desktop sidebar */}
      <div
        ref={ref}
        data-desktop="true"
        data-state={isDesktopCollapsed ? "collapsed" : "expanded"}
        data-collapsible={collapsible}
        className={clsx(
          "sidebar-wrapper group/sidebar-wrapper hidden h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out lg:flex",
          isIconCollapsible
            ? isDesktopCollapsed
              ? "w-[--sidebar-width-icon]"
              : "w-[--sidebar-width]"
            : "w-[--sidebar-width]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      className={clsx(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9",
        className
      )}
      aria-expanded={openMobile || open}
      onClick={(event) => {
        onClick?.(event)

        const targetWindow = event.currentTarget.ownerDocument?.defaultView
        const isDesktop = targetWindow?.matchMedia?.("(min-width: 1024px)").matches ?? false

        if (isDesktop) {
          setOpen((prev) => !prev)
          return
        }

        setOpenMobile(!openMobile)
      }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" x2="21" y1="6" y2="6" />
        <line x1="3" x2="21" y1="12" y2="12" />
        <line x1="3" x2="21" y1="18" y2="18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={clsx(
        "flex-1 flex flex-col min-w-0",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={clsx("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={clsx("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={clsx("flex-1 overflow-auto", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={clsx("flex flex-col gap-1 p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={clsx(
        "flex items-center px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={clsx("flex flex-col gap-1", className)}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={clsx("flex flex-col gap-1", className)}
      {...props}
    />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={clsx("group/menu-item relative", className)}
      {...props}
    />
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
  }
>(({ asChild = false, isActive = false, className, children, ...props }, ref) => {
  const baseClasses = clsx(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
    "text-sidebar-foreground/90 hover:text-primary data-[active=true]:text-primary",
    "hover:bg-sidebar-accent/30 data-[active=true]:bg-sidebar-accent/40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      "data-sidebar": "menu-button",
      "data-active": isActive,
      className: clsx(baseClasses, className, children.props.className),
    })
  }

  return (
    <button
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      className={clsx(baseClasses, className)}
      {...props}
    >
      {children}
    </button>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
}
