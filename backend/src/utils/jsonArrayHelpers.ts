/**
 * JSON Array Helpers
 * Utilities for handling array fields stored as JSON strings in SQLite
 */

/**
 * Safely parse a JSON string to an array with error handling
 */
export function parseJsonArray(jsonString: string | null | undefined): any[] {
  if (!jsonString) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse JSON array:', jsonString, error);
    return [];
  }
}

/**
 * Safely stringify an array to JSON with fallback
 */
export function stringifyJsonArray(array: any[] | null | undefined): string {
  if (!array || !Array.isArray(array)) {
    return JSON.stringify([]);
  }

  try {
    return JSON.stringify(array);
  } catch (error) {
    console.warn('Failed to stringify array:', array, error);
    return JSON.stringify([]);
  }
}

/**
 * Transform a database result object by parsing JSON array fields
 */
export function parseJsonArrayFields<T extends Record<string, any>>(
  obj: T, 
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = parseJsonArray(result[field] as string) as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Transform an array of database result objects by parsing JSON array fields
 */
export function parseJsonArrayFieldsInList<T extends Record<string, any>>(
  list: T[], 
  fields: (keyof T)[]
): T[] {
  return list.map(item => parseJsonArrayFields(item, fields));
}