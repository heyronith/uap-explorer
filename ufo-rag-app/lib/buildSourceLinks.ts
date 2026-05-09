import type { RetrievedSource } from "./chatSources";

type MatchRow = {
  content: string | null;
  metadata: Record<string, unknown> | null;
};

function formatPage(meta: Record<string, unknown>): string | number {
  const p = meta.page;
  if (typeof p === "number" && Number.isFinite(p)) return p;
  if (typeof p === "string" && p.trim() !== "") return p;
  return "?";
}

function looksLikePdf(url: string, assetType?: string): boolean {
  const t = (assetType ?? "").toLowerCase();
  if (t.includes("pdf")) return true;
  return /\.pdf(\?|$)/i.test(url);
}

/** Official viewer: append #page=N for PDFs (common PDF open parameter). */
export function appendPageToSourceUrl(
  rawUrl: string,
  page: string | number,
  meta: Record<string, unknown>,
): string {
  const url = rawUrl.trim();
  if (!url) return url;

  const assetType =
    typeof meta.asset_type === "string" ? meta.asset_type : undefined;

  let pageNum = 1;
  if (typeof page === "number" && Number.isFinite(page)) {
    pageNum = Math.max(1, Math.floor(page));
  } else if (typeof page === "string" && page !== "?") {
    const n = parseInt(page.trim(), 10);
    if (!Number.isNaN(n)) pageNum = Math.max(1, n);
  }

  const base = url.split("#")[0] ?? url;
  if (looksLikePdf(url, assetType)) {
    return `${base}#page=${pageNum}`;
  }
  return base;
}

/** Unique sources in retrieval order (first match wins). */
export function buildRetrievalSources(results: MatchRow[]): RetrievedSource[] {
  const seen = new Set<string>();
  const out: RetrievedSource[] = [];
  let order = 0;

  for (const row of results) {
    const meta = row.metadata ?? {};
    const title =
      typeof meta.source_title === "string" ? meta.source_title : "Unknown source";
    const page = formatPage(meta);
    const rawUrl =
      typeof meta.source_url === "string" ? meta.source_url.trim() : "";

    const key = `${rawUrl}::${String(page)}`;
    if (!rawUrl || seen.has(key)) continue;
    seen.add(key);

    order += 1;
    const source_url = appendPageToSourceUrl(rawUrl, page, meta);
    out.push({ order, source_title: title, page, source_url });
  }

  return out;
}
