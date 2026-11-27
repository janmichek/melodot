import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import {clsx} from "clsx"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] transition-[transform,background-color,border-color,color] duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground shadow-[3px_3px_0_0_rgba(215,255,95,0.18)] hover:-translate-y-0.5 hover:bg-primary/90",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent text-foreground hover:-translate-y-0.5 hover:border-foreground/50 hover:text-acid",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:border-foreground/40",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
        link: "text-acid underline-offset-4 hover:underline",
        success:
          "border border-primary bg-primary text-primary-foreground shadow-[3px_3px_0_0_rgba(215,255,95,0.18)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        xl: "h-12 px-7 has-[>svg]:px-5 text-xs",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
        "icon-xl": "size-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={clsx(buttonVariants({variant, size, className}))}
      {...props}/>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Variant exported for library usage
export {Button, buttonVariants}
