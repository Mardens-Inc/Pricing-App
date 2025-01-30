/**
 * Recursively converts all keys in a provided object from snake_case to camelCase.
 * @param obj - The object to convert.
 * @returns A new object with camelCase keys.
 */
export function convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToCamelCase(item));
    } else if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                snakeToCamel(key),
                convertKeysToCamelCase(value)
            ])
        );
    }
    return obj;
}

/**
 * Converts a snake_case string to camelCase.
 * @param str - The snake_case string to convert.
 * @returns The camelCase version of the input string.
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}