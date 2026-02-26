/**
 * SSR Meta Injection
 * 
 * Replaces placeholder tokens in the HTML template with dynamic tenant data
 * before sending the response to the browser. This eliminates the
 * "Flash of Default Title" on tenant landing pages.
 */

import { getTenantBySlug } from "../db";

// Default fallback values for non-tenant pages (admin, login, etc.)
const PLATFORM_DEFAULTS = {
  title: "Pedidos Online",
  description: "Plataforma de pedidos online para restaurantes e estabelecimentos gastronômicos.",
  ogTitle: "Pedidos Online",
  ogDescription: "Faça seu pedido online de forma rápida e prática.",
  ogImage: "",
};

// Routes that should NOT trigger tenant lookup
const EXCLUDED_PREFIXES = [
  "/api/",
  "/admin",
  "/super-admin",
  "/login",
  "/assets/",
  "/src/",
  "/@",
  "/node_modules/",
  "/icons/",
  "/manifest.json",
  "/favicon",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Determines if a URL path looks like a tenant slug.
 * A valid slug is a single path segment (no nested paths) that doesn't match excluded prefixes.
 */
function extractSlugFromUrl(url: string): string | null {
  // Remove query string and hash
  const pathname = url.split("?")[0].split("#")[0];

  // Check excluded prefixes
  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname.startsWith(prefix)) return null;
  }

  // Must be a single segment like /my-store (not /my-store/sub-page)
  const match = pathname.match(/^\/([a-zA-Z0-9_-]+)\/?$/);
  if (!match) return null;

  return match[1];
}

/**
 * Injects dynamic meta tags into the HTML template based on the request URL.
 * If the URL matches a tenant slug, fetches tenant data and injects their name/description.
 * Otherwise, uses platform defaults.
 */
export async function injectSSRMeta(html: string, url: string): Promise<string> {
  const slug = extractSlugFromUrl(url);

  let title = PLATFORM_DEFAULTS.title;
  let description = PLATFORM_DEFAULTS.description;
  let ogTitle = PLATFORM_DEFAULTS.ogTitle;
  let ogDescription = PLATFORM_DEFAULTS.ogDescription;
  let ogImage = PLATFORM_DEFAULTS.ogImage;

  if (slug) {
    try {
      const tenant = await getTenantBySlug(slug);
      if (tenant) {
        title = `${tenant.name} | Pedidos Online`;
        description = `${tenant.name} - Faça seu pedido online. Cardápio completo e entrega rápida.`;
        ogTitle = `${tenant.name} | Pedidos Online`;
        ogDescription = `Peça agora pelo cardápio digital de ${tenant.name}.`;
        // ogImage stays default unless we can extract it from settings
      }
    } catch (err) {
      // If DB lookup fails, use defaults silently
      console.error("[SSR Meta] Failed to fetch tenant for slug:", slug, err);
    }
  }

  return html
    .replace("<!--SSR_TITLE-->", escapeHtml(title))
    .replace("<!--SSR_META_DESCRIPTION-->", escapeHtml(description))
    .replace("<!--SSR_OG_TITLE-->", escapeHtml(ogTitle))
    .replace("<!--SSR_OG_DESCRIPTION-->", escapeHtml(ogDescription))
    .replace("<!--SSR_OG_IMAGE-->", escapeHtml(ogImage));
}
