# 005 — Next.js 开发模式 CSS 丢失

**日期**：2026-05-12 | **分类**：前端 / Next.js

## 现象

Next.js 生产构建（`next build && next start`）后页面无样式，CSS 请求返回 404。开发模式（`next dev`）正常。

## 根因

`next build` 生成的 CSS 文件路径与开发模式不同，且 `.next/` 缓存中可能残留过期构建产物。Nginx 代理 `/_next/static/` 路径时，开发模式的静态资源处理与生产模式不一致。

## 修复

- 清理 `.next/` 缓存：`rm -rf apps/frontend/.next/`
- 开发环境统一使用 `pnpm dev`，不混用 build + start
- Nginx 对 `/_next/static/` 添加长缓存头：
  ```nginx
  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  ```

## 教训

- Next.js 开发与生产模式的静态资源策略不同，不要混用
- 切换模式时清理 `.next/` 缓存避免残留文件干扰
- `/_next/static/` 路径的缓存策略影响样式加载

## 关联

- [[deployment]] — Nginx 反向代理配置
