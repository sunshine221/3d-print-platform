# 3D 打印产品展示与管理平台 -- 架构设计文档

> 版本: v1.3 | 日期: 2026-05-12 | 对应需求: specs/requirements.md v1.1

---

## 1. Monorepo 目录结构

### 1.1 整体布局

```
3d-print-platform/
├── pnpm-workspace.yaml
├── package.json                    # root package (scripts, devDependencies)
├── turbo.json                      # Turborepo 任务编排
├── tsconfig.base.json              # 共享 TS 配置
├── .eslintrc.js                    # 共享 ESLint 配置
├── .prettierrc                     # 共享 Prettier 配置
├── .env.example
├── docker-compose.yml              # PostgreSQL + Redis + MinIO
├── Dockerfile.frontend
├── Dockerfile.admin
├── Dockerfile.server
│
├── apps/
│   ├── frontend/                   # @3d-print/frontend -- Next.js 14 前台
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── middleware.ts           # 认证 + 路由保护中间件
│   │   ├── public/
│   │   │   ├── logo.svg
│   │   │   ├── og-image.png
│   │   │   └── favicon.ico
│   │   └── src/
│   │       ├── app/                    # App Router 路由
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   ├── not-found.tsx
│   │       │   ├── error.tsx
│   │       │   ├── loading.tsx
│   │       │   ├── globals.css
│   │       │   ├── (public)/           # 公开路由组
│   │       │   │   ├── products/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── [slug]/
│   │       │   │   │       ├── page.tsx
│   │       │   │   │       └── order/
│   │       │   │   │           └── page.tsx
│   │       │   │   ├── categories/
│   │       │   │   │   └── [slug]/
│   │       │   │   │       └── page.tsx
│   │       │   │   ├── inquiry/
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── about/
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── materials/
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── guide/
│   │       │   │   │   └── page.tsx
│   │       │   │   └── contact/
│   │       │   │       └── page.tsx
│   │       │   ├── (auth)/             # 认证路由组
│   │       │   │   ├── login/
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── register/
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── forgot-password/
│   │       │   │   │   └── page.tsx
│   │       │   │   └── reset-password/
│   │       │   │       └── page.tsx
│   │       │   └── (account)/          # 个人中心路由组 (需登录)
│   │       │       ├── layout.tsx
│   │       │       ├── account/
│   │       │       │   └── page.tsx
│   │       │       ├── account/orders/
│   │       │       │   ├── page.tsx
│   │       │       │   └── [id]/
│   │       │       │       └── page.tsx
│   │       │       └── account/inquiries/
│   │       │           ├── page.tsx
│   │       │           └── [id]/
│   │       │               └── page.tsx
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Header.tsx
│   │       │   │   ├── Footer.tsx
│   │       │   │   ├── MobileNav.tsx
│   │       │   │   └── Sidebar.tsx
│   │       │   ├── home/
│   │       │   │   ├── HeroBanner.tsx
│   │       │   │   ├── CategoryGrid.tsx
│   │       │   │   ├── FeaturedProducts.tsx
│   │       │   │   └── ValueBar.tsx
│   │       │   ├── product/
│   │       │   │   ├── ProductCard.tsx
│   │       │   │   ├── ProductGrid.tsx
│   │       │   │   ├── ProductFilter.tsx
│   │       │   │   ├── SKUSelector.tsx
│   │       │   │   ├── PriceDisplay.tsx
│   │       │   │   └── ProductGallery.tsx
│   │       │   ├── viewer/
│   │       │   │   ├── ModelViewer.tsx       # Three.js 3D 查看器 (R3F)
│   │       │   │   ├── ViewerControls.tsx
│   │       │   │   └── MaterialSwitcher.tsx
│   │       │   ├── inquiry/
│   │       │   │   ├── InquiryForm.tsx
│   │       │   │   └── FileUploader.tsx
│   │       │   ├── order/
│   │       │   │   ├── OrderConfirm.tsx
│   │       │   │   └── OrderSummary.tsx
│   │       │   └── ui/                     # 通用 UI 组件
│   │       │       ├── Button.tsx
│   │       │       ├── Input.tsx
│   │       │       ├── Modal.tsx
│   │       │       ├── Pagination.tsx
│   │       │       ├── Breadcrumb.tsx
│   │       │       └── Toast.tsx
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── useProduct.ts
│   │       │   ├── useInquiry.ts
│   │       │   └── useMediaQuery.ts
│   │       ├── lib/
│   │       │   ├── api.ts                  # fetch 封装 + 拦截器
│   │       │   ├── auth.ts                 # 客户端认证工具
│   │       │   ├── validators.ts
│   │       │   └── constants.ts
│   │       └── types/
│   │           └── index.ts                # 从前端视角扩展 shared-types
│   │
│   ├── admin/                      # @3d-print/admin -- React 18 SPA 后台
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes.tsx                   # 路由配置
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── AdminLayout.tsx
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── Header.tsx
│   │       │   │   └── Breadcrumb.tsx
│   │       │   ├── dashboard/
│   │       │   │   ├── StatCard.tsx
│   │       │   │   ├── OrderChart.tsx
│   │       │   │   └── RecentList.tsx
│   │       │   ├── product/
│   │       │   │   ├── ProductTable.tsx
│   │       │   │   ├── ProductForm.tsx
│   │       │   │   ├── SKUManager.tsx
│   │       │   │   └── ImageUploader.tsx
│   │       │   ├── order/
│   │       │   │   ├── OrderTable.tsx
│   │       │   │   ├── OrderDetail.tsx
│   │       │   │   └── StatusFlow.tsx
│   │       │   ├── inquiry/
│   │       │   │   ├── InquiryTable.tsx
│   │       │   │   ├── InquiryDetail.tsx
│   │       │   │   ├── QuoteForm.tsx
│   │       │   │   └── MessageThread.tsx
│   │       │   ├── media/
│   │       │   │   ├── MediaGrid.tsx
│   │       │   │   └── FolderTree.tsx
│   │       │   └── shared/
│   │       │       ├── RichEditor.tsx
│   │       │       ├── FileUpload.tsx
│   │       │       ├── ModelPreview.tsx    # 后台 3D 查看器 (STL/OBJ)
│   │       │       └── StatusTag.tsx
│   │       ├── pages/
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── ProductListPage.tsx
│   │       │   ├── ProductEditPage.tsx
│   │       │   ├── CategoryPage.tsx
│   │       │   ├── OrderListPage.tsx
│   │       │   ├── OrderDetailPage.tsx
│   │       │   ├── InquiryListPage.tsx
│   │       │   ├── InquiryDetailPage.tsx
│   │       │   ├── CustomerListPage.tsx
│   │       │   ├── CustomerDetailPage.tsx
│   │       │   ├── BannerPage.tsx
│   │       │   ├── PageManager.tsx
│   │       │   ├── MediaLibraryPage.tsx
│   │       │   ├── SettingsPage.tsx
│   │       │   ├── AdminUserPage.tsx
│   │       │   └── OperationLogPage.tsx
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── useTable.ts
│   │       │   └── useUpload.ts
│   │       ├── services/
│   │       │   └── api.ts                  # axios 实例 + 拦截器
│   │       ├── stores/
│   │       │   ├── authStore.ts            # Zustand
│   │       │   └── appStore.ts
│   │       └── styles/
│   │           └── antd-overrides.css
│   │
│   └── server/                     # @3d-print/server -- NestJS 后端
│       ├── package.json
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── .env.example
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── common/
│           │   ├── decorators/
│           │   │   ├── current-user.decorator.ts
│           │   │   ├── roles.decorator.ts
│           │   │   └── public.decorator.ts
│           │   ├── filters/
│           │   │   └── http-exception.filter.ts
│           │   ├── guards/
│           │   │   ├── jwt-auth.guard.ts
│           │   │   ├── jwt-admin.guard.ts
│           │   │   └── roles.guard.ts
│           │   ├── interceptors/
│           │   │   ├── transform.interceptor.ts    # 统一响应格式
│           │   │   └── logging.interceptor.ts
│           │   ├── pipes/
│           │   │   └── validation.pipe.ts
│           │   └── dto/
│           │       └── pagination.dto.ts
│           ├── config/
│           │   ├── database.config.ts
│           │   ├── redis.config.ts
│           │   ├── minio.config.ts
│           │   ├── jwt.config.ts
│           │   └── app.config.ts
│           ├── database/
│           │   ├── schema.prisma              # Prisma Schema
│           │   ├── migrations/
│           │   └── seed.ts
│           ├── modules/
│           │   ├── auth/
│           │   │   ├── auth.module.ts
│           │   │   ├── auth.controller.ts
│           │   │   ├── auth.service.ts
│           │   │   ├── strategies/
│           │   │   │   ├── jwt.strategy.ts
│           │   │   │   └── jwt-admin.strategy.ts
│           │   │   └── dto/
│           │   │       ├── register.dto.ts
│           │   │       ├── login.dto.ts
│           │   │       └── refresh.dto.ts
│           │   ├── admin-auth/
│           │   │   ├── admin-auth.module.ts
│           │   │   ├── admin-auth.controller.ts
│           │   │   └── admin-auth.service.ts
│           │   ├── user/
│           │   │   ├── user.module.ts
│           │   │   ├── user.controller.ts
│           │   │   ├── user.service.ts
│           │   │   └── dto/
│           │   ├── product/
│           │   │   ├── product.module.ts
│           │   │   ├── product.controller.ts      # 公开接口
│           │   │   ├── admin-product.controller.ts # 管理接口
│           │   │   ├── product.service.ts
│           │   │   ├── sku.service.ts
│           │   │   └── dto/
│           │   ├── category/
│           │   │   ├── category.module.ts
│           │   │   ├── category.controller.ts
│           │   │   ├── admin-category.controller.ts
│           │   │   ├── category.service.ts
│           │   │   └── dto/
│           │   ├── order/
│           │   │   ├── order.module.ts
│           │   │   ├── order.controller.ts
│           │   │   ├── admin-order.controller.ts
│           │   │   ├── order.service.ts
│           │   │   └── dto/
│           │   ├── inquiry/
│           │   │   ├── inquiry.module.ts
│           │   │   ├── inquiry.controller.ts
│           │   │   ├── admin-inquiry.controller.ts
│           │   │   ├── inquiry.service.ts
│           │   │   └── dto/
│           │   ├── media/
│           │   │   ├── media.module.ts
│           │   │   ├── media.controller.ts
│           │   │   ├── media.service.ts
│           │   │   └── dto/
│           │   ├── banner/
│           │   │   ├── banner.module.ts
│           │   │   ├── banner.controller.ts
│           │   │   ├── admin-banner.controller.ts
│           │   │   ├── banner.service.ts
│           │   │   └── dto/
│           │   ├── page/
│           │   │   ├── page.module.ts
│           │   │   ├── page.controller.ts
│           │   │   ├── admin-page.controller.ts
│           │   │   ├── page.service.ts
│           │   │   └── dto/
│           │   ├── dashboard/
│           │   │   ├── dashboard.module.ts
│           │   │   ├── dashboard.controller.ts
│           │   │   └── dashboard.service.ts
│           │   ├── system/
│           │   │   ├── system.module.ts
│           │   │   ├── system.controller.ts
│           │   │   └── system.service.ts
│           │   └── rbac/
│           │       ├── rbac.module.ts
│           │       ├── rbac.controller.ts
│           │       ├── rbac.service.ts
│           │       └── dto/
│           └── types/
│               └── express.d.ts              # Request 类型扩展
│
└── packages/
    ├── shared-types/                # @3d-print/types -- 共享类型定义
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── auth.ts              # LoginReq, RegisterReq, AuthUser
    │       ├── product.ts           # Product, SKU, Category, ProductType
    │       ├── order.ts             # Order, OrderItem, OrderStatus, OrderLog
    │       ├── inquiry.ts           # Inquiry, InquiryStatus, InquiryMessage
    │       ├── user.ts              # User, AdminUser, Role
    │       ├── media.ts             # MediaItem, UploadResult
    │       ├── banner.ts            # Banner
    │       ├── page.ts              # PageContent
    │       ├── system.ts            # SystemConfig
    │       └── common.ts            # PaginatedResponse, ApiResponse, enums
    │
    ├── shared-utils/                # @3d-print/utils -- 共享工具函数
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── format.ts            # 价格格式化、日期格式化
    │       ├── validation.ts        # 邮箱、手机号校验
    │       ├── constants.ts         # 订单状态映射、材质列表、工艺列表
    │       ├── order-no.ts          # 订单号/询价单号生成
    │       └── file.ts              # 文件大小格式化、类型判断
    │
    └── shared-ui/                   # @3d-print/ui -- 跨应用共享 UI (按需)
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── PriceDisplay.tsx     # 共享价格展示组件
            ├── StatusBadge.tsx      # 状态标签 (订单/询价状态色)
            └── FilePreview.tsx      # 文件预览缩略图
```

