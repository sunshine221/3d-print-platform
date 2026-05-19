# 008 — 管理后台移动端响应式适配 + antd message 上下文修复

**2026-05-19** | 前端/模式

## 背景

管理后台（Vite + React 18 + Ant Design 5）此前未针对移动端适配。所有列表页筛选区使用 `Row/Col` 固定栅格，在窄屏上挤压变形；表格列多时溢出容器无法滚动；侧边栏在移动端占据过多空间。

同时，多处 `import { message } from 'antd'` 静态导入引发 antd 5 警告：message 必须在 `App` 组件上下文内使用。

## 改动

### 1. 移动端侧边栏（AdminLayout.tsx）

- 新增 `MOBILE_BREAKPOINT = 991`，通过 `matchMedia` 监听
- 桌面端（≥992px）：Sider 可折叠，logo 旁显示品牌名
- 移动端（≤991px）：固定底部覆层（z-index 999）+ 半透明遮罩，点击遮罩关闭
- 导航后自动关闭移动端侧边栏
- Header 左侧新增汉堡按钮，移动端打开侧边栏，桌面端切换折叠

### 2. 列表页统一响应式模式

所有带筛选+分页的列表页采用一致模式：

- **标题栏**：`display: flex; flexWrap: wrap; gap: 8`
- **筛选区**：`display: flex; flexWrap: wrap; gap: 8; alignItems: center`
- **搜索框**：`flex: '1 1 180px'; minWidth: 140` — 自动伸缩
- **筛选 Select**：`width: 120; flexShrink: 0` — 固定宽度
- **搜索按钮**：`marginLeft: 'auto'` — 推到右侧
- **表格**：`scroll={{ x: 'max-content' }}` — 列溢出时横向滚动
- **分页**：`showSizeChanger: true; showTotal; position: ['bottomRight']`

涉及的页面（12 个）：ProductListPage, OrderListPage, InquiryListPage, CustomerListPage, LogListPage, BannerPage, CategoryPage, ContactMessagePage, PageListPage, MediaLibraryPage, DashboardPage, LoginPage

### 3. 仪表盘修复（DashboardPage.tsx）

- 状态标签从纯色块 `STATUS_COLORS` 改为中文化 `ORDER_STATUS_MAP` / `INQUIRY_STATUS_MAP`
  - 订单：「待确认」「生产中」「已发货」「已完成」「已取消」
  - 询价：「待审核」「已报价」「协商中」「已接受」「已拒绝」「已关闭」
- 价格显示修复：`Number(v) → Number(v) / 100`（金额以分为单位）
- `bodyStyle` → `styles={{ body: ... }}`（antd 5 API 迁移）

### 4. antd message 上下文修复

**问题**：`api.ts` 的 axios 拦截器中调用 `message.error()`，而 message 实例在 `App.useApp()` 外部无法获取上下文。

**方案**：桥接模式
- 新建 `messageHolder.ts`：`setMessageApi()` / `getMessage()` 闭包持有 message 实例
- `App.tsx` 中调用 `setMessageApi(message)`
- `api.ts` 拦截器通过 `getMessage()` 获取实例
- 所有页面组件统一从 `import { message }` 改为 `const { message } = App.useApp()`

### 5. 其他响应式修复

- LoginPage：Card `width: 400` → `maxWidth: 400; width: '100%'; margin: '0 16px'`
- ProductEditPage：`Col span={N}` → `Col xs={24} sm={N}`（移动端全宽堆叠）
- CustomerDetailPage：统计卡片 `span={6}` → `xs={24} sm={12} lg={6}`

## 教训

- antd 5 的 `message` / `notification` / `modal` 静态方法在 React 18 StrictMode 下不可用，必须通过 `App.useApp()` hooks 获取实例
- 对于非组件代码（如 axios 拦截器），需要桥接模式传递实例引用
- `scroll={{ x: 'max-content' }}` 比硬编码宽度（如 `x: 1200`）更灵活，适配任意列数
- Flexbox 的 `flex: '1 1 180px'` + `minWidth` 模式比 `Row/Col` 栅格更适合移动端自适应

## 关联

[[007-dual-theme-css-variables]]
