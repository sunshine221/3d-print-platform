# 001 — TransformInterceptor 未注册导致前端登录失败

**日期**：2026-05-12 | **分类**：Bug / 后端

## 现象

Admin 登录页 `https://admin.ymbj.online/login` 输入正确账号密码，API 返回 HTTP 200 且响应体包含 token，但页面弹出"登录失败"。

## 排查过程

1. curl 直连后端，确认 API 正常返回 200，响应体为：
   ```json
   {"accessToken":"...", "refreshToken":"...", "expiresIn":900, "user":{...}}
   ```
2. 检查前端 `LoginPage.tsx:15`：`localStorage.setItem('admin_token', data.data.accessToken)`
3. 发现响应没有 `{code:0, data:{...}}` 包装，`data.data` 是 `undefined`，访问 `.accessToken` 抛 TypeError
4. catch 块只显示通用"登录失败"，吞掉了具体错误

## 根因

`TransformInterceptor` 在 `common/interceptors/transform.interceptor.ts` 已定义，但 `main.ts` 遗漏了 `app.useGlobalInterceptors(new TransformInterceptor())`。同样 `AllExceptionsFilter` 也未注册。

NestJS 的拦截器/过滤器/管道/守卫必须通过 `useGlobal*` 或 `APP_*` provider 显式注册才会生效，仅定义不被框架发现。

## 修复

在 `apps/server/src/main.ts` 中注册：

```ts
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalFilters(new AllExceptionsFilter());
```

## 教训

- NestJS 全局组件（拦截器/过滤器/管道/守卫）不会自动发现，必须在 main.ts 显式注册
- 前端 catch 块不要吞掉错误细节：至少 `console.error(err)`，展示给用户的消息应包含具体原因
- API 响应格式应通过拦截器统一保证，不要依赖每个 controller 手动包装

## 关联

- [[deployment]] — Nginx 反向代理与 API 响应
- `apps/server/src/main.ts` — 全局组件注册位置
