import {Checkbox} from "@/shared/ui/checkbox"
import type {CheckButtonProps} from "@types"

export function CheckButton({
  id,
  checked,
  onChange,
  disabled = false,
  children,
}: CheckButtonProps) {
  return (
    <label
      htmlFor={id}
      className={`relative inline-flex items-center ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}>
      <Checkbox
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"/>
      <span
        className={`
          inline-flex min-h-10 items-center justify-center rounded-[2px] border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all
          ${checked
            ? "border-acid bg-acid text-ink shadow-[3px_3px_0_0_rgba(215,255,95,0.16)]"
            : "border-border bg-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground"
          }
        `}>
        {children}
      </span>
    </label>
  )
}