### 1.2 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 1.3 包命名与依赖关系

| 包名 | 目录 | 说明 |
|------|------|------|
| `@3d-print/frontend` | apps/frontend | 前台 Next.js 应用 |
| `@3d-print/admin` | apps/admin | 后台 React SPA |
| `@3d-print/server` | apps/server | 后端 NestJS 服务 |
| `@3d-print/types` | packages/shared-types | 纯类型包，零运行时依赖 |
| `@3d-print/utils` | packages/shared-utils | 工具函数，依赖 types |
| `@3d-print/ui` | packages/shared-ui | 共享 UI，依赖 types + React |

依赖方向: `frontend / admin / server` -> `types + utils` ; `frontend / admin` -> `ui`

---

## 2. 数据库 Schema 设计

### 2.1 ER 关系总览

```
Category --< ProductCategory >-- Product --< ProductImage
                |                     |
                |                     +-- Model3D (1:1)
                |                     +-- SKU (1:N) --< OrderItem
                |                     |
                |                     +-- OrderItem >-- Order --< OrderLog
                |                                        |
                |                                       User
                |                                        |
                |                     +-- PrintServiceInquiry --< InquiryFile
                |                              |              --< InquiryMessage
                |                              |              --< InquiryLog
                |                              |
                +------------------------------+
```

