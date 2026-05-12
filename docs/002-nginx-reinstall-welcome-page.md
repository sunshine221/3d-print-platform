# 002 — Nginx 重装后仍显示默认欢迎页

**日期**：2026-05-12 | **分类**：运维 / Nginx

## 现象

`sudo apt purge nginx` 重装并配置完毕后，访问域名仍看到 "Welcome to nginx!" 默认页，而非应用内容。

## 根因

`apt purge` 不会自动停止 systemd socket 激活的 nginx 实例。旧 socket 文件残留在 `/run/`，重装后继承了旧 socket 和旧 worker 进程，新配置未生效。

## 修复

```bash
sudo systemctl stop nginx.socket
sudo systemctl disable nginx.socket
sudo systemctl restart nginx
```

验证：`sudo ss -tlnp | grep nginx` 确认监听端口和配置一致。

## 教训

- systemd socket 激活服务是独立生命周期，`apt purge` 不清理 socket
- 排查 nginx 问题时先检查 socket 状态：`systemctl status nginx.socket`
- 重装后务必用 `restart` 而非 `start`，强制重建所有相关进程

## 关联

- [[deployment]] — Nginx 配置
