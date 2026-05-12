// ===== 通用 =====
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface PaginatedResponse<T> {
  code: number;
  data: PaginatedData<T>;
  message: string;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// ===== 枚举 =====
export type ProductType = 'standard' | 'print_service' | 'both';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type SKUStatus = 'active' | 'inactive';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'make_to_order';
export type OrderStatus =
  | 'pending_confirmation'
  | 'in_production'
  | 'shipped'
  | 'completed'
  | 'cancelled';
export type InquiryStatus =
  | 'pending_review'
  | 'quoted'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'closed';
export type UserStatus = 'active' | 'disabled';
export type FileType = 'image' | 'model_3d' | 'model_upload' | 'other';
export type SenderType = 'customer' | 'admin';
export type OperatorType = 'customer' | 'admin' | 'system';
export type CodeType = 'register' | 'reset_password';

// ===== 认证 =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  code: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

// ===== 用户 =====
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  defaultContactName: string | null;
  defaultContactPhone: string | null;
  defaultAddress: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  defaultContactName?: string;
  defaultContactPhone?: string;
  defaultAddress?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ===== 产品 =====
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  productType: ProductType;
  materials: string[];
  techniques: string[];
  minPrice: number | null;
  maxPrice: number | null;
  status: ProductStatus;
  viewCount: number;
  createdAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  specs: SpecItem[];
  tolerance: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  images: ProductImage[];
  model3d: Model3D | null;
  skus: SKU[];
  categories: CategoryBrief[];
}

export interface SpecItem {
  name: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Model3D {
  id: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
}

export interface SKU {
  id: string;
  skuCode: string;
  specCombo: Record<string, string>;
  price: number;
  minOrderQty: number;
  stockStatus: StockStatus;
  leadTimeDays: number | null;
  imageUrl: string | null;
  status: SKUStatus;
}

// ===== 分类 =====
export interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
  children: CategoryNode[];
}

// ===== 产品查询 =====
export interface ProductQuery extends PaginationQuery {
  category?: string;
  material?: string;
  technique?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  tolerance?: string;
  search?: string;
  sort?: 'default' | 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

// ===== 订单 =====
export interface OrderListItem {
  id: string;
  orderNo: string;
  totalPrice: number;
  status: OrderStatus;
  contactName: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderListItem {
  discountAmount: number;
  couponCode: string | null;
  note: string | null;
  contactPhone: string | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  trackingCompany: string | null;
  sourceInquiryId: string | null;
  items: OrderItemDetail[];
  logs: OrderLog[];
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  skuId: string;
  skuCode: string;
  specCombo: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderLog {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  operatorType: OperatorType;
  detail: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  items: { productId: string; skuId: string; quantity: number }[];
  note?: string;
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  couponCode?: string;
}

// ===== 代打询价 =====
export interface InquiryListItem {
  id: string;
  inquiryNo: string;
  productName: string | null;
  desiredMaterial: string | null;
  desiredColor: string | null;
  desiredQuantity: number | null;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryDetail extends InquiryListItem {
  productId: string | null;
  desiredSize: string | null;
  desiredDeadline: string | null;
  additionalNotes: string | null;
  contactName: string | null;
  contactPhone: string | null;
  adminQuoteUnitPrice: number | null;
  adminQuoteQuantity: number | null;
  adminQuoteTotalPrice: number | null;
  adminQuoteNote: string | null;
  adminQuoteDeliveryDays: number | null;
  files: InquiryFile[];
  messages: InquiryMessage[];
  logs: InquiryLog[];
}

export interface InquiryFile {
  id: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
}

export interface InquiryMessage {
  id: string;
  senderType: SenderType;
  content: string;
  createdAt: string;
}

export interface InquiryLog {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  operatorType: OperatorType;
  detail: string | null;
  createdAt: string;
}

export interface CreateInquiryRequest {
  productId?: string;
  desiredMaterial?: string;
  desiredColor?: string;
  desiredQuantity?: number;
  desiredSize?: string;
  desiredDeadline?: string;
  additionalNotes?: string;
  contactName?: string;
  contactPhone?: string;
}

// ===== 公共内容 =====
export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

// ===== 系统 =====
export interface SystemConfig {
  [key: string]: string;
}

export interface DashboardStats {
  todayVisitors: number;
  monthlyOrders: number;
  monthlyInquiries: number;
  conversionRate: number;
  activeProducts: number;
}
