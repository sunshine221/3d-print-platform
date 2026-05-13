import type {
  ApiResponse,
  PaginatedData,
  ProductListItem,
  ProductDetail,
  ProductQuery,
  CategoryNode,
  Banner,
  PageContent,
  TokenPair,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  CreateOrderRequest,
  CreateInquiryRequest,
  UserProfile,
  UpdateProfileRequest,
} from '@3d-print/types';

const BASE_URL = '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function setTokenCookie(token: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `access_token=${token}; path=/; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure;' : ''}`;
}

function clearTokenCookie() {
  if (typeof window === 'undefined') return;
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const mergedHeaders = { ...headers, ...(options?.headers as Record<string, string> || {}) };
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: mergedHeaders,
  });

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearTokenCookie();
  }

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

// ===== 产品 =====

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

// ===== 认证 =====

export async function login(data: LoginRequest): Promise<TokenPair> {
  const tokens = await apiClient<TokenPair>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  setTokenCookie(tokens.accessToken);
  return tokens;
}

export async function register(data: RegisterRequest): Promise<TokenPair> {
  const tokens = await apiClient<TokenPair>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  setTokenCookie(tokens.accessToken);
  return tokens;
}

export async function logout(): Promise<void> {
  await apiClient('/auth/logout', { method: 'POST' });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  clearTokenCookie();
}

export async function refreshToken(refreshToken: string): Promise<TokenPair> {
  return apiClient<TokenPair>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me');
}

export async function updateMe(data: UpdateProfileRequest): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}


export async function forgotPassword(phone: string): Promise<void> {
  await apiClient('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function resetPassword(data: {
  phone: string;
  newPassword: string;
}): Promise<void> {
  await apiClient('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ===== 订单 =====

export async function createOrder(data: CreateOrderRequest): Promise<{ id: string; orderNo: string }> {
  return apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyOrders(query: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedData<unknown>> {
  return apiClient(`/orders${buildQuery(query as Record<string, string | number | undefined>)}`);
}

export async function getOrderDetail(id: string): Promise<unknown> {
  return apiClient(`/orders/${encodeURIComponent(id)}`);
}

// ===== 代打询价 =====

export async function createInquiry(data: CreateInquiryRequest): Promise<{ id: string; inquiryNo: string }> {
  return apiClient('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyInquiries(query: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedData<unknown>> {
  return apiClient(`/inquiries${buildQuery(query as Record<string, string | number | undefined>)}`);
}

export async function getInquiryDetail(id: string): Promise<unknown> {
  return apiClient(`/inquiries/${encodeURIComponent(id)}`);
}

export async function sendInquiryMessage(id: string, content: string): Promise<unknown> {
  return apiClient(`/inquiries/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
