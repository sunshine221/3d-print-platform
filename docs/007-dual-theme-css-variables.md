# 007 — 双主题（亮色/暗色）实现方案

**2026-05-18** | 前端 / 设计 / 决策

## 背景

项目最初采用纯深色主题，科技感强但不利于普通顾客日常浏览。需要同时支持亮色/暗色双主题，并随系统偏好自动切换。

## 方案选择

**核心决策：CSS 变量 + Tailwind `darkMode: 'class'`**

- `void`/`cyber`/`neon` 三个色系名称在所有组件中不变
- `:root` 和 `.dark` 中分别定义不同的 RGB 通道值
- Tailwind 颜色令牌引用 CSS 变量：`rgb(var(--void-100) / <alpha-value>)`
- 组件通过 `dark:` 变体适配：`text-void-900 dark:text-void-100`
- 组件文件**零类名修改**，仅加 `dark:` 覆盖

**为什么不用 Tailwind 内置的 `darkMode: 'media'`**：用户需要手动切换的能力（三态：系统/亮/暗），`class` 策略更灵活。

## 色值设计

采用「清透科技」风格：

- **亮色模式**：slate 系白底（`#f8fafc`），青色（`#0891b2`→`#06b6d4`）强调，紫色（`#7c3aed`→`#8b5cf6`）次强调
- **暗色模式**：slate-900 底（`#0f172a`），电光青（`#00e5ff`），霓虹紫（`#b388ff`）

关键原则：`void` 色阶保持相对明暗一致 — void-50 在两个主题中都是最亮的，void-950 都是最暗的。

## 关键文件

| 文件 | 作用 |
|------|------|
| `apps/frontend/tailwind.config.ts` | `darkMode: 'class'`，colors 改用 CSS 变量 |
| `apps/frontend/src/app/globals.css` | `:root` / `.dark` 双套变量 + 组件类 + 滚动条 |
| `apps/frontend/src/components/theme/ThemeProvider.tsx` | React Context，三态管理 + localStorage 持久化 |
| `apps/frontend/src/components/theme/ThemeToggle.tsx` | 三态循环按钮：暗→亮→系统→暗 |

## 暗色专属装饰元素

以下装饰效果仅暗色模式显示，亮色模式下通过 `:root:not(.dark) .className { display: none; }` 隐藏：

- `.glow-line` — 青色渐变分割线
- `.grid-scroll-overlay::before` — 滚动网格动画
- `.scan-line-overlay::after` — 扫描线动画

## 踩坑记录

1. **`text-void-100` 在亮色模式不可见**：void-100 亮色值是 `rgb(241,245,249)`（浅灰），在白底上几乎看不见。解决方案是所有文字颜色加 `dark:` 变体：`text-void-900 dark:text-void-100`。

2. **disabled 按钮在暗色模式对比度不足**：`text-void-600` 在暗色下是 `rgb(26,31,46)`（接近黑色），`opacity-40` 后几乎不可见。需明确指定 `dark:text-void-300`。

3. **输入框背景色**：硬编码 `bg-void-800 text-void-200` 在亮色模式下变成深色输入框配浅色文字在白底上。需改为 `bg-void-100 dark:bg-void-800 text-void-800 dark:text-void-200`。

## 关联

- [[008-next-theme-flicker-fix]]（如后续处理 SSR 闪烁问题）
