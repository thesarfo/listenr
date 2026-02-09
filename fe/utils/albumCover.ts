/**
 * Album cover URL with fallback when no official cover is available.
 * Uses a consistent placeholder based on album title/artist instead of random images.
 * For real covers, run: python -m scripts.seed_albums --clear (fetches from Cover Art Archive).
 */
export function getAlbumCoverUrl(
  coverUrl: string | null | undefined,
  title?: string,
  artist?: string
): string {
  if (coverUrl) return coverUrl;
  const text = ([title, artist].filter(Boolean).join(' - ') || 'Album').slice(0, 50);
  const encoded = encodeURIComponent(text);
  return `https://ui-avatars.com/api/?name=${encoded}&background=1a1a2e&color=92c9a4&size=400`;
}