### 2.2 枚举定义

```typescript
// 产品类型
ProductType:   'standard' | 'print_service' | 'both'
// 产品状态
ProductStatus: 'draft' | 'published' | 'archived'
// SKU 状态
SKUStatus:     'active' | 'inactive'
// 库存状态
StockStatus:   'in_stock' | 'low_stock' | 'out_of_stock' | 'make_to_order'
// 订单状态
OrderStatus:   'pending_confirmation' | 'in_production' | 'shipped' | 'completed' | 'cancelled'
// 代打询价状态
InquiryStatus: 'pending_review' | 'quoted' | 'negotiating' | 'accepted' | 'rejected' | 'closed'
// 用户状态
UserStatus:    'active' | 'disabled'
// 文件类型
FileType:      'image' | 'model_3d' | 'model_upload' | 'other'
// 消息发送方
SenderType:    'customer' | 'admin'
// 操作者类型
OperatorType:  'customer' | 'admin' | 'system'
// 验证码类型
CodeType:      'register' | 'reset_password'
```

### 2.3 完整表结构

所有表均使用 UUID 主键 `id UUID PK DEFAULT gen_random_uuid()`，含 `created_at TIMESTAMPTZ DEFAULT NOW()` 和 `updated_at TIMESTAMPTZ DEFAULT NOW()`。下表中省略通用时间戳列。

#### User (客户)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | |
| phone | VARCHAR(30) | |
| avatar_url | VARCHAR(500) | |
| default_contact_name | VARCHAR(100) | |
| default_contact_phone | VARCHAR(30) | |
| default_address | TEXT | |
| email_verified | BOOLEAN | DEFAULT false |
| status | VARCHAR(20) | DEFAULT 'active' |

索引: `idx_user_email` UNIQUE (email), `idx_user_status` (status), `idx_user_created` (created_at)

> v1 仅支持邮箱注册，`phone` 为可选个人信息；手机号注册/登录留到 v2。

#### ContactMessage (联系我们消息)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT false |
| reply | TEXT | |

索引: `idx_cm_created` (created_at DESC), `idx_cm_read` (is_read, created_at DESC)

#### AdminUser (管理员)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(500) | |
| role_id | UUID | FK -> Role, NOT NULL |
| status | VARCHAR(20) | DEFAULT 'active' |
| last_login_at | TIMESTAMPTZ | |

索引: `idx_admin_email` UNIQUE (email), `idx_admin_role` (role_id)

#### Role (角色)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| name | VARCHAR(50) | NOT NULL |
| slug | VARCHAR(50) | UNIQUE, NOT NULL |
| description | TEXT | |
| permissions | JSONB | DEFAULT '[]' |

permissions 示例:
```json
["product:read","product:write","product:delete","order:read","order:write","order:status","inquiry:read","inquiry:write","inquiry:quote","user:read","user:manage","content:read","content:write","system:read","system:write"]
```

#### RefreshToken

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK -> User (nullable) |
| admin_user_id | UUID | FK -> AdminUser (nullable) |
| token | VARCHAR(500) | UNIQUE, NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |

约束: CHECK (user_id IS NOT NULL OR admin_user_id IS NOT NULL)
索引: `idx_rt_token` UNIQUE (token), `idx_rt_user` (user_id), `idx_rt_admin` (admin_user_id)

#### VerificationCode

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR(255) | NOT NULL |
| code | VARCHAR(10) | NOT NULL |
| type | VARCHAR(20) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| used | BOOLEAN | DEFAULT false |

索引: `idx_vc_email_type` (email, type), `idx_vc_expires` (expires_at)

#### Category (分类)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| icon | VARCHAR(500) | |
| image_url | VARCHAR(500) | |
| description | TEXT | |
| parent_id | UUID | FK -> Category (self), null=一级 |
| sort_order | INT | DEFAULT 0 |
| is_visible | BOOLEAN | DEFAULT true |

索引: `idx_cat_slug` UNIQUE (slug), `idx_cat_parent` (parent_id), `idx_cat_sort` (parent_id, sort_order)

#### Product (产品)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(250) | UNIQUE, NOT NULL |
| subtitle | VARCHAR(300) | |
| description | TEXT | 富文本 HTML |
| product_type | VARCHAR(20) | NOT NULL, DEFAULT 'standard' |
| materials | TEXT[] | 冗余汇总 SKU 材质，用于筛选 |
| techniques | TEXT[] | 冗余汇总 SKU 工艺，用于筛选 |
| tolerance | VARCHAR(50) | 精度/公差范围，如 ±0.1mm |
| specs | JSONB | DEFAULT '[]' |
| thumbnail_url | VARCHAR(500) | |
| status | VARCHAR(20) | DEFAULT 'draft' |
| seo_title | VARCHAR(200) | |
| seo_description | TEXT | |
| seo_keywords | VARCHAR(500) | |
| view_count | INT | DEFAULT 0 |

索引: `idx_prod_slug` UNIQUE (slug), `idx_prod_status` (status), `idx_prod_type` (product_type)

#### ProductCategory (多对多关联)

| 字段 | 类型 | 约束 |
|------|------|------|
| product_id | UUID | FK -> Product ON DELETE CASCADE |
| category_id | UUID | FK -> Category ON DELETE CASCADE |

PK: (product_id, category_id), 索引: `idx_pc_category` (category_id)

#### ProductImage

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| product_id | UUID | FK -> Product ON DELETE CASCADE |
| url | VARCHAR(500) | NOT NULL |
| alt_text | VARCHAR(200) | |
| sort_order | INT | DEFAULT 0 |
| is_primary | BOOLEAN | DEFAULT false |

索引: `idx_pi_product` (product_id, sort_order)

#### Model3D

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| product_id | UUID | FK -> Product ON DELETE CASCADE, UNIQUE |
| file_url | VARCHAR(500) | NOT NULL |
| file_name | VARCHAR(255) | |
| file_size | BIGINT | |
| thumbnail_url | VARCHAR(500) | |

