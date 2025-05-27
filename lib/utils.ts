// Import types and functions to handle dynamic class names
import { type ClassValue, clsx } from 'clsx'; // clsx helps conditionally join classNames
import { twMerge } from 'tailwind-merge'; // twMerge resolves Tailwind class conflicts

// Utility function to combine class names cleanly
export function cn(...inputs: ClassValue[]) {
  // First use clsx to build a string of class names from various input types,
  // then use twMerge to resolve any conflicting Tailwind classes
  return twMerge(clsx(inputs));
}
