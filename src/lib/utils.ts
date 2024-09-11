import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

/**
 * Utility functions for formatting, merging class names, and slugifying strings.
 *
 * This module provides utility functions for:
 * - Merging class names using Tailwind CSS (with `clsx` and `twMerge`).
 * - Formatting dates in different styles (relative, short format, or long format).
 * - Compacting large numbers into shorter, more readable forms.
 * - Converting strings into slugs suitable for URLs.
 */

// Combines Tailwind class names, resolving conflicts and optimizing for clean outputs.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
  // `clsx` is used to conditionally join class names, while `twMerge` ensures Tailwind utility classes are correctly merged without duplication.
}

/**
 * Format post dates by relative time or date:
 * This function provides two styles for post dates:
 * - If the post is less than a day old, it returns the relative time (e.g., "2 hours ago").
 * - If the post is older but within the same year, it returns the month and day (e.g., "Aug 15").
 * - If the post is from a previous year, it returns the full date (e.g., "Aug 15, 2023").
 */
export function formatRelativeDate(from: Date) {
  // Retrieve current time
  const currentDate = new Date();

  // Format time relative to the current time if within the last 24 hours
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    // For posts within the same year, format as "Month day" (e.g., "Aug 15")
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      // For posts older than a year, return full date including the year (e.g., "Aug 15, 2023")
      return formatDate(from, "MMM d, yyyy");
    }
  }
}

/**
 * Format large numbers into a more readable form:
 * This function takes a large number and converts it into a compact notation
 * (e.g., 1,500 becomes "1.5K", 1,000,000 becomes "1M").
 */
export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact", // Compact notation to shorten large numbers (e.g., K for thousands, M for millions).
    maximumFractionDigits: 1, // Show up to 1 decimal place for better readability.
  }).format(n);
}

/**
 * Converts a string into a URL-friendly slug:
 * This function takes an input string, converts it to lowercase, replaces spaces with hyphens,
 * and removes any non-alphanumeric characters (except for hyphens).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase() // Convert the string to lowercase for URL compatibility
    .replace(/ /g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove all non-alphanumeric characters except hyphens
}
