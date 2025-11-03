import { useState, useEffect } from 'react';
import { isAddress } from 'viem';

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
    <div className={`address-input-wrapper ${className}`}>
      {label && (
        <label className="address-input-label">{label}</label>
      )}

      <div className="address-input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`address-input ${
            showValidation && value ? (isValid ? 'address-input-valid' : 'address-input-invalid') : ''
          }`}
          aria-invalid={showValidation && value ? !isValid : undefined}
          aria-describedby={error ? 'address-error' : undefined}
        />

        {value && (
          <div className="address-input-actions">
            <button
              type="button"
              onClick={handleCopy}
              className={`address-input-action ${isCopied ? 'address-action-copied' : ''}`}
              title="Copy address"
              disabled={disabled}
            >
              {isCopied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              type="button"
              onClick={handlePaste}
              className="address-input-action"
              title="Paste from clipboard"
              disabled={disabled}
            >
              📌 Paste
            </button>
          </div>
        )}
      </div>

      {showValidation && value && !isValid && (
        <p className="address-input-validation-error">
          ❌ Invalid address format. Please enter a valid Ethereum address (0x...)
        </p>
      )}

      {showValidation && isValid && value && (
        <p className="address-input-validation-success">
          ✓ Valid address
        </p>
      )}

      {error && (
        <p className="address-input-error" id="address-error">
          ❌ {error}
        </p>
      )}
    </div>
  );
}