索引: `idx_m3d_product` UNIQUE (product_id)

#### SKU

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| product_id | UUID | FK -> Product ON DELETE CASCADE |
| sku_code | VARCHAR(100) | UNIQUE, NOT NULL |
| spec_combo | JSONB | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL, CHECK >= 0 |
| min_order_qty | INT | DEFAULT 1, CHECK >= 1 |
| stock_status | VARCHAR(20) | DEFAULT 'make_to_order' |
| lead_time_days | INT | |
| image_url | VARCHAR(500) | |
| status | VARCHAR(20) | DEFAULT 'active' |

索引: `idx_sku_code` UNIQUE (sku_code), `idx_sku_product` (product_id, status)

#### Order (订单)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| order_no | VARCHAR(50) | UNIQUE, NOT NULL |
| user_id | UUID | FK -> User, NOT NULL |
| total_price | DECIMAL(12,2) | NOT NULL, CHECK >= 0 |
| discount_amount | DECIMAL(12,2) | DEFAULT 0 |
| coupon_code | VARCHAR(50) | |
| note | TEXT | |
| status | VARCHAR(30) | DEFAULT 'pending_confirmation' |
| contact_name | VARCHAR(100) | |
| contact_phone | VARCHAR(30) | |
| shipping_address | TEXT | |
| tracking_number | VARCHAR(100) | |
| tracking_company | VARCHAR(100) | |
| source_inquiry_id | UUID | FK -> PrintServiceInquiry (nullable) |

索引: `idx_order_no` UNIQUE (order_no), `idx_order_user` (user_id, created_at DESC), `idx_order_status` (status)

#### OrderItem

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| order_id | UUID | FK -> Order ON DELETE CASCADE |
| product_id | UUID | FK -> Product |
| product_name | VARCHAR(200) | NOT NULL 快照 |
| sku_id | UUID | FK -> SKU |
| sku_code | VARCHAR(100) | NOT NULL 快照 |
| spec_combo | JSONB | NOT NULL 快照 |
| unit_price | DECIMAL(10,2) | NOT NULL 快照 |
| quantity | INT | NOT NULL, CHECK >= 1 |
| subtotal | DECIMAL(12,2) | NOT NULL |

索引: `idx_oi_order` (order_id), `idx_oi_product` (product_id)

#### OrderLog

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| order_id | UUID | FK -> Order ON DELETE CASCADE |
| action | VARCHAR(50) | NOT NULL |
| from_status | VARCHAR(30) | |
| to_status | VARCHAR(30) | |
| operator_type | VARCHAR(20) | |
| operator_id | UUID | |
| detail | TEXT | |

索引: `idx_ol_order` (order_id, created_at)

#### PrintServiceInquiry (代打询价)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| inquiry_no | VARCHAR(50) | UNIQUE, NOT NULL |
| user_id | UUID | FK -> User, NOT NULL |
| product_id | UUID | FK -> Product (nullable) |
| desired_material | VARCHAR(100) | |
| desired_color | VARCHAR(100) | |
| desired_quantity | INT | |
| desired_size | VARCHAR(200) | |
| desired_deadline | DATE | |
| additional_notes | TEXT | |
| contact_name | VARCHAR(100) | |
| contact_phone | VARCHAR(30) | |
| status | VARCHAR(20) | DEFAULT 'pending_review' |
| admin_quote_unit_price | DECIMAL(12,2) | 单价 |
| admin_quote_quantity | INT | 对应数量 |
| admin_quote_total_price | DECIMAL(12,2) | 总价 |
| admin_quote_note | TEXT | 报价备注 |
| admin_quote_delivery_days | INT | 预计交付天数 |
| admin_quote_at | TIMESTAMPTZ | |
| converted_order_id | UUID | FK -> Order (nullable) |

索引: `idx_inq_no` UNIQUE (inquiry_no), `idx_inq_user` (user_id, created_at DESC), `idx_inq_status` (status)

#### InquiryFile

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| inquiry_id | UUID | FK -> PrintServiceInquiry ON DELETE CASCADE |
| file_url | VARCHAR(500) | NOT NULL |
| file_name | VARCHAR(255) | |
| file_size | BIGINT | |
| file_type | VARCHAR(50) | |

索引: `idx_if_inquiry` (inquiry_id)

#### InquiryMessage

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| inquiry_id | UUID | FK -> PrintServiceInquiry ON DELETE CASCADE |
| sender_type | VARCHAR(10) | NOT NULL |
| sender_id | UUID | NOT NULL |
| content | TEXT | NOT NULL |

索引: `idx_im_inquiry` (inquiry_id, created_at)

#### InquiryLog

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| inquiry_id | UUID | FK -> PrintServiceInquiry ON DELETE CASCADE |
| action | VARCHAR(50) | NOT NULL |
| from_status | VARCHAR(20) | |
| to_status | VARCHAR(20) | |
| operator_type | VARCHAR(20) | |
| operator_id | UUID | |
| detail | TEXT | |

索引: `idx_il_inquiry` (inquiry_id, created_at)

#### Banner

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| title | VARCHAR(200) | |
| subtitle | VARCHAR(300) | |
| image_url | VARCHAR(500) | NOT NULL |
| link_url | VARCHAR(500) | |
| sort_order | INT | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |

索引: `idx_banner_active_sort` (is_active, sort_order)

#### Page (内容页面)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| content | TEXT | 富文本 HTML |
| meta_title | VARCHAR(200) | |
| meta_description | TEXT | |
| is_system | BOOLEAN | DEFAULT false |
| status | VARCHAR(20) | DEFAULT 'published' |

索引: `idx_page_slug` UNIQUE (slug)

#### MediaLibrary

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| folder_id | UUID | FK -> MediaLibrary (self, nullable) |
| file_name | VARCHAR(255) | NOT NULL |
| file_url | VARCHAR(500) | NOT NULL |
| file_size | BIGINT | |
| file_type | VARCHAR(50) | NOT NULL |
| mime_type | VARCHAR(100) | |
| width | INT | |
| height | INT | |
| is_folder | BOOLEAN | DEFAULT false |

索引: `idx_ml_folder` (folder_id), `idx_ml_type` (file_type)

#### SystemConfig

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE, NOT NULL |
| value | TEXT | |
| group_name | VARCHAR(50) | NOT NULL |

索引: `idx_sc_key` UNIQUE (key), `idx_sc_group` (group_name)

#### OperationLog

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| admin_user_id | UUID | FK -> AdminUser (nullable) |
| action | VARCHAR(100) | NOT NULL |
| target_type | VARCHAR(50) | |
| target_id | UUID | |
| detail | JSONB | |
| ip_address | VARCHAR(45) | |
| user_agent | VARCHAR(500) | |

