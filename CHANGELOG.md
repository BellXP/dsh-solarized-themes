# Changelog

## 0.2.0 — 适配 dsh 0.2.2-rc.5

- **词表补全**：对照 dsh 0.2.2-rc.5 的 `design-platform.css`（154 个 `--dsw-alias-*` / `--dsw-specific-*` 令牌），
  覆盖面从 99 项补到 140 项，新增：hover card、卡片（plan / schedule / deliverable 共用）、菜单组头、
  选中边框、文档选区、拖放遮罩、`label-on-color` / shimmer / deep-diving、`state-done`、开关滑块、
  轨迹高亮、Turn 触发条、图表分类、插画分层、JSON 树、toast/tooltip 补位、文件上传轨道、引导页 hero。
  中间色仍一律 `color-mix` 从 Solarized 规范色板派生。
- **清理失效覆盖**：移除 rc.5 已不存在的 `--dsw-specific-sidebar-nav-item-hover`。
- **刻意不覆盖**（并在探针中登记）：纯黑遮罩 `bg-mask-{1,2,3,photo}` 与 macOS 专用的 sidebar glass/wash/tint 叠层。
- **插件页元数据**：新增 `locale/{en,zh}.json`（标题 + 描述）与 `icon.svg`，并补齐 `exports` / `files`，
  Plugins 页不再回退到包名和默认图标。
- **契约探针升级**：`scripts/check-dsh-contract.mjs` 现在会解析 `client/index.js` 的覆盖名，
  逐项核对是否仍存在于安装树（死覆盖 = FAIL），并列出安装树新增而尚未覆盖的令牌（INFO）。
- 核对并确认 rc.5 契约未变：`ctx.theme.register(ThemeDefinition)`、`theme/change`、`settings.general.item`
  插槽、`ctx.locale.register`、`window.__ModuleLoader__.load` 客户端工厂形态。

## 0.1.1

- 新增契约探针脚本 `scripts/check-dsh-contract.mjs`。

## 0.1.0

- 首个版本：Solarized Light / Dark 两套主题 + 设置 → 通用 的「Solarized 配色」行，偏好存于 localStorage。
