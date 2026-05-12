# 部署指南

> 最后更新：2026-05-12

## 基础设施

| 服务 | 端口 | 说明 |
|------|------|------|
| PostgreSQL 16 | 5432 | 用户:postgres / 密码:postgres / 库:3dprint |
| Redis 7 | 6379 | 无密码 |
| MinIO (S3) | 9000 (API), 9001 (控制台) | minioadmin / minioadmin |
| MailHog (SMTP) | 1025 (SMTP), 8025 (Web) | 拦截所有邮件 |

启动基础设施：

```bash
docker compose up -d postgres redis minio mailhog
```

## 应用启动

### 开发模式

```bash
# 安装依赖（首次）
pnpm install

# 数据库迁移 + 种子数据
pnpm db:migrate
pnpm db:seed

# 启动所有应用
pnpm dev
```

### 单独启动

```bash
pnpm --filter @3d-print/server dev      # NestJS :4000
pnpm --filter @3d-print/frontend dev    # Next.js :3000
pnpm --filter @3d-print/admin dev       # Vite :3001
```

### 生产构建

```bash
# 构建 admin 后台
pnpm --filter @3d-print/admin build

# 部署到 nginx 目录
sudo cp -r apps/admin/dist/* /opt/3dprint/admin/
sudo chown -R www-data:www-data /opt/3dprint/admin/
```

## Nginx 配置

配置文件：`/etc/nginx/sites-available/default`

要点：
- HTTP(80) 强制跳转 HTTPS(443)
- SSL 终结于 nginx，后端走 HTTP 本地回环
- `/api/` 代理到 `http://127.0.0.1:4000`（NestJS）
- `/` 和 `/_next/static/` 代理到 `http://127.0.0.1:3000`（Next.js）
- admin 子域名为静态文件服务，直接读取 `/opt/3dprint/admin/`

重新加载 nginx：

```bash
sudo systemctl restart nginx   # systemd socket 激活场景必须用 restart
```

## CDN（EdgeOne）

域名 DNS 由腾讯云 EdgeOne CDN 管理（`eo.dnse0.com`）。`ymbj.online` 和 `admin.ymbj.online` 分别对应不同的 CDN zone，缓存需分别清除。

### 源站回源配置

- 回源协议：HTTPS（443）
- 源站证书：自签名证书（CDN 不验证源站证书）
- 注意：EdgeOne 不允许 `location = /` 精确匹配，改用 `location /` 前缀匹配
