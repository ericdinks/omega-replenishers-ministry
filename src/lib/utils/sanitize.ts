/**
 * Strips control characters and collapses excess whitespace from
 * free-text user input before it is validated and persisted. This is
 * defense in depth against stored XSS / log injection; React already
 * escapes output on render, but we never want raw control bytes or
 * markup-like payloads sitting in the database.
 */

const HTML_TAGS = /<[^>]*>/g;
const EXCESS_WHITESPACE = /\s{3,}/g;
const TAB_NEWLINE_CR = new Set([9, 10, 13]);

function stripControlCharacters(input: string): string {
  let result = "";
  for (const char of input) {
    const code = char.charCodeAt(0);
    const isControl = (code <= 31 || code === 127) && !TAB_NEWLINE_CR.has(code);
    if (!isControl) {
      result += char;
    }
  }
  return result;
}

export function sanitizeText(input: string): string {
  return stripControlCharacters(input)
    .replace(HTML_TAGS, "")
    .trim()
    .replace(EXCESS_WHITESPACE, "  ");
}

export function sanitizeEmail(input: string): string {
  return sanitizeText(input).toLowerCase();
}
