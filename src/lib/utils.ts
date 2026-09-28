import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rejects empty input and low-effort junk (".", "123", "...", whitespace)
 * while staying open to any language/script — requires at least one actual
 * letter (Unicode-aware) plus a minimum length.
 */
export function isMeaningfulText(value: string, minLength = 2): boolean {
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  return /\p{L}/u.test(trimmed);
}
