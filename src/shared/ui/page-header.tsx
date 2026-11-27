import {clsx} from "clsx"
import type {PageHeaderProps} from "@types"

export function PageHeader({title, description, children, className}: PageHeaderProps) {
  return (
    <header className={clsx("page-heading", className)}>
      <span className="page-heading__eyebrow">Donalyze / On-chain music</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="page-heading__title">{title}</h1>
        {children && <div className="shrink-0">{children}</div>}
      </div>
      {description && <p className="page-heading__description">{description}</p>}
    </header>
  )
}
