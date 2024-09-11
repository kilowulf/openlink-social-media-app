import ky from "ky";

/**
 * KyInstance Configuration:
 *
 * This code creates a customized instance of the `ky` HTTP client,
 * which extends the built-in Fetch API to automatically handle parsing JSON responses.
 * It specifically looks for date-like fields in the JSON response (fields ending in "At")
 * and converts them into JavaScript Date objects.
 *
 * This simplifies handling of dates in API responses and ensures consistency
 * across the application when dealing with timestamps or date-related fields.
 */

/**
 * Creates a new ky instance that automatically converts fields ending with "At" to Date objects.
 *
 * - `parseJson` is a custom function used to parse the JSON response.
 * - When the key of a property ends with "At", its value is converted to a `Date` object.
 * - All other fields are left unchanged.
 */
const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value); // Convert date-like fields
      return value; // Leave other fields as-is
    }),
});

export default kyInstance;
