import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a user-friendly error message from wagmi/viem errors.
 * Wagmi errors typically have `message` or `shortMessage` properties.
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (!error) {
    return fallback
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
    if ('shortMessage' in error && typeof error.shortMessage === 'string') {
      return error.shortMessage
    }
  }
  
  return fallback
}

