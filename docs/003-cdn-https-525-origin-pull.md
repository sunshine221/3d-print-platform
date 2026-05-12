# 003 — EdgeOne CDN 回源 HTTPS 525 错误

**日期**：2026-05-12 | **分类**：运维 / CDN

## 现象

EdgeOne CDN 配置完成后，浏览器通过 HTTPS 访问域名报 525 错误（CDN 与源站 SSL 握手失败）。

## 根因

CDN 回源协议设为 HTTPS（443），但 nginx 当时只配置了 80 端口监听，没有 SSL。CDN 尝试与源站 443 端口 TLS 握手，连接被拒绝。

## 修复

1. 生成自签名证书：
   ```bash
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/nginx/ssl/ymbj.online.key \
     -out /etc/nginx/ssl/ymbj.online.crt \
     -subj "/CN=*.ymbj.online"
   ```
2. Nginx 为每个 server block 添加 443 端口监听并配置证书
3. EdgeOne 默认不验证源站证书，自签名证书即可使用

## 教训

- CDN 回源协议（HTTP/HTTPS）必须与 nginx 监听端口一致，不能一端配 HTTPS 另一端只开 HTTP
- 自签名证书对 CDN 回源足够，正式环境面向用户时需通过 CDN 托管证书
- 排查 5xx 错误时先确认 CDN → 源站这层连接是否通畅

## 关联

- [[deployment]] — Nginx SSL 配置
