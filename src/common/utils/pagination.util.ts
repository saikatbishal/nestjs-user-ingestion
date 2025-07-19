export interface PaginationOptions {
  page: number;
  limit: number;
}

export function getPagination(query: any): PaginationOptions {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  return { page, limit };
}

export function paginate<T>(array: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const items = array.slice(start, start + pageSize);
  return {
    items,
    total: array.length,
  };
}
