import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format post dates by relative time:
export function formatRelativeDate(from: Date) {
  // Retrieve current time
  const currentDate = new Date();
  // Format and display time of posts by relative time
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    // if post is less than a year old we display post data by year and day only
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      // if post is older than a year, we display the full month day year
      return formatDate(from, "MMM d, yyyy");
    }
  }
}

// formatting of large number values: Trending Projects
export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
