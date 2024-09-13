import { useEffect, useState } from "react";

/**
 * useDebounce Hook:
 *
 * This hook is used to debounce a value. Debouncing is a technique used to limit the number of times a function is executed,
 * particularly useful in cases like search inputs where a user might type quickly, and you want to delay processing until the user
 * stops typing. The hook returns a debounced value that only updates after the specified delay.
 *
 * Key Features:
 * - Limits the rate at which the input value updates.
 * - Helps in preventing frequent re-renders or API calls while the user is typing.
 *
 * @param value - The input value that needs to be debounced.
 * @param delay - The delay (in milliseconds) after which the value should be updated. Defaults to 250ms.
 * @returns The debounced value, which only updates after the specified delay.
 */
export default function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value); // State to hold the debounced value.

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Update the debounced value after the delay.
    }, delay);

    // Cleanup function: Clears the timeout if the effect runs again (e.g., when value or delay changes).
    return () => clearTimeout(handler);
  }, [value, delay]); // Re-run the effect whenever 'value' or 'delay' changes.

  return debouncedValue; // Return the debounced value.
}
