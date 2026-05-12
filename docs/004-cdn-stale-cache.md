# 004 — CDN 缓存导致更新不生效

**日期**：2026-05-12 | **分类**：运维 / CDN

## 现象

修改 nginx 配置或部署新前端后，浏览器访问仍是旧内容，curl 直连源站却已更新。

## 根因

EdgeOne CDN 缓存了旧响应。不同子域名（`ymbj.online` / `admin.ymbj.online`）属于不同的 CDN zone，各有独立的缓存，需要分别清除。

## 修复

- 在 EdgeOne 控制台手动清除缓存（两个 zone 逐一操作）
- 开发调试时可临时绑 hosts 指向源站绕过 CDN 验证

## 教训

- CDN 缓存是多层、分 zone 的，不能假设清一个等于清全部
- 排查"更新不生效"时先用 curl 直连源站确认源站状态，再判断是否为缓存问题
- 部署流程应包含 CDN 缓存刷新步骤

## 关联

- [[deployment]] — CDN 配置
- [[003-cdn-https-525-origin-pull]] — 同一 CDN 平台的前置问题
