/**
 * Cryptographic utilities for Schreibmaschine
 *
 * Provides secure ID generation and other crypto functions
 */

/**
 * Generate a cryptographically secure UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a short, URL-safe ID for group short URLs
 * Format: 2-3 characters, base62 (alphanumeric)
 */
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.random() > 0.5 ? 2 : 3; // Random length between 2-3

  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    const index = array[i];
    if (index !== undefined) {
      result += chars[index % chars.length];
    }
  }

  return result;
}

/**
 * Generate a secure session token for browser cookies
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure token for admin sessions
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple hash function for non-cryptographic purposes
 * Useful for creating deterministic IDs from strings
 */
export function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate short ID format
 */
export function isValidShortId(shortId: string): boolean {
  const shortIdRegex = /^[a-zA-Z0-9]{2,3}$/;
  return shortIdRegex.test(shortId);
}