索引: `idx_ol_admin` (admin_user_id, created_at DESC), `idx_ol_target` (target_type, target_id)

#### PageView (页面访问统计)

| 字段 | 类型 | 约束 |
|------|------|------|
| id | UUID | PK |
| page_path | VARCHAR(500) | NOT NULL |
| visitor_id | VARCHAR(100) | 匿名标识（cookie/fingerprint） |
| user_id | UUID | FK -> User (nullable)，已登录可关联 |
| referrer | VARCHAR(500) | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

索引: `idx_pv_path_date` (page_path, created_at DESC), `idx_pv_date` (created_at DESC), `idx_pv_user` (user_id, created_at DESC)

### 2.4 关键索引策略

| 策略 | 涉及表 | 原因 |
|------|--------|------|
| 所有 FK 索引 | 全部外键字段 | JOIN 性能 |
| 状态+时间复合索引 | Order, Inquiry | 后台列表最频繁筛选 |
| 唯一约束索引 | order_no, inquiry_no, sku_code, slug, email | 业务唯一标识 |
| GIN 数组索引 | Product.materials, Product.techniques | 数组包含查询 (筛选页核心) |
| JSONB GIN 索引(推荐) | SKU.spec_combo | 按规格维度筛选 |
| 日期索引 | PageView.created_at, Order.created_at, Inquiry.created_at | 时间范围统计与趋势图 |
| 全文搜索(推荐) | Product.name, Product.description | v1 PG tsvector+GIN；高并发可升迁 ES |

---

## 3. API 设计概览

### 3.1 通用约定

Base URL: `/api/v1`

统一响应格式:
```typescript
{ "code": 0, "data": T, "message": "ok" }                                    // 成功
{ "code": 0, "data": T[], "pagination": { page, pageSize, total, totalPages } } // 分页
{ "code": number, "message": string, "errors"?: ValidationError[] }             // 错误
```

错误码分段: 400xx 客户端, 401xx 认证, 403xx 权限, 404xx 资源, 500xx 服务端

### 3.2 认证策略 -- 双通道 JWT

```
客户通道:  /api/v1/auth/*       -> UserAccessToken (15min) + UserRefreshToken (7d)
管理通道:  /api/v1/admin/auth/* -> AdminAccessToken (15min) + AdminRefreshToken (7d)
```

- 两个通道使用独立 JWT 密钥 (`JWT_USER_SECRET` / `JWT_ADMIN_SECRET`)
- Refresh Token 加密存储在 RefreshToken 表，支持服务端吊销
- 令牌轮换: 每次刷新签发新 Token 对，旧 Refresh Token 失效

### 3.3 速率限制

基于 Redis 滑动窗口实现，按 IP + 端点粒度的限流：

| 端点 | 限制 | 窗口 | 说明 |
|------|------|------|------|
| POST /auth/login | 5 次 | 1 分钟 | 防暴力破解 |
| POST /auth/register | 3 次 | 1 分钟 | 防批量注册 |
| POST /auth/send-code | 1 次 | 1 分钟/邮箱 | 防短信/邮箱轰炸 |
| POST /auth/forgot-password | 1 次 | 1 分钟/邮箱 | 防骚扰 |
| POST /inquiries (文件上传) | 10 次 | 1 分钟/用户 | 防滥用存储 |
| POST /orders | 20 次 | 1 分钟/用户 | 防重复下单 |

实现: NestJS `@nestjs/throttler` + Redis ThrottlerStorage，429 返回 `{ code: 40009, message: "请求过于频繁，请稍后再试" }`。

### 3.4 接口列表

#### 客户认证 -- `/api/v1/auth`

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| POST | /auth/register | - | 注册 |
| POST | /auth/login | - | 登录，返回 tokens |
| POST | /auth/refresh | - | 刷新令牌 |
| POST | /auth/logout | Bearer | 吊销 Refresh Token |
| POST | /auth/send-code | - | 发送邮箱验证码 |
| POST | /auth/forgot-password | - | 发送重置密码验证码 |
| POST | /auth/reset-password | - | 验证码+新密码 |
| POST | /auth/change-password | Bearer | 已登录修改密码 { currentPassword, newPassword } |
| GET | /auth/me | Bearer | 当前用户信息 |
| PATCH | /auth/me | Bearer | 更新个人资料 (name/phone/avatar/default_*) |

#### 产品 (公开) -- `/api/v1/products`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /products | 列表 (分页/筛选/搜索/排序) |
| GET | /products/:slug | 详情 (含 SKU[]+Images+Model3D) |
| GET | /products/:slug/related | 相关产品 |

查询参数: `?page=&pageSize=&category=&material=&technique=&minPrice=&maxPrice=&color=&tolerance=&search=&sort=`

#### 分类 (公开) -- `/api/v1/categories`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /categories | 分类树 (仅可见) |
| GET | /categories/:slug | 分类详情+子分类+产品数 |

#### 订单 (客户) -- `/api/v1/orders`

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /orders | Bearer | 我的订单 |
| GET | /orders/:id | Bearer | 详情 |
| POST | /orders | Bearer | 创建订单 |
| PATCH | /orders/:id/cancel | Bearer | 取消 (限 pending_confirmation) |

#### 代打询价 (客户) -- `/api/v1/inquiries`

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /inquiries | Bearer | 我的询价 |
| GET | /inquiries/:id | Bearer | 详情 |
| POST | /inquiries | Bearer | 创建 (multipart) |
| POST | /inquiries/:id/accept | Bearer | 接受报价转订单 |
| POST | /inquiries/:id/reject | Bearer | 拒绝 |
| POST | /inquiries/:id/messages | Bearer | 留言 |

#### 公共内容

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /banners | 启用 Banner 列表 |
| GET | /pages/:slug | 内容页面 |
| GET | /health | 健康检查 (DB + Redis + Storage 连通性) |
| POST | /contact | 联系我们表单提交 (name/email/message) |

> 联系我们消息存入数据库，后台管理员可在系统设置中查看。

#### 管理员认证 -- `/api/v1/admin/auth`

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /admin/auth/login | 登录 |
| POST | /admin/auth/refresh | 刷新 |
| POST | /admin/auth/logout | 登出 |
| GET | /admin/auth/me | 当前管理员+权限 |

#### 后台管理接口汇总

