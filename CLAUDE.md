# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指导。

## 上下文引导

新对话时优先读取以下文件了解项目上下文：

- `CLAUDE.md`（本文件）
- `README.md`
- `specs/requirements.md`、`specs/architecture.md`
- `docs/README.md`（知识库索引）
- `contexts/context.md`（如存在）

## 项目概述

这是一个 **3D 打印平台** monorepo，包含两条业务线：
1. **SKU 下单** — 标准产品，含规格组合、定价和订单跟踪
2. **代打服务** — 客户提交需求 → 管理员报价 → 订单转化

## 文档结构

- `specs/` — 需求文档、架构设计
- `docs/` — 知识库（优先查阅）
  - `README.md` — 全部条目索引
  - `CHANGELOG.md` — 重要变更记录
  - `deployment.md` — 部署指南
  - `NNN-*.md` — 独立知识条目（踩坑、学习、决策）

## 知识沉淀规范

> 所有值得记忆的内容——不仅是问题和修复，还有学习心得、技术决策、最佳实践——都必须记录到 `docs/`。

### 何时记录

- **踩坑修复**：非显而易见的 bug、根因、解决过程
- **学习心得**：新发现的技术模式、框架行为、工具技巧
- **技术决策**：选型理由、架构权衡、设计取舍
- **环境变更**：配置修改、依赖升级、部署流程调整

### 记录格式

每个独立条目文件（`NNN-见名知意.md`）：
1. 编号标题：`# NNN — 一句话描述`
2. 元信息行：`**日期** | **分类**`（Bug/运维/前端/后端/数据库/学习/决策…）
3. 正文：现象 → 根因 → 修复/结论 → 教训
4. 关联：`[[other-file]]` 链接相关条目

编号三位数字，按时间顺序递增。文件名 kebab-case，见名知意。

### 执行规则

- 值得记录的内容必须留下记录，不是可选项
- 每次会话结束时检查是否有新知识需要写入
- `docs/README.md` 索引和 `docs/CHANGELOG.md` 变更记录同步更新
- 代码层面的变更（bug 修复、feature 实现）通过 git commit 记录，不在此列

## 工具使用

### Agent 速查（按场景）

以下场景优先使用 Agent，不在主对话中逐文件操作：

| 场景 | Agent |
|------|-------|
| 多文件代码探索 | Explore |
| 代码审查（PR 前） | code-reviewer |
| 安全检查 | security-auditor |
| 测试编写 | test-automator |
| 代码简化/重构 | code-simplifier |
| 架构评审 | architecture-reviewer |
| 性能分析 | performance-engineer |
| 独立并行任务 | general-purpose |

## 仓库结构

```
apps/server/       @3d-print/server     NestJS 10 API 后端（端口 4000，前缀 /api/v1）
apps/frontend/     @3d-print/frontend   Next.js 14 用户端网站（端口 3000）
apps/admin/        @3d-print/admin      Vite + React 18 管理后台
packages/types/    @3d-print/types      共享 TypeScript 类型（DTO、枚举、API 接口）
packages/utils/    @3d-print/utils      共享工具函数（formatPrice、formatDate、常量）
packages/ui/       @3d-print/ui         共享 React 组件（StatusBadge、PriceDisplay）
```

工作区包之间通过 `workspace:*` 协议引用。三个应用均依赖共享包。

## 常用命令

```bash
# 开发（启动所有应用）
pnpm dev                    # turbo dev — 启动 server:4000、frontend:3000

# 单独启动
pnpm --filter @3d-print/server dev          # NestJS，带 --watch
pnpm --filter @3d-print/frontend dev        # Next.js 开发服务器
pnpm --filter @3d-print/admin dev           # Vite 开发服务器

# 数据库
pnpm db:migrate             # prisma migrate dev
pnpm db:seed                # 写入种子数据
pnpm db:studio              # prisma studio 可视化界面

# 测试
pnpm test                   # 单元测试（Jest，*.spec.ts）
pnpm test:e2e               # 端到端测试（supertest）
pnpm test:cov               # 单元测试 + 覆盖率
pnpm --filter @3d-print/server test -- --testPathPattern=auth  # 单个测试套件

# 代码质量
pnpm typecheck              # 全仓库 tsc --noEmit 类型检查
pnpm lint                   # ESLint + typecheck
pnpm format                 # Prettier 格式化

# 构建
pnpm build                  # turbo build（dependsOn: ^build）
```

## 基础设施（docker-compose.yml）

