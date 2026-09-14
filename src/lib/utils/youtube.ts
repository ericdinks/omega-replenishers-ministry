/**
 * Pulls an 11-character YouTube video id out of whatever a teacher pastes
 * -- a full watch/share/embed URL, or the bare id itself. Returns null if
 * nothing recognizable is found.
 */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const vParam = url.searchParams.get("v");
      if (vParam && /^[\w-]{11}$/.test(vParam)) return vParam;

      const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (embedMatch) return embedMatch[1] ?? null;

      const shortsMatch = url.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shortsMatch) return shortsMatch[1] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}
