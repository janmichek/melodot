// @ts-check

import {
  Fragment,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {clsx} from "clsx";
import {Button} from "@/components/ui/button";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export const SidebarProvider = forwardRef(function SidebarProvider(
  {
    defaultOpen = true,
    open: controlledOpen,
    onOpenChange,
    className = "",
    style,
    children,
    ...props
  },
  ref
) {
  const [_open, _setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  const open = controlledOpen ?? _open;

  const setOpen = useCallback(
    (value) => {
      const next = typeof value === "function" ? value(open) : value;
      if (onOpenChange) {
        onOpenChange(next);
      } else {
        _setOpen(next);
      }
    },
    [onOpenChange, open]
  );

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
    }),
    [open, setOpen, openMobile]
  );

  const mergedStyle = {
    "--sidebar-width": SIDEBAR_WIDTH,
    "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
    ...style,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx("flex min-h-screen", className)}
        style={mergedStyle}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});

export const Sidebar = forwardRef(function Sidebar(
  { side = "left", collapsible = "offcanvas", className = "", children, ...props },
  ref
) {
  const { openMobile, setOpenMobile } = useSidebar();
  const positionClass = side === "left" ? "left-0" : "right-0";
  const hiddenClass = side === "left" ? "-translate-x-full" : "translate-x-full";

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        data-collapsible={collapsible}
        className={clsx("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      {openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <div
        data-mobile="true"
        data-collapsible={collapsible}
        className={clsx(
          "fixed inset-y-0 z-50 flex w-[--sidebar-width-mobile] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:hidden",
          positionClass,
          openMobile ? "translate-x-0" : hiddenClass,
          className
        )}
        {...props}
      >
        {children}
      </div>

      <div
        ref={ref}
        data-desktop="true"
        data-collapsible={collapsible}
        className={clsx(
          "hidden h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground lg:flex",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

export const SidebarTrigger = forwardRef(function SidebarTrigger(
  { className = "", onClick, ...props },
  ref
) {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={(event) => {
        if (onClick) onClick(event);
        setOpenMobile(!openMobile);
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
  );
});

export const SidebarInset = forwardRef(function SidebarInset(
  { className = "", ...props },
  ref
) {
  return (
    <main
      ref={ref}
      className={clsx("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
});

export const SidebarHeader = forwardRef(function SidebarHeader(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={clsx("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});

export const SidebarFooter = forwardRef(function SidebarFooter(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={clsx("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});

export const SidebarContent = forwardRef(function SidebarContent(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={clsx("flex-1 overflow-auto", className)}
      {...props}
    />
  );
});

export const SidebarGroup = forwardRef(function SidebarGroup(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={clsx("flex flex-col gap-1 p-2", className)}
      {...props}
    />
  );
});

export const SidebarGroupLabel = forwardRef(function SidebarGroupLabel(
  { className = "", ...props },
  ref
) {
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
  );
});

export const SidebarGroupContent = forwardRef(function SidebarGroupContent(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={clsx("flex flex-col gap-1", className)}
      {...props}
    />
  );
});

export const SidebarMenu = forwardRef(function SidebarMenu(
  { className = "", ...props },
  ref
) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={clsx("flex flex-col gap-1", className)}
      {...props}
    />
  );
});

export const SidebarMenuItem = forwardRef(function SidebarMenuItem(
  { className = "", ...props },
  ref
) {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={clsx("group/menu-item relative", className)}
      {...props}
    />
  );
});

export const SidebarMenuButton = forwardRef(function SidebarMenuButton(
  { asChild = false, isActive = false, className = "", children, ...props },
  ref
) {
  const sharedProps = {
    "data-sidebar": "menu-button",
    "data-active": isActive ? "true" : undefined,
    className: clsx(
      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      className
    ),
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...sharedProps,
      ...props,
      ref,
      className: clsx(children.props.className, sharedProps.className),
    });
  }

  return (
    <button ref={ref} {...sharedProps} {...props}>
      {children}
    </button>
  );
});

