/**
 * Dynamic Open Graph meta tags for profile and list share links.
 * Serves HTML with OG meta for crawlers (Facebook, Twitter, Discord, etc.).
 */

const DEFAULT_OG_IMAGE =
  "https://og-image-generator-prod.s3.amazonaws.com/ai/generated/63845d00-0608-11f1-9240-57294a405c33/6a206ebc-92af-4797-ae40-7ac986f2fc09.png";

function metaTags(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return `
<meta property="og:url" content="${opts.url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(opts.title)}">
<meta property="og:description" content="${escapeHtml(opts.description)}">
<meta property="og:image" content="${opts.image}">
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${opts.url}">
<meta name="twitter:title" content="${escapeHtml(opts.title)}">
<meta name="twitter:description" content="${escapeHtml(opts.description)}">
<meta name="twitter:image" content="${opts.image}">
`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(t: string, d: string, meta: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(t)}</title>
  <meta name="description" content="${escapeHtml(d)}">
  ${meta}
</head>
<body><p>Redirecting...</p><script>window.location.replace("/");</script></body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";
  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : url.origin.replace(/\/api.*$/, "");
  const apiBase = process.env.VITE_API_URL || process.env.API_URL || "";

  let title = "Listenr – Your Personal Music Diary";
  let description =
    "Log albums, write reviews, and build your music diary. Track what you listen to and discover new music.";
  let image = DEFAULT_OG_IMAGE;

  const profileMatch = path.match(/^\/u\/([^/]+)\/?$/);
  const listMatch = path.match(/^\/l\/([^/]+)\/?$/);

  if (profileMatch && apiBase) {
    const username = profileMatch[1];
    try {
      const res = await fetch(
        `${apiBase}/api/v1/users/by-username/${encodeURIComponent(username)}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const user = await res.json();
        const displayName = user.username || "Someone";
        title = `${displayName}'s Profile on Listenr`;
        description = `Check out ${displayName}'s music diary on Listenr. ${user.reviews_count ?? 0} reviews, ${user.lists_count ?? 0} lists.`;
        if (user.avatar_url) image = user.avatar_url;
      }
    } catch {
      // Use defaults
    }
  } else if (listMatch && apiBase) {
    const listId = listMatch[1];
    try {
      const res = await fetch(
        `${apiBase}/api/v1/lists/${encodeURIComponent(listId)}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const list = await res.json();
        const listTitle = list.title || "A list";
        const owner = list.owner_username || "Someone";
        title = `${listTitle} on Listenr`;
        description = `Check out "${listTitle}" by ${owner} on Listenr. ${list.albums_count ?? 0} albums.`;
        const firstCover =
          list.cover_url ||
          list.albums?.[0]?.cover_url ||
          list.preview_albums?.[0]?.cover_url;
        if (firstCover) image = firstCover;
      }
    } catch {
      // Use defaults
    }
  }

  const fullUrl = `${siteUrl}${path || "/"}`;
  const meta = metaTags({ title, description, image, url: fullUrl });
  const body = html(title, description, meta);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
