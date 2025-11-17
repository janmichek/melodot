import {isAddress} from 'viem'
import {clsx} from 'clsx'
import {Input} from '@/components/ui/input'
import type {AddressInputProps} from '@types'

/**
 * AddressInput Component
 *
 * A polkadot-ui inspired address input component with:
 * - Real-time EVM address validation (0x... format)
 * - Visual feedback for valid/invalid addresses
 * - Accessibility features
 */
export function AddressInput({
  value,
  onChange,
  placeholder = 'Enter recipient address (0x...)',
  label,
  error,
  isDisabled = false,
  showValidation = true,
  className = '',
}: AddressInputProps) {
  const isValid = value ? isAddress(value as `0x${string}`) : null

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    if (pastedText) {
      // Trim whitespace and update the value
      onChange(pastedText.trim())
    }
  }

  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
      )}

      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onCopy={(e) => e.preventDefault()}
          placeholder={placeholder}
          disabled={isDisabled}
          className={clsx(
            showValidation && value ? (isValid ? 'border-green-500' : 'border-blue-500') : ''
          )}
          aria-invalid={showValidation && value ? !isValid : undefined}
          aria-describedby={error ? 'address-error' : undefined}/>
      </div>

      {showValidation && value && !isValid && (
        <p className="text-sm text-destructive">
          ❌ Invalid address format. Please enter a valid Ethereum address (0x...)
        </p>
      )}

      {showValidation && isValid && value && (
        <p className="text-sm text-green-600">
          ✓ Valid address
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" id="address-error">
          ❌ {error}
        </p>
      )}
    </div>
  )
}
