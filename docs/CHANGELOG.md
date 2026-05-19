# 变更日志

> 记录项目配置、架构、部署等非代码层面的重要变更。代码变更通过 git log 查看。

## 2026-05-19

### feat: 管理后台移动端响应式全面适配 + antd message 上下文修复

- **范围**：23 个文件（22 个页面/组件 + 1 个服务桥接）
- **侧边栏**：桌面端可折叠 Sider + 移动端覆层式抽屉
- **列表页**：12 个页面统一响应式模式（flexWrap 筛选区 + 表格横向滚动 + 分页自适应）
- **仪表盘**：状态标签中文化、金额分→元修复、antd 5 API 迁移
- **message 上下文**：静态导入 → `App.useApp()` hooks 模式 + `messageHolder` 桥接
- **关联**：[[008-admin-mobile-responsive-message-context]]

## 2026-05-18

### feat: 双主题（亮色/暗色）+ 随系统切换

- **范围**：全站 35 个文件，新增 ThemeProvider + ThemeToggle 组件
- **方案**：CSS 变量 + Tailwind `darkMode: 'class'`，组件通过 `dark:` 变体适配
- **色系**：void（表面色）/ cyber（青色强调）/ neon（紫色次强调），亮暗各一套 RGB 值
- **修复**：亮色模式文字不可见、SKU 选项对比度、首页背景不统一、分类卡片高度、glow-line 蓝色线条等 11 个 UI 问题
- **关联**：[[007-dual-theme-css-variables]]

## 2026-05-12

### 修复：TransformInterceptor 与 AllExceptionsFilter 未注册

- **文件**：`apps/server/src/main.ts`
- **变更**：新增 `app.useGlobalInterceptors(new TransformInterceptor())` 和 `app.useGlobalFilters(new AllExceptionsFilter())`
- **原因**：拦截器和过滤器已定义但未在 main.ts 注册，导致 API 响应格式不符合 `{code:0, data, message}` 规范
- **影响**：所有 API 响应现在均被统一包装
- **关联**：[[001-transform-interceptor-not-registered]]

### 改进：Admin 登录页错误处理

- **文件**：`apps/admin/src/pages/LoginPage.tsx`
- **变更**：catch 块改为打印具体错误到 console，错误消息改为动态获取（`err.response.data.message || err.message`）而非硬编码"登录失败"
- **原因**：原代码吞掉所有错误细节，排查困难

### 文档：知识库体系建立（v2）

- **新增**：`docs/` 目录，包含：
  - `README.md` — 知识索引
  - `CHANGELOG.md` — 本文件
  - `001-006` — 6 篇独立踩坑记录
  - `deployment.md` — 部署指南
- **规范 v2**：
  - 每条经验独立编号文件，见名知意
  - 记录范围扩大：不限于问题排查，所有值得学习/记忆的内容都记录
  - 新增 CHANGELOG.md 跟踪非代码变更
- **规则位置**：全局 CLAUDE.md「知识沉淀」节，项目 CLAUDE.md「文档结构」节

### 配置：全局 CLAUDE.md 新增知识沉淀规则

- **文件**：`~/.claude/CLAUDE.md`
- **新增**：「知识沉淀」节——每次完成部署/排错/学习任务后自动追加到 `docs/`，不可跳过

### 基础设施：Nginx SSL 配置完成

- **文件**：`/etc/nginx/sites-available/default`
- **变更**：完整配置 HTTP→HTTPS 重定向、两个 443 server block（ymbj.online 前台 + admin.ymbj.online 后台）
- **证书**：自签名证书 `/etc/nginx/ssl/ymbj.online.{crt,key}`，通配符 `*.ymbj.online`

### 部署：Admin 静态文件迁移到 /opt

- **原因**：www-data 用户无法读取 `/home/ubuntu/` 目录
- **变更**：Admin 构建产物部署目录改为 `/opt/3dprint/admin/`
- **后续**：后续如有 CI/CD，部署路径可配置化
