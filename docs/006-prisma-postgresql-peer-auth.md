# 006 — Prisma 连接 PostgreSQL peer 认证失败

**日期**：2026-05-12 | **分类**：数据库

## 现象

`prisma migrate dev` 报错 `FATAL: password authentication failed` 或 `peer authentication failed`。

## 根因

PostgreSQL 默认使用 peer 认证（通过系统用户映射），但 Prisma 连接字符串使用的是密码认证（`postgres://postgres:postgres@localhost:5432/3dprint`）。当 `pg_hba.conf` 配置为 peer 时，密码认证被拒绝。

## 修复

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres'"
```

并确认 `/etc/postgresql/16/main/pg_hba.conf` 中 local 连接方式为 `md5` 而非 `peer`。

## 教训

- PostgreSQL 安装后默认认证方式取决于系统发行版和安装方式
- `peer` 认证走 Unix socket 时不需要密码，但 TCP 连接（`localhost:5432`）走 `host` 规则
- 排查连接问题时检查 `pg_hba.conf` 确认认证方式与连接字符串匹配

## 关联

- [[deployment]] — 数据库启动与连接配置
