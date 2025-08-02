/**
 * URL slug generation utilities for Schreibmaschine
 *
 * Handles German characters and creates clean, SEO-friendly URLs
 */

/**
 * Convert text to URL-friendly slug
 * Handles German umlauts and special characters
 *
 * @param text - The text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      // Replace German umlauts and special characters
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/À/g, 'a')
      .replace(/Á/g, 'a')
      .replace(/Â/g, 'a')
      .replace(/Ã/g, 'a')
      .replace(/à/g, 'a')
      .replace(/á/g, 'a')
      .replace(/â/g, 'a')
      .replace(/ã/g, 'a')
      .replace(/È/g, 'e')
      .replace(/É/g, 'e')
      .replace(/Ê/g, 'e')
      .replace(/Ë/g, 'e')
      .replace(/è/g, 'e')
      .replace(/é/g, 'e')
      .replace(/ê/g, 'e')
      .replace(/ë/g, 'e')
      .replace(/Ì/g, 'i')
      .replace(/Í/g, 'i')
      .replace(/Î/g, 'i')
      .replace(/Ï/g, 'i')
      .replace(/ì/g, 'i')
      .replace(/í/g, 'i')
      .replace(/î/g, 'i')
      .replace(/ï/g, 'i')
      .replace(/Ò/g, 'o')
      .replace(/Ó/g, 'o')
      .replace(/Ô/g, 'o')
      .replace(/Õ/g, 'o')
      .replace(/ò/g, 'o')
      .replace(/ó/g, 'o')
      .replace(/ô/g, 'o')
      .replace(/õ/g, 'o')
      .replace(/Ù/g, 'u')
      .replace(/Ú/g, 'u')
      .replace(/Û/g, 'u')
      .replace(/Ü/g, 'u')
      .replace(/ù/g, 'u')
      .replace(/ú/g, 'u')
      .replace(/û/g, 'u')
      .replace(/ü/g, 'u')
      // Replace any non-alphanumeric characters with underscores
      .replace(/[^a-z0-9]+/g, '_')
      // Remove leading and trailing underscores
      .replace(/^_+|_+$/g, '')
  );
}

/**
 * Create a short version of a slug for compact URLs
 * Takes the first letter of each word, up to 6 characters
 *
 * @param text - The text to create a short slug from
 * @returns Short slug (2-6 characters)
 */
export function createShortSlug(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) return 'slug';

  // Take first 2 characters of first word, then first character of remaining words
  let shortSlug = words[0]?.substring(0, 2) ?? '';

  for (let i = 1; i < words.length && shortSlug.length < 6; i++) {
    shortSlug += words[i]?.charAt(0) ?? '';
  }

  return shortSlug;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}_${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Convert slug back to readable text
 * Capitalizes first letter of each word
 *
 * @param slug - The slug to convert
 * @returns Readable text
 */
export function slugToText(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
