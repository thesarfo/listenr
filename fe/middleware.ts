/**
 * Edge middleware: route social crawlers to dynamic OG meta endpoint.
 * When Facebook, Twitter, Discord, etc. fetch /u/:username or /l/:listId,
 * we serve HTML with proper meta tags instead of the SPA.
 */
import { rewrite } from "@vercel/functions";

const CRAWLER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "Discordbot",
  "WhatsApp",
  "Slackbot",
  "TelegramBot",
  "Pinterest",
];

function isCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return CRAWLER_AGENTS.some((bot) => lower.includes(bot.toLowerCase()));
}

export const config = {
  matcher: ["/u/:path*", "/l/:path*"],
};

export default function middleware(request: Request) {
  const ua = request.headers.get("user-agent") || "";
  if (!isCrawler(ua)) {
    return next();
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const ogUrl = new URL("/api/og", request.url);
  ogUrl.searchParams.set("path", path);

  return rewrite(ogUrl);
}
