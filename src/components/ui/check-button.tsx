import {Checkbox} from "@/components/ui/checkbox"
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
          inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium transition-all
          ${checked
            ? "border-blue-600 bg-blue-600 text-white dark:border-blue-700 dark:bg-blue-700"
            : "border-border bg-background hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
          }
        `}>
        {children}
      </span>
    </label>
  )
}
