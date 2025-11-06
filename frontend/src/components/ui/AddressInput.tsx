import { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  disabled?: boolean;
  showValidation?: boolean;
  className?: string;
}

/**
 * AddressInput Component
 *
 * A polkadot-ui inspired address input component with:
 * - Real-time EVM address validation (0x... format)
 * - Visual feedback for valid/invalid addresses
 * - Formatted display with copy functionality
 * - Accessibility features
 */
export function AddressInput({
  value,
  onChange,
  placeholder = 'Enter recipient address (0x...)',
  label,
  error,
  disabled = false,
  showValidation = true,
  className = '',
}: AddressInputProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isValid = value ? isAddress(value as `0x${string}`) : null;

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
      )}

      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            showValidation && value ? (isValid ? 'border-green-500' : 'border-red-500') : ''
          )}
          aria-invalid={showValidation && value ? !isValid : undefined}
          aria-describedby={error ? 'address-error' : undefined}
        />

        {value && (
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              onClick={handleCopy}
              variant="outline"
              size="sm"
              title="Copy address"
              disabled={disabled}
            >
              {isCopied ? '✓ Copied' : '📋 Copy'}
            </Button>
            <Button
              type="button"
              onClick={handlePaste}
              variant="outline"
              size="sm"
              title="Paste from clipboard"
              disabled={disabled}
            >
              📌 Paste
            </Button>
          </div>
        )}
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
  );
}
