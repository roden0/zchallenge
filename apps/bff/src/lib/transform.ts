import type { ProductDetail, ProductSummary } from 'contracts';

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }

  return result;
}

export function normalizeImageUrl(url: string, upstreamHost: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.protocol === 'http:' && parsed.host === upstreamHost) {
    parsed.protocol = 'https:';
    return parsed.toString();
  }

  return url;
}

export function normalizeSummaryImages(
  summary: ProductSummary,
  upstreamHost: string,
): ProductSummary {
  return {
    ...summary,
    imageUrl: normalizeImageUrl(summary.imageUrl, upstreamHost),
  };
}

export function cleanSimilarProducts(
  similar: ProductSummary[],
  requestedId: string,
  upstreamHost: string,
): ProductSummary[] {
  return dedupeById(similar)
    .filter((product) => product.id !== requestedId)
    .map((product) => normalizeSummaryImages(product, upstreamHost));
}

export function normalizeDetailImages(
  detail: ProductDetail,
  upstreamHost: string,
): ProductDetail {
  return {
    ...detail,
    colorOptions: detail.colorOptions.map((color) => ({
      ...color,
      imageUrl: normalizeImageUrl(color.imageUrl, upstreamHost),
    })),
    similarProducts: cleanSimilarProducts(
      detail.similarProducts,
      detail.id,
      upstreamHost,
    ),
  };
}