| 服务 | 端口 | 说明 |
|---------|------|-------|
| PostgreSQL 16 | 5432 | 用户:postgres / 密码:postgres / 库:3dprint |
| Redis 7 | 6379 | 无密码 |
| MinIO（S3） | 9000（API），9001（控制台） | minioadmin / minioadmin |
| MailHog（SMTP） | 1025（SMTP），8025（Web 界面） | 拦截所有邮件，在 localhost:8025 查看 |

## 后端架构（NestJS）

### 模块结构
```
src/
  main.ts                    # 启动入口：ValidationPipe + CORS + /api/v1 前缀
                             # ⚠️ 拦截器/过滤器必须在 main.ts 显式注册才能生效
  app.module.ts              # 根模块：ConfigModule + ThrottlerModule + Auth/AdminAuth/User
  common/
    decorators/              # @Public()、@CurrentUser()
    guards/                  # JwtAuthGuard、JwtAdminGuard（继承 passport-jwt）
    interceptors/            # TransformInterceptor — 将响应包装为 {code:0, data, message}
    filters/                 # AllExceptionsFilter — 返回 {code:N*100, message, data:null}
  modules/
    auth/                    # 用户认证：注册、登录、刷新令牌、登出、发送验证码、密码操作
    admin-auth/              # 管理员认证：登录、刷新令牌、登出、获取当前用户、修改密码
    user/                    # 用户资料 CRUD
```

### 认证系统（双通道）

- **用户 JWT**：使用 `JWT_USER_SECRET` 签名（默认 `dev-user-secret`），access token 15 分钟 / refresh token 7 天
- **管理员 JWT**：使用 `JWT_ADMIN_SECRET` 签名（默认 `dev-admin-secret`），access token 15 分钟 / refresh token 7 天
- **Refresh token 轮换**：刷新时旧 token 立即失效
- **守卫机制**：`JwtAuthGuard` 校验 JWT，跳过带有 `@Public()` 装饰器的路由
- **管理员角色**：存储在 `roles` 表中，permissions 字段为 JSON 数组

### 数据库（Prisma）

Schema 文件位于 `apps/server/prisma/schema.prisma`。核心模型：
- `User` / `AdminUser` — 双用户表，共享 `refresh_tokens` 表
- `Product` → `SKU` — 产品包含规格组合（材质、颜色、尺寸），每种 SKU 有独立定价
- `Order` → `OrderItem` → `SKU` — 订单引用 SKU 并保存价格快照
- `PrintServiceInquiry` — 代打咨询 → 管理员报价 → 可选转为订单
- 辅助模型：`Category`、`Banner`、`Page`、`MediaLibrary`、`SystemConfig`、`OperationLog`、`PageView`、`ContactMessage`

所有金额在 Prisma 中以 `Decimal` 类型存储，价格为人民币（CNY）。

### API 响应格式

所有响应统一包装：`{ code: 0, data: <数据>, message: "ok" }`。错误响应：`{ code: <状态码*100>, message: <错误信息>, data: null }`。

## 前端架构

- **App Router**，路由分组：`(public)`、`(auth)`、`(account)`（需登录）
- **中间件**（`middleware.ts`）：对 `/account/*` 和 `/inquiry` 检查 `access_token` cookie；已登录用户访问 `/login` 时重定向
- **Three.js**：使用 `@react-three/fiber` + `@react-three/drei` 实现 3D 模型预览
- **数据获取**：客户端使用 SWR

## 管理后台架构

- **Vite + React 18**：SPA 单页应用，使用 React Router 6
- **UI 框架**：Ant Design 5 + @ant-design/icons
- **状态管理**：Zustand（客户端状态）+ TanStack React Query（服务端状态）

## 测试模式

单元测试在模块级别 mock Prisma（`jest.mock('@prisma/client')`）并 mock bcrypt。测试使用 `@nestjs/testing` 的 `Test.createTestingModule()`。端到端测试使用 `supertest` 对 NestJS 应用实例发起请求，mock Prisma 并覆盖守卫。

## 代码规范

- `strict: true`，启用 `noUncheckedIndexedAccess`
- Prettier：单引号、尾随逗号、100 字符宽度、2 空格缩进
- 模块解析：`bundler`（兼容 ESM）
- 装饰器通用顺序：`@Public()` 在最前，然后是 HTTP 方法装饰器，最后是 `@CurrentUser()` 参数装饰器
- Prisma 客户端以模块级常量方式实例化（`const prisma = new PrismaClient()`），不通过 DI 注入