| 模块 | 前缀 | 关键操作 |
|------|------|----------|
| 产品管理 | `/admin/products` | CRUD + 批量上下架/修改分类/删除 + SKU 子资源 CRUD |
| 分类管理 | `/admin/categories` | CRUD + `PUT /admin/categories/sort` 拖拽排序 |
| 订单管理 | `/admin/orders` | 列表/详情 + 状态流转 + 物流填写 |
| 代打管理 | `/admin/inquiries` | 列表/详情 + 审核 + 报价(单价/数量/总价) + 关闭 + 留言 |
| 客户管理 | `/admin/users` | 列表/详情 + 禁用/启用 |
| 素材库 | `/admin/media` | 列表 + 上传(预签名 URL) + 文件夹管理 |
| Banner | `/admin/banners` | CRUD + 排序 |
| 页面管理 | `/admin/pages` | 列表 + 编辑 |
| 仪表盘 | `/admin/dashboard` | stats + recent-orders + recent-inquiries + visitor-trend |
| 系统设置 | `/admin/system` | config + logs |
| 角色管理 | `/admin/rbac` | roles CRUD + admins CRUD |

所有后台接口受 `JwtAdminGuard` + `RolesGuard` 保护，权限粒度见 Role.permissions。

---

## 4. 前端路由设计

### 4.1 前台 -- Next.js 14 App Router

```
/                                      首页
/products                              产品浏览 (筛选+搜索+分页)
/products/[slug]                       产品详情 (3D查看器+SKU选择)
/products/[slug]/order                 SKU订单确认 (需登录)
/categories/[slug]                     分类产品列表
/inquiry                               代打服务提交 (需登录)

/login /register /forgot-password /reset-password   认证页面

/account                               个人中心 (需登录)
/account/orders                        我的订单
/account/orders/[id]                   订单详情
/account/inquiries                     我的代打
/account/inquiries/[id]                代打详情 (含沟通)
```

路由组: `(public)` 公开, `(auth)` 认证, `(account)` 需登录 (middleware 保护)

### 4.2 后台 -- React 18 SPA (React Router v6)

```
/dashboard                              仪表盘

/products                               产品列表
/products/create                        新增
/products/:id/edit                      编辑 (含 SKU 管理 Tab)

/categories                             分类管理 (树形+拖拽)

/orders                                 订单列表
/orders/:id                             订单详情 (状态流转+物流)

/inquiries                              代打列表
/inquiries/:id                          询价详情 (模型预览+报价+沟通)

/customers                              客户列表
/customers/:id                          客户详情

/content/banners /content/pages /content/pages/:id/edit   内容管理

/media                                  素材库

/settings /settings/users /settings/roles /settings/logs   系统设置
```

布局: `<AdminLayout>` > `<Sider> + <Header> + <Content><Outlet /></Content>`

---

## 5. 核心业务流程时序

### 5.1 SKU 下单流程

```
客户 -> 浏览产品详情页 -> GET /products/:slug -> 返回产品+SKU列表
  -> 选择SKU,填数量/备注,点击「立即下单」
  -> middleware 检查登录态 (未登录 -> /login)
  -> 跳转订单确认页,填收货信息,点击「提交订单」
  -> POST /orders { items:[{productId,skuId,quantity}], note, contactName, contactPhone, shippingAddress, couponCode? }
  -> 服务端事务:
     1. 校验 SKU 有效性和起订量
     2. 快照价格计算总价
     3. 生成 order_no (ORD-YYYYMMDD-XXXX)
     4. INSERT Order + OrderItem[] + OrderLog
     5. COMMIT
  -> 返回订单详情 (订单号+预计交付)
  -> 客户可在 /account/orders 查看订单状态
```

### 5.2 代打服务流程

```
客户 -> 填写需求+上传文件 -> POST /inquiries (multipart/form-data)
  -> 服务端: 校验文件 -> 上传MinIO -> 生成INQ-no -> INSERT Inquiry+Files+Log
  -> 管理员后台: 查看询价详情,下载/预览模型,评估可行性
  -> 管理员提交报价: PATCH /admin/inquiries/:id/quote { price, note, deliveryDays }
  -> 客户查看报价: GET /inquiries/:id
  -> 分支A - 接受: POST /inquiries/:id/accept
     -> 事务: UPDATE inquiry='accepted' + INSERT Order (source_inquiry_id) + 双Log
     -> 返回生成的订单,进入订单流程
  -> 分支B - 沟通: POST /inquiries/:id/messages
     -> 双方互发消息,状态='negotiating'
```

---

## 6. 关键架构决策

### 6.1 ORM: Prisma

- Schema-first: `schema.prisma` 即数据文档，评审友好
- `@prisma/client` 类型可直接被 `@3d-print/types` 引用，消除前后端类型不一致
- Migration 系统成熟可靠
- 权衡: 复杂 SQL 支持不如 TypeORM QueryBuilder。应对: 统计查询用 PG 视图 + `$queryRaw`；分类树用应用层递归 (数据量小)

### 6.2 双通道 JWT

- 客户和管理员认证逻辑差异大，独立通道更清晰
- 安全隔离: 密钥独立，互不影响

### 6.3 价格快照

- OrderItem 存储下单时的 unit_price/sku_code/spec_combo/product_name
- 确保历史订单数据不受后续 SKU 变更影响，财务可追溯

### 6.4 预签名 URL 上传 + 安全校验

- 大文件直传 MinIO，避免 Node.js 内存/线程消耗
- S3 API 兼容，未来切换云存储仅改配置
- 权衡: 需要两步操作 (获取 URL + 上传)，但换来更好的性能和用户体验
- **安全校验（双层）**:
  1. **预签名阶段** — 生成 URL 时按场景分别限制：
     - 代打客户上传：仅 `STL/STEP/OBJ/3MF`，≤100MB
     - 管理员产品模型上传：仅 `glTF/GLB`，≤50MB
     - 图片上传：`image/jpeg, image/png, image/webp, image/svg+xml`，≤10MB
  2. **上传完成回调** — 服务端接收回调后校验文件 magic bytes，不依赖扩展名判定类型；校验失败自动删除并告警
- 图片上传后自动压缩生成缩略图（sharp/nestjs-sharp），节省 CDN 带宽

### 6.5 后台 Vite SPA

- 后台不需要 SEO/SSR，Vite SPA 更轻量
- Ant Design 在 SPA 模式下开发体验更好
- 独立部署和升级，与前台解耦

### 6.6 搜索: PG tsvector (v1)

- 初期数据量千级到万级，PG 全文搜索完全胜任
- 避免 ES 运维成本
- 架构预留搜索接口抽象，未来可注入 ES 实现

### 6.7 操作日志表

- 订单和询价状态变更写入独立 Log 表
- 支持时间线展示、操作审计、客户纠纷追溯

### 6.8 代打转订单事务

- 「接受报价 -> 转化订单」使用数据库事务保证原子性
- 避免「已接受但未生成订单」的不一致

### 6.9 状态管理

| 应用 | 策略 | 理由 |
|------|------|------|
| Next.js 前台 | RSC + SWR | RSC SEO友好；SWR 管理客户端交互 |
| React 后台 | Zustand + TanStack Query | Zustand 轻量；Query 管理 API 缓存 |

