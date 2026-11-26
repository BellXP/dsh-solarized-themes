# dsh-solarized-themes

DeepSeek Harness (DSH) Web GUI 的 **Solarized 系列主题**：Solarized Light 与 Solarized Dark。

## 功能

- 在 **设置 → 通用** 里「外观」行下方新增一行「Solarized 配色」，三个选项：
  - **Solarized 浅色**（base3 米黄画布 + base01 墨绿正文）
  - **Solarized 深色**（base03 深青画布 + base1 青灰正文）
  - **关闭**（回到内置的浅色/深色/跟随系统偏好）
- 覆盖官方 design token 体系的语义槽：dsh 0.2.2 词表 154 个 `--dsw-alias-*` / `--dsw-specific-*` 令牌中覆盖 140 个
  （未覆盖的只有纯黑遮罩与 macOS 专用玻璃叠层，见 `client/index.js` 头注释）+ `--shiki-token-*` 代码语法高亮，
  中间色一律用 `color-mix` 从 Ethan Schoonover 规范色板派生，不自创颜色。
- 偏好持久化在浏览器 `localStorage`（第三方主题 id 不进官方 settings schema，由本插件在每次加载时回放）。
- 自带 Plugins 页元数据（`locale/*.json` 标题/描述 + `icon.svg`）。

## 兼容性

当前按 **dsh 0.2.2-rc.5**（Web profile）核对：`ctx.theme.register(ThemeDefinition)`、`theme/change`、
`settings.general.item` 插槽、`ctx.locale.register` 与 `window.__ModuleLoader__.load` 客户端工厂形态均未变化。
纯客户端实现，没有 `@deepseek-ai/dsh-*` 依赖，因此不受插件版本门控影响。升级 dsh 后先跑一遍契约探针（见下）。

## 平台支持

**Windows / Linux / macOS 通用**：本插件是纯客户端实现（浏览器里的 React + CSS 变量 +
localStorage），host 半为空，没有任何 OS 依赖。唯一的环境要求是浏览器支持 `color-mix()`
（Chromium 111+）——官方 DSH 样式表本身已依赖它，DSH Web GUI 能跑就能用。

### 契约探针（升级雷达）

升级 dsh 前对安装树跑一遍，断掉的契约按名字报出（本仓库无 node_modules，需传树）：

```bash
node scripts/check-dsh-contract.mjs <dsh安装>/node_modules/@deepseek-ai
```

覆盖：`settings.general.item` 插槽、主题注册面、`--dsw-alias-` 设计令牌词汇；并逐项核对本插件的覆盖名是否
仍存在于安装树（死覆盖 → FAIL），列出安装树新增而尚未覆盖的令牌（INFO）。

## 结构

```
lib/index.js     host 半（刻意为空：纯客户端插件，此文件仅为满足 cordis 加载器）
client/index.js  client 半：注册主题 + 设置行 + localStorage 回放
cordis.patch.yml bundle 插入行
locale/          Plugins 页标题 / 描述（en、zh）
icon.svg         Plugins 页图标
```

## 安装（link 方式装入 web profile）

```powershell
# 推荐：dsh 自带的 plugin 子命令（等价于在 profile 目录里 pnpm add link:<路径>）
dsh plugin --profile web add link:C:\Users\x00968307\Documents\deepseek-harness\plugins\dsh-solarized-themes
# 然后把 'dsh-solarized-themes' 追加到 ~/.dsh/profiles/web/package.json 的 dsh.profile.bundles，重启 dsh web
```

或手动：在 `~/.dsh/profiles/web/package.json` 的 `"dependencies"` 加 `"dsh-solarized-themes": "link:<本目录>"`、
`"dsh.profile.bundles"` 追加 `'dsh-solarized-themes'`，在 profile 目录执行 `pnpm install`，重启 `dsh web`。
GUI 里也可以用 **Plugins → Add plugin** 选择本目录。

卸载：从 bundle 名单与 dependencies 移除后重启即可；localStorage 里的偏好键为
`dsh.solarizedThemes.preference` / `dsh.solarizedThemes.builtInFallback`。

## 已知边界

- 首帧闪烁：页面加载时内置主题先行绘制，本插件 materialize 后才切换（< 1s）。
- 「跟随系统」在 Solarized 行内不提供（内置外观行已有该能力）。
