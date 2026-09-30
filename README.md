# dsh-solarized-themes

DeepSeek Harness (DSH) Web GUI 的 **Solarized 系列主题**：Solarized Light 与 Solarized Dark。

## 功能

- 在 **设置 → 通用** 里「外观」行下方新增一行「Solarized 配色」，三个选项：
  - **Solarized 浅色**（base3 米黄画布 + base01 墨绿正文）
  - **Solarized 深色**（base03 深青画布 + base1 青灰正文）
  - **关闭**（回到内置的浅色/深色/跟随系统偏好）
- 覆盖官方 design token 体系的全部语义槽（`--dsw-alias-*` 约 80 项 + `--dsw-specific-*` 表面 + `--shiki-token-*` 代码语法高亮），中间色一律用 `color-mix` 从 Ethan Schoonover 规范色板派生，不自创颜色。
- 偏好持久化在浏览器 `localStorage`（第三方主题 id 不进官方 settings schema，由本插件在每次加载时回放）。

## 结构

```
lib/index.js     host 半（刻意为空：纯客户端插件，此文件仅为满足 cordis 加载器）
client/index.js  client 半：注册主题 + 设置行 + localStorage 回放
cordis.patch.yml bundle 插入行
```

## 安装（link 方式装入 web profile）

```powershell
# 1) profile 依赖 + bundle 名单（~/.dsh/profiles/web/package.json）
#    "dependencies" 增加本项目 link: 路径；"dsh.profile.bundles" 追加 'dsh-solarized-themes'
# 2) 在 profile 目录 pnpm install
# 3) 重启 dsh web
```

卸载：从 bundle 名单与 dependencies 移除后重启即可；localStorage 里的偏好键为
`dsh.solarizedThemes.preference` / `dsh.solarizedThemes.builtInFallback`。

## 已知边界

- 首帧闪烁：页面加载时内置主题先行绘制，本插件 materialize 后才切换（< 1s）。
- 「跟随系统」在 Solarized 行内不提供（内置外观行已有该能力）。