### 6.10 预留扩展点

| 扩展方向 | 预留方式 |
|----------|----------|
| 多语言 | 文案 key 化 + SystemConfig 语言配置 + 表级 translations JSONB |
| 支付对接 | Order 表预留 payment_method/status/paid_at |
| 多站点 SaaS | 核心表预留 tenant_id + 中间件租户识别 |
| 搜索引擎升级 | 搜索方法接口抽象 + PG tsvector 当前实现 |
| 通知系统 | SystemConfig notification 分组 + Log 事件模型作为触发器数据源 |

---

## 7. 腾讯云部署方案

### 7.1 部署架构

```
                              ┌──────────────────────────────────────────────┐
                              │          腾讯云 CVM  4核4G / 40G SSD          │
                              │                                              │
  ┌──────────┐               │  ┌─────────────────────────────────────────┐  │
  │   用户    │               │  │          Nginx (反向代理)                │  │
  │  (浏览器) │── HTTPS ──────▶│  │  :443 → SSL 卸载 → gzip → 转发         │  │
  └──────────┘               │  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ │  │
                              │  │  │ Frontend │ │  Admin   │ │ Server  │ │  │
  ┌──────────┐               │  │  │ :3000    │ │  :3001   │ │ :4000   │ │  │
  │   管理员   │── HTTPS ──────▶│  │  └──────────┘ └──────────┘ └────┬────┘ │  │
  └──────────┘               │  │                                     │      │  │
                              │  │  ┌──────────┐                      │      │  │
                              │  │  │  MinIO   │◄─────────────────────┘      │  │
                              │  │  │ :9000    │   图片 / 模型 / 代打文件     │  │
                              │  │  └──────────┘                             │  │
                              │  └─────────────────────────────────────────┘  │
                              │                                              │
                              └──────────────────────┬───────────────────────┘
                                                     │
        ┌────────────────────────────────────────────┼───
        │                腾讯云 VPC (私有网络)          │
        │  ┌────────────────────┐  ┌──────────────┐  │
        │  │ TencentDB          │  │ TencentDB    │  │
        │  │ PostgreSQL 2核4G   │  │ Redis 2G     │  │
        │  └────────────────────┘  └──────────────┘  │
        └────────────────────────────────────────────┘───
```

**域名规划**：

| 域名 | 指向 | 说明 |
|------|------|------|
| `ymbj.online` / `www.ymbj.online` | Nginx → Frontend :3000 | 前台 |
| `admin.ymbj.online` | Nginx → Admin :3001 | 后台 |
| `api.ymbj.online` | Nginx → Server :4000 | API (可选独立域名) |
| `static.ymbj.online` | Nginx 代理 MinIO | MinIO 文件公开访问 |

### 7.2 资源限制与应对策略

当前配置 **4核4G / 40G SSD / 3Mbps / 300GB 月流量**，需注意以下约束：

| 约束 | 影响 | 应对 |
|------|------|------|
| **内存 4GB** | 5 个容器（Nginx~128M + MinIO~512M + Frontend~512M + Admin~128M + Server~1536M ≈ 2.8GB），剩余 1.2G 给系统+峰值 | Docker Compose 中设置 `mem_limit` 上限；Server 加 `NODE_OPTIONS="--max-old-space-size=1024"` |
| **磁盘 40G** | 系统~10G + Docker~5G + MinIO 文件需控制在~20G 以内 | MinIO Bucket 配额 + 定时清理过期代打文件（7天自动过期） |
| **带宽 3Mbps** | 理论峰值 ~375KB/s，3D 模型文件（假设 10MB glTF）下载需 ~30s | Nginx gzip_static 预压缩；图片用 WebP + 响应式尺寸；大文件提示预计下载时间 |
| **流量 300G/月** | 1 个 10MB 模型被下载 10000 次 = 100G | 静态资源设置强缓存（1年）；后续上 CDN 分担 |

> 短期内 40G SSD 足够（万级图片 + 千级模型文件），待业务增长后再申请挂载数据盘或迁移到 COS。

### 7.3 腾讯云服务清单

| 服务 | 产品 | 当前配置 | 月费估算 |
|------|------|----------|----------|
| 计算 | CVM 云服务器 | 4核4G, 40G SSD, 3Mbps, 300G/月 | 已购 |
| 数据库 | TencentDB PostgreSQL | 2核4G, 100G SSD | ¥400-600 |
| 缓存 | TencentDB Redis | 2G 标准版 | ¥150-200 |
| SSL | SSL 证书 | 免费 DV 证书 | ¥0 |
| 域名 | 域名注册 + DNS 解析 | DNSPod 免费版 | ¥60/年 |

> 腾讯云 CVM 和 TencentDB/Redis 需在同一 VPC 下，走内网通信（低延迟、免流量费）。

### 7.4 文件存储（MinIO 自托管）

开发和生产环境均使用 MinIO，部署在同一台 CVM 上。S3 API 兼容，后续迁移 COS 只需改环境变量。

```typescript
// server/src/config/storage.config.ts
export const storageConfig = {
  endpoint: process.env.STORAGE_ENDPOINT,     // http://minio:9000 (Docker 内部网络)
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  bucket: process.env.STORAGE_BUCKET,         // 默认: 3dprint
  publicBaseUrl: process.env.STORAGE_PUBLIC_URL, // https://ymbj.online/static
};
```

**MinIO 运维要点**：

| 项 | 配置 |
|----|------|
| 存储路径 | CVM 上 Docker Volume 挂载到 `/opt/3dprint/data/minio` |
| 磁盘配额 | 单个 Bucket 限制 20G（预留系统空间），`mc quota set` |
| 自动清理 | 代打上传文件（InquiryFile）7 天自动过期，定时任务配合 MinIO Lifecycle Rule |
| 公开访问 | 图片/模型文件 Bucket 策略设为 `download` 公开读；Nginx 反向代理 MinIO 的 `/static` 路径 |
| CORS | 允许 `ymbj.online` 和 `admin.ymbj.online` 跨域请求 |
| 备份 | 重要数据定时 `mc mirror` 到本地另一路径或异地 CVM |

**后续升级路径**：业务增长后，只需修改 `STORAGE_ENDPOINT` 等 4 个环境变量即可切换到 COS（S3 API 完全兼容）。

### 7.5 Nginx 反向代理配置

