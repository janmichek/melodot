import {clsx} from "clsx"
import type {PageHeaderProps} from "@types"

export function PageHeader({title, description, children, className}: PageHeaderProps) {
  return (
    <header className={clsx("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </header>
  )
}

