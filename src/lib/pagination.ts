export type PageParams = Record<string, string | string[] | undefined>;

export function parsePage(params: PageParams | undefined, key = "page"): number {
  const raw = params?.[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function parseQuery(params: PageParams | undefined, key = "q"): string {
  const raw = params?.[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ?? "";
}

export function paginationMeta(page: number, total: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { page: Math.min(page, pageCount), pageCount, total, pageSize };
}