```nginx
# /etc/nginx/conf.d/3dprint.conf

# ---- 全局 ----
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml application/wasm;
gzip_min_length 1024;
gzip_vary on;

# 静态文件强缓存 (图片/字体/3D模型)
map $uri $static_cache {
    ~*\.(jpg|jpeg|png|gif|webp|svg|ico)$  "public, max-age=31536000, immutable";
    ~*\.(gltf|glb|bin)$                    "public, max-age=86400";
    ~*\.(woff|woff2|ttf|eot)$             "public, max-age=31536000, immutable";
    default                                 "no-cache";
}

# ---- 安全响应头 (全局) ----
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;

# 静态文件强缓存 (图片/字体/3D模型)
map $uri $static_cache {
    ~*\.(jpg|jpeg|png|gif|webp|svg|ico)$  "public, max-age=31536000, immutable";
    ~*\.(gltf|glb|bin)$                    "public, max-age=86400";
    ~*\.(woff|woff2|ttf|eot)$             "public, max-age=31536000, immutable";
    default                                 "no-cache";
}

# ---- 前台 (Next.js SSR) ----
server {
    listen 443 ssl http2;
    server_name ymbj.online www.ymbj.online;

    ssl_certificate     /etc/nginx/ssl/ymbj.online.pem;
    ssl_certificate_key /etc/nginx/ssl/ymbj.online.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # MinIO 文件公开访问 (图片/模型/代打文件下载)
    location /static/ {
        proxy_pass http://minio:9000/;
        proxy_set_header Host $host;
        add_header Cache-Control $static_cache;
        client_max_body_size 0;
    }

    # API 请求转发后端
    location /api/ {
        proxy_pass http://server:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100m;
    }

    # Next.js SSR
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ---- 后台 SPA ----
server {
    listen 443 ssl http2;
    server_name admin.ymbj.online;

    ssl_certificate     /etc/nginx/ssl/admin.ymbj.online.pem;
    ssl_certificate_key /etc/nginx/ssl/admin.ymbj.online.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /api/ {
        proxy_pass http://server:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100m;
    }

    location / {
        proxy_pass http://admin:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-cache";
    }
}

# ---- HTTP → HTTPS ----
server {
    listen 80;
    server_name ymbj.online www.ymbj.online admin.ymbj.online;
    return 301 https://$host$request_uri;
}
```

### 7.6 Docker 生产部署

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - frontend
      - admin
      - server
      - minio
    mem_limit: 128m
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://ymbj.online/api/v1
    mem_limit: 512m
    restart: always

  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "3001:80"
    mem_limit: 128m
    restart: always

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}
      - REDIS_URL=redis://:${REDIS_PASS}@${REDIS_HOST}:6379
      - STORAGE_ENDPOINT=http://minio:9000
      - STORAGE_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - STORAGE_SECRET_KEY=${MINIO_SECRET_KEY}
      - STORAGE_BUCKET=3dprint
      - STORAGE_PUBLIC_URL=https://ymbj.online/static/3dprint
      - JWT_USER_SECRET=${JWT_USER_SECRET}
      - JWT_ADMIN_SECRET=${JWT_ADMIN_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - NODE_OPTIONS=--max-old-space-size=1024
    mem_limit: 1536m
    restart: always
    depends_on:
      - minio

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"    # S3 API
      - "9001:9001"    # Web 控制台 (仅内网访问或 IP 白名单)
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    mem_limit: 512m
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  minio_data:
    driver: local
    driver_opts:
      device: /opt/3d-print/data/minio
      o: bind
```

### 7.7 环境变量规划

```bash
# .env.prod — 生产环境变量 (加入 .gitignore，不提交)

# ---- 数据库 (TencentDB PostgreSQL) ----
DB_HOST=10.0.x.x            # VPC 内网 IP
DB_PORT=5432
DB_NAME=3dprint
DB_USER=3dprint_admin
DB_PASS=<password>

# ---- Redis (TencentDB Redis) ----
REDIS_HOST=10.0.x.x         # VPC 内网 IP
REDIS_PORT=6379
REDIS_PASS=<password>

# ---- MinIO ----
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>

# ---- JWT ----
JWT_USER_SECRET=<random-64-chars>
JWT_ADMIN_SECRET=<random-64-chars>

# ---- 邮件 ----
SMTP_HOST=smtp.ymbj.online
SMTP_PORT=587
SMTP_USER=noreply@ymbj.online
SMTP_PASS=<password>
```

> 生成随机密钥: `openssl rand -base64 64`

### 7.8 部署流程

```
前提: 域名 ymbj.online + 子域名已解析到 CVM，Nginx 已在运行，服务器可直接 git pull。

1. 腾讯云控制台 (首次)
   ├── TencentDB PostgreSQL — 创建实例，加入 CVM 到白名单
   └── TencentDB Redis — 创建实例，加入 CVM 到白名单

2. CVM 环境准备 (首次，如需)
   ├── 安装 Docker: curl -fsSL https://get.docker.com | bash
   ├── 创建目录: mkdir -p /opt/3d-print/data/minio
   └── 安装 MinIO 客户端: wget https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc

3. SSL 证书 (首次 + 定期续期)
   ├── 腾讯云 SSL 控制台申请免费证书
   └── 证书上传到服务器 Nginx ssl 目录，更新代理配置引用

4. 代码部署 (每次发布)
   ├── cd /opt/3d-print && git pull origin master
   ├── 复制 .env.prod，填写生产密钥
   ├── docker compose -f docker-compose.prod.yml up -d --build
   ├── docker system prune -f   # 清理旧镜像
   └── curl https://ymbj.online/api/v1/products   # 健康检查

5. MinIO 初始化 (首次)
   ├── mc alias set prod http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
   ├── mc mb prod/3dprint
   ├── mc quota set prod/3dprint --size 20G
   └── mc policy set download prod/3dprint

6. 数据库初始化 (首次)
   ├── docker compose exec server npx prisma migrate deploy
   └── docker compose exec server npx prisma db seed
```

### 7.9 CI/CD 建议

```yaml
# .github/workflows/deploy.yml
name: Deploy to Tencent Cloud

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.CVM_HOST }}
          username: root
          key: ${{ secrets.CVM_SSH_KEY }}
          script: |
            cd /opt/3d-print
            git pull origin master
            docker compose -f docker-compose.prod.yml up -d --build
            docker system prune -f
```

### 7.10 基础运维

| 项 | 方案 |
|----|------|
| 日志收集 | `docker logs` + 输出到 `/var/log/3dprint/`，NestJS 写 JSON 格式日志 |
| 进程守护 | Docker `restart: always` + `docker-compose` |
| 数据库备份 | TencentDB 自动备份（7天保留）+ 手动逻辑备份 |
| 性能监控 | 腾讯云云监控 (CPU/内存/磁盘/带宽) |
| 错误追踪 | Sentry (前端+后端) 或自建 |
| 定时任务 | NestJS `@nestjs/schedule` + Bull Queue (Redis) 处理邮件发送、过期清理 |
| 健康检查 | `GET /api/v1/health` — DB + Redis + Storage 连通性 |

---

> 下一步: 进入 M1 阶段 (项目脚手架+数据库迁移+认证系统)
