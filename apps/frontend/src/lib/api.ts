import type {
  ApiResponse,
  PaginatedData,
  ProductListItem,
  ProductDetail,
  ProductQuery,
  CategoryNode,
  Banner,
  PageContent,
} from '@3d-print/types';

const BASE_URL = '/api/v1';

class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '请求失败');
  }

  return json.data;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function getProducts(query: ProductQuery): Promise<PaginatedData<ProductListItem>> {
  return apiClient<PaginatedData<ProductListItem>>(
    `/products${buildQuery(query as Record<string, string | number | undefined>)}`,
  );
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  return apiClient<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export async function getRelatedProducts(slug: string): Promise<ProductListItem[]> {
  return apiClient<ProductListItem[]>(`/products/${encodeURIComponent(slug)}/related`);
}

export async function getCategories(): Promise<CategoryNode[]> {
  return apiClient<CategoryNode[]>('/categories');
}

export async function getBanners(): Promise<Banner[]> {
  return apiClient<Banner[]>('/banners');
}

export async function getPage(slug: string): Promise<PageContent> {
  return apiClient<PageContent>(`/pages/${encodeURIComponent(slug)}`);
}
