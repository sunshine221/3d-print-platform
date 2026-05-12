-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('standard', 'print_service', 'both');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "SKUStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'make_to_order');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending_confirmation', 'in_production', 'shipped', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('pending_review', 'quoted', 'negotiating', 'accepted', 'rejected', 'closed');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image', 'model_3d', 'model_upload', 'other');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('customer', 'admin');

-- CreateEnum
CREATE TYPE "OperatorType" AS ENUM ('customer', 'admin', 'system');

-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('register', 'reset_password');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "default_contact_name" TEXT,
    "default_contact_phone" TEXT,
    "default_address" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role_id" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "admin_user_id" TEXT,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CodeType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "image_url" TEXT,
    "description" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "product_type" "ProductType" NOT NULL DEFAULT 'standard',
    "materials" TEXT[],
    "techniques" TEXT[],
    "tolerance" TEXT,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "thumbnail_url" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models_3d" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" BIGINT,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_3d_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku_code" TEXT NOT NULL,
    "spec_combo" JSONB NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "min_order_qty" INTEGER NOT NULL DEFAULT 1,
    "stock_status" "StockStatus" NOT NULL DEFAULT 'make_to_order',
    "lead_time_days" INTEGER,
    "image_url" TEXT,
    "status" "SKUStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "coupon_code" TEXT,
    "note" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending_confirmation',
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "shipping_address" TEXT,
    "tracking_number" TEXT,
    "tracking_company" TEXT,
    "source_inquiry_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "sku_code" TEXT NOT NULL,
    "spec_combo" JSONB NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_logs" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "operator_type" "OperatorType" NOT NULL,
    "operator_id" TEXT,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_service_inquiries" (
    "id" TEXT NOT NULL,
    "inquiry_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT,
    "desired_material" TEXT,
    "desired_color" TEXT,
    "desired_quantity" INTEGER,
    "desired_size" TEXT,
    "desired_deadline" DATE,
    "additional_notes" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'pending_review',
    "admin_quote_unit_price" DECIMAL(65,30),
    "admin_quote_quantity" INTEGER,
    "admin_quote_total_price" DECIMAL(65,30),
    "admin_quote_note" TEXT,
    "admin_quote_delivery_days" INTEGER,
    "admin_quote_at" TIMESTAMP(3),
    "converted_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_service_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_files" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" BIGINT,
    "file_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_messages" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_logs" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "operator_type" "OperatorType" NOT NULL,
    "operator_id" TEXT,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" BIGINT,
    "file_type" "FileType" NOT NULL,
    "mime_type" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "is_folder" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "group_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "detail" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "page_path" TEXT NOT NULL,
    "visitor_id" TEXT,
    "user_id" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reply" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_codes_email_type_idx" ON "verification_codes"("email", "type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_sort_order_idx" ON "categories"("parent_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_product_type_idx" ON "products"("product_type");

-- CreateIndex
CREATE INDEX "product_categories_category_id_idx" ON "product_categories"("category_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "models_3d_product_id_key" ON "models_3d"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "skus_sku_code_key" ON "skus"("sku_code");

-- CreateIndex
CREATE INDEX "skus_product_id_status_idx" ON "skus"("product_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "orders_source_inquiry_id_key" ON "orders"("source_inquiry_id");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_logs_order_id_created_at_idx" ON "order_logs"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "print_service_inquiries_inquiry_no_key" ON "print_service_inquiries"("inquiry_no");

-- CreateIndex
CREATE INDEX "print_service_inquiries_user_id_created_at_idx" ON "print_service_inquiries"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "print_service_inquiries_status_idx" ON "print_service_inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiry_files_inquiry_id_idx" ON "inquiry_files"("inquiry_id");

-- CreateIndex
CREATE INDEX "inquiry_messages_inquiry_id_created_at_idx" ON "inquiry_messages"("inquiry_id", "created_at");

-- CreateIndex
CREATE INDEX "inquiry_logs_inquiry_id_created_at_idx" ON "inquiry_logs"("inquiry_id", "created_at");

-- CreateIndex
CREATE INDEX "banners_is_active_sort_order_idx" ON "banners"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "media_library_folder_id_idx" ON "media_library"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_group_name_idx" ON "system_config"("group_name");

-- CreateIndex
CREATE INDEX "operation_logs_admin_user_id_created_at_idx" ON "operation_logs"("admin_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "operation_logs_target_type_target_id_idx" ON "operation_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "page_views_page_path_created_at_idx" ON "page_views"("page_path", "created_at" DESC);

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_is_read_created_at_idx" ON "contact_messages"("is_read", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models_3d" ADD CONSTRAINT "models_3d_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_inquiry_id_fkey" FOREIGN KEY ("source_inquiry_id") REFERENCES "print_service_inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_logs" ADD CONSTRAINT "order_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_service_inquiries" ADD CONSTRAINT "print_service_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_service_inquiries" ADD CONSTRAINT "print_service_inquiries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_files" ADD CONSTRAINT "inquiry_files_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "print_service_inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_messages" ADD CONSTRAINT "inquiry_messages_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "print_service_inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_logs" ADD CONSTRAINT "inquiry_logs_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "print_service_inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
