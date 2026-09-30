/**
 * dsh-solarized-themes — client half.
 *
 * 官方 client 插件形态（window.__ModuleLoader__.load({id, factory(require)})，
 * factory 自包含，require 只解析 shell 种子模块：react 等；**不使用 JSX**）。
 *
 * - 通过 ctx.theme.register 注册两个第三方主题：
 *     solarized-light  （colorScheme: light）
 *     solarized-dark   （colorScheme: dark）
 *   令牌覆盖 = 官方 design-platform.css 的全部 --dsw-alias-* / --dsw-specific-*
 *   语义槽 + --shiki-token-* 语法高亮（Solarized 经典强调色）。
 * - 在 设置 → 通用 里注册一行（settings.general.item，order 12，紧跟官方
 *   外观/字号行）：关闭 / Solarized 浅色 / Solarized 深色 三个 cube。
 * - 偏好持久化在 localStorage（第三方主题 id 不进官方 settings schema，
 *   setTheme 只在进程内生效，因此由本插件在加载时回放）。
 * - 样式只用 --dsw-* design token；中间色一律 color-mix 从 Solarized
 *   规范色板派生，不自创颜色。
 */
window.__ModuleLoader__.load({
  id: 'dsh-solarized-themes', // must equal the package name (loader contract)
  factory(require) {
    const React = require('react')
    const h = React.createElement

    // ------------------------------------------------------------ palette

    /** Ethan Schoonover 的 Solarized 规范色板（canonical十六进制）。 */
    const SOLARIZED = {
      base03: '#002b36', // 背景最深（dark 画布）
      base02: '#073642', // 背景次深（dark 高亮层 / light 品牌墨色）
      base01: '#586e75', // 注释/强调文本（light 正文强调）
      base00: '#657b83', // light 正文
      base0: '#839496', // dark 正文
      base1: '#93a1a1', // dark 正文强调 / light 注释
      base2: '#eee8d5', // light 高亮层
      base3: '#fdf6e3', // light 画布
      yellow: '#b58900',
      orange: '#cb4b16',
      red: '#dc322f',
      magenta: '#d33682',
      violet: '#6c71c4',
      blue: '#268bd2',
      cyan: '#2aa198',
      green: '#859900',
    }

    /** color-mix 派生：mix(a, b, n) = a 占 n% 与 b 混合（官方样式表同款表达）。 */
    const mix = (a, b, n) => `color-mix(in srgb, ${a} ${String(n)}%, ${b})`

    /** shiki 语法高亮令牌（Solarized 经典映射，两主题共用同一强调色组）。 */
    function shikiTokens(foreground, background, comment, punctuation) {
      return {
        '--shiki-foreground': foreground,
        '--shiki-background': background,
        '--shiki-token-constant': SOLARIZED.violet,
        '--shiki-token-string': SOLARIZED.cyan,
        '--shiki-token-comment': comment,
        '--shiki-token-keyword': SOLARIZED.green,
        '--shiki-token-parameter': SOLARIZED.orange,
        '--shiki-token-function': SOLARIZED.blue,
        '--shiki-token-string-expression': SOLARIZED.cyan,
        '--shiki-token-punctuation': punctuation,
        '--shiki-token-link': SOLARIZED.blue,
      }
    }

    const S = SOLARIZED

    /** Solarized Light：完整 alias/specific 令牌覆盖（作用于 body 内联变量）。 */
    const LIGHT_TOKENS = {
      // ---- 背景层
      '--dsw-alias-bg-base': S.base3,
      '--dsw-alias-bg-layer-1': S.base3,
      '--dsw-alias-bg-layer-2': S.base2,
      '--dsw-alias-bg-layer-3': mix(S.base2, S.base1, 12),
      '--dsw-alias-bg-overlay': S.base2,
      '--dsw-alias-bg-module-platform': S.base2,
      '--dsw-alias-bg-multi-select': S.base2,
      '--dsw-alias-bg-skeleton': S.base1 + '14',
      '--dsw-alias-bg-document-preview': S.base2,
      '--dsw-alias-label-document-preview': S.base00,
      // ---- 边框（base01 递增透明度）
      '--dsw-alias-border-l1': S.base01 + '0d',
      '--dsw-alias-border-l2': S.base01 + '14',
      '--dsw-alias-border-l2-darkmode-thin': S.base01 + '14',
      '--dsw-alias-border-l3': S.base01 + '1f',
      '--dsw-alias-border-l4': S.base01 + '2b',
      '--dsw-alias-border-inverted': S.base1 + '0f',
      '--dsw-alias-border-inverted2': S.base1 + '17',
      // ---- 品牌/按钮
      '--dsw-alias-brand-primary': S.base02,
      '--dsw-alias-brand-text': S.base02,
      '--dsw-alias-brand-primary-invert': S.base3,
      '--dsw-alias-brand-primary-new-colorprimary-new-color': S.blue,
      '--dsw-alias-button-contrast-fill': S.base01,
      '--dsw-alias-button-elevated-fill': S.base3,
      '--dsw-alias-button-floating-fill': S.base3,
      '--dsw-alias-button-floating-hover': S.base2,
      '--dsw-alias-button-ghost-active-border': S.base1,
      '--dsw-alias-button-ghost-active-fill': S.base2,
      '--dsw-alias-button-ghost-active-hover': mix(S.base2, S.base1, 12),
      '--dsw-alias-button-info-fill': S.blue,
      '--dsw-alias-button-info-hover': mix(S.blue, S.base3, 82),
      '--dsw-alias-button-primary-dimmed': S.base2,
      '--dsw-alias-button-primary-fill': 'var(--dsw-alias-brand-primary)',
      '--dsw-alias-button-primary-hover': mix(S.base02, S.blue, 80),
      '--dsw-alias-button-tool-bar-fill': S.base01 + '80',
      '--dsw-alias-button-tool-bar-hover': S.base01 + '99',
      '--dsw-alias-button-tool-bar-fill-invisible': S.base01 + '5c',
      // ---- 交互态
      '--dsw-alias-interactive-bg-active': S.blue + '1a',
      '--dsw-alias-interactive-bg-hover': S.blue + '0f',
      '--dsw-alias-interactive-bg-hover-accent': S.blue + '24',
      '--dsw-alias-interactive-bg-hover-danger': S.red + '0d',
      '--dsw-alias-interactive-bg-hover-solid': S.base2,
      // ---- 文本
      '--dsw-alias-label-primary': S.base01,
      '--dsw-alias-label-secondary': S.base00,
      '--dsw-alias-label-tertiary': S.base0,
      '--dsw-alias-label-caption': S.base1,
      '--dsw-alias-label-dimmed': mix(S.base2, S.base1, 55),
      '--dsw-alias-label-primary-bluish': S.base02,
      '--dsw-alias-label-primary-dimmed': S.base02,
      '--dsw-alias-label-primary-foreground': S.base3,
      '--dsw-alias-label-primary-inverted': S.base3,
      '--dsw-alias-menu-icon': S.base01,
      '--dsw-alias-link': S.blue,
      // ---- Markdown / 代码
      '--dsw-alias-markdown-citation': S.base2,
      '--dsw-alias-markdown-code-block': S.base2,
      '--dsw-alias-markdown-code-block-banner': S.base2,
      '--dsw-alias-markdown-code-segment-selected': S.base3,
      '--dsw-alias-markdown-code-segment-unselected': S.base2,
      '--dsw-alias-markdown-inline-code': mix(S.base2, S.base1, 10),
      '--dsw-alias-markdown-placeholder': S.base2,
      '--dsw-alias-markdown-tag': S.base2,
      // ---- 滚动条
      '--dsw-alias-scrollbar-bg-l1': mix(S.base2, S.base1, 45),
      '--dsw-alias-scrollbar-bg-l2': mix(S.base2, S.base1, 45),
      '--dsw-alias-scrollbar-hover-l1': mix(S.base2, S.base1, 60),
      '--dsw-alias-scrollbar-hover-l2': mix(S.base2, S.base1, 60),
      // ---- 状态语义
      '--dsw-alias-state-business-primary': S.blue,
      '--dsw-alias-state-business-tertiary': mix(S.base3, S.blue, 12),
      '--dsw-alias-code-diff-added': S.green + '14',
      '--dsw-alias-code-diff-deleted': S.red + '0f',
      '--dsw-alias-file-diff-added-bg': mix(S.base3, S.green, 12),
      '--dsw-alias-file-diff-added-gutter': mix(S.base3, S.green, 7),
      '--dsw-alias-file-diff-added-marker': S.green,
      '--dsw-alias-file-diff-deleted-bg': mix(S.base3, S.red, 10),
      '--dsw-alias-file-diff-deleted-gutter': mix(S.base3, S.red, 6),
      '--dsw-alias-file-diff-deleted-marker': S.orange,
      '--dsw-alias-state-error-primary': S.red,
      '--dsw-alias-state-error-secondary': mix(S.red, S.base3, 75),
      '--dsw-alias-state-idle-primary': S.base1,
      '--dsw-alias-state-success-primary': S.green,
      '--dsw-alias-state-success-secondary': mix(S.green, S.base3, 80),
      '--dsw-alias-state-success-tertiary': mix(S.base3, S.green, 14),
      '--dsw-alias-state-warn-label': S.yellow,
      '--dsw-alias-state-warn-primary': S.yellow,
      '--dsw-alias-state-warn-secondary': mix(S.yellow, S.base3, 80),
      '--dsw-alias-state-warn-tertiary': mix(S.base3, S.yellow, 14),
      // ---- 浮层（深墨底 + 米白字，对齐官方 light 的深色 toast）
      '--dsw-alias-toast-bg': S.base02,
      '--dsw-alias-toast-label': S.base2,
      '--dsw-alias-tooltip-bg': S.base02,
      '--dsw-alias-tooltip-key-bg': mix(S.base02, S.base2, 18),
      // ---- specific 表面
      '--dsw-menu-surface-fill': S.base2 + 'b0',
      '--dsw-specific-menu': 'var(--dsw-menu-surface-fill)',
      '--dsw-specific-selector': S.base2,
      '--dsw-specific-sidebar-fill': S.base2,
      '--dsw-specific-sidebar-nav-item-active': mix(S.base2, S.base1, 14),
      '--dsw-specific-sidebar-nav-item-hover': mix(S.base2, S.base1, 7),
      '--dsw-specific-sidebar-nav-item-active-accent': S.blue + '1c',
      '--dsw-specific-tip': S.base2,
      '--dsw-specific-input-major': S.base3,
      '--dsw-specific-login-input': S.base2,
      '--dsw-specific-bubble': mix(S.base2, S.cyan, 8),
      '--dsw-specific-bubble-highlight': mix(S.base2, S.cyan, 16),
      // ---- 语法高亮
      ...shikiTokens(S.base01, S.base2, S.base1, S.base00),
    }

    /** Solarized Dark：完整 alias/specific 令牌覆盖。 */
    const DARK_TOKENS = {
      // ---- 背景层（base03 画布，base02 及其派生为抬升层）
      '--dsw-alias-bg-base': S.base03,
      '--dsw-alias-bg-layer-1': S.base02,
      '--dsw-alias-bg-layer-2': mix(S.base02, S.base2, 15),
      '--dsw-alias-bg-layer-3': mix(S.base02, S.base2, 30),
      '--dsw-alias-bg-overlay': mix(S.base02, S.base2, 15),
      '--dsw-alias-bg-module-platform': S.base02,
      '--dsw-alias-bg-multi-select': mix(S.base02, S.base03, 60),
      '--dsw-alias-bg-skeleton': S.base1 + '1a',
      '--dsw-alias-bg-document-preview': S.base03,
      '--dsw-alias-label-document-preview': S.base0,
      // ---- 边框（暖白递增透明度，对齐官方 dark 白系边框）
      '--dsw-alias-border-l1': S.base2 + '0f',
      '--dsw-alias-border-l2': S.base2 + '1f',
      '--dsw-alias-border-l2-darkmode-thin': S.base2 + '0f',
      '--dsw-alias-border-l3': S.base2 + '29',
      '--dsw-alias-border-l4': S.base2 + '33',
      '--dsw-alias-border-inverted': S.base2 + '0f',
      '--dsw-alias-border-inverted2': S.base2 + '14',
      // ---- 品牌/按钮（暖白为主色，对齐官方 dark 近白品牌）
      '--dsw-alias-brand-primary': S.base2,
      '--dsw-alias-brand-text': S.base2,
      '--dsw-alias-brand-primary-invert': S.base03,
      '--dsw-alias-brand-primary-new-colorprimary-new-color': S.blue,
      '--dsw-alias-button-contrast-fill': S.base1,
      '--dsw-alias-button-elevated-fill': S.base02,
      '--dsw-alias-button-floating-fill': mix(S.base02, S.base2, 15),
      '--dsw-alias-button-floating-hover': mix(S.base02, S.base2, 30),
      '--dsw-alias-button-ghost-active-border': S.base00,
      '--dsw-alias-button-ghost-active-fill': mix(S.base02, S.base2, 15),
      '--dsw-alias-button-ghost-active-hover': mix(S.base02, S.base2, 30),
      '--dsw-alias-button-info-fill': S.blue,
      '--dsw-alias-button-info-hover': mix(S.blue, S.base2, 85),
      '--dsw-alias-button-primary-dimmed': S.base02,
      '--dsw-alias-button-primary-fill': 'var(--dsw-alias-brand-primary)',
      '--dsw-alias-button-primary-hover': mix(S.base2, S.base1, 85),
      '--dsw-alias-button-tool-bar-fill': S.base1 + '80',
      '--dsw-alias-button-tool-bar-hover': S.base1 + '99',
      '--dsw-alias-button-tool-bar-fill-invisible': S.base1 + '5c',
      // ---- 交互态
      '--dsw-alias-interactive-bg-active': S.base2 + '24',
      '--dsw-alias-interactive-bg-hover': S.base2 + '14',
      '--dsw-alias-interactive-bg-hover-accent': S.base2 + '3d',
      '--dsw-alias-interactive-bg-hover-danger': S.red + '26',
      '--dsw-alias-interactive-bg-hover-solid': mix(S.base02, S.base2, 30),
      // ---- 文本
      '--dsw-alias-label-primary': S.base1,
      '--dsw-alias-label-secondary': S.base0,
      '--dsw-alias-label-tertiary': S.base00,
      '--dsw-alias-label-caption': S.base01,
      '--dsw-alias-label-dimmed': mix(S.base02, S.base1, 30),
      '--dsw-alias-label-primary-bluish': S.base2,
      '--dsw-alias-label-primary-dimmed': S.base0,
      '--dsw-alias-label-primary-foreground': S.base03,
      '--dsw-alias-label-primary-inverted': S.base02,
      '--dsw-alias-menu-icon': S.base0,
      '--dsw-alias-link': S.blue,
      // ---- Markdown / 代码
      '--dsw-alias-markdown-citation': mix(S.base02, S.base2, 30),
      '--dsw-alias-markdown-code-block': S.base02,
      '--dsw-alias-markdown-code-block-banner': mix(S.base02, S.base2, 15),
      '--dsw-alias-markdown-code-segment-selected': S.base02,
      '--dsw-alias-markdown-code-segment-unselected': S.base03,
      '--dsw-alias-markdown-inline-code': mix(S.base02, S.base2, 15),
      '--dsw-alias-markdown-placeholder': S.base02,
      '--dsw-alias-markdown-tag': S.base02,
      // ---- 滚动条
      '--dsw-alias-scrollbar-bg-l1': S.base01,
      '--dsw-alias-scrollbar-bg-l2': S.base00,
      '--dsw-alias-scrollbar-hover-l1': S.base00,
      '--dsw-alias-scrollbar-hover-l2': S.base1,
      // ---- 状态语义
      '--dsw-alias-state-business-primary': S.blue,
      '--dsw-alias-state-business-tertiary': mix(S.base02, S.blue, 25),
      '--dsw-alias-code-diff-added': S.green + '1f',
      '--dsw-alias-code-diff-deleted': S.red + '1f',
      '--dsw-alias-file-diff-added-bg': mix(S.base03, S.green, 15),
      '--dsw-alias-file-diff-added-gutter': mix(S.base03, S.green, 8),
      '--dsw-alias-file-diff-added-marker': mix(S.green, S.base2, 70),
      '--dsw-alias-file-diff-deleted-bg': mix(S.base03, S.red, 15),
      '--dsw-alias-file-diff-deleted-gutter': mix(S.base03, S.red, 8),
      '--dsw-alias-file-diff-deleted-marker': mix(S.red, S.base2, 70),
      '--dsw-alias-state-error-primary': S.red,
      '--dsw-alias-state-error-secondary': mix(S.red, S.base2, 70),
      '--dsw-alias-state-idle-primary': S.base00,
      '--dsw-alias-state-success-primary': S.green,
      '--dsw-alias-state-success-secondary': mix(S.green, S.base2, 70),
      '--dsw-alias-state-success-tertiary': mix(S.base03, S.green, 20),
      '--dsw-alias-state-warn-label': S.yellow,
      '--dsw-alias-state-warn-primary': S.yellow,
      '--dsw-alias-state-warn-secondary': mix(S.yellow, S.base2, 70),
      '--dsw-alias-state-warn-tertiary': mix(S.base03, S.yellow, 20),
      // ---- 浮层
      '--dsw-alias-toast-bg': mix(S.base02, S.base03, 60),
      '--dsw-alias-toast-label': S.base2,
      '--dsw-alias-tooltip-bg': mix(S.base02, S.base03, 60),
      '--dsw-alias-tooltip-key-bg': mix(mix(S.base02, S.base03, 60), S.base2, 18),
      // ---- specific 表面
      '--dsw-menu-surface-fill': mix(S.base02, 'transparent', 65),
      '--dsw-specific-menu': 'var(--dsw-menu-surface-fill)',
      '--dsw-specific-selector': mix(S.base02, S.base2, 30),
      '--dsw-specific-sidebar-fill': S.base02,
      '--dsw-specific-sidebar-nav-item-active': mix(S.base02, S.base2, 15),
      '--dsw-specific-sidebar-nav-item-hover': mix(S.base02, S.base2, 8),
      '--dsw-specific-sidebar-nav-item-active-accent': S.blue + '2e',
      '--dsw-specific-tip': mix(S.base02, S.base2, 15),
      '--dsw-specific-input-major': mix(S.base02, S.base2, 15),
      '--dsw-specific-login-input': S.base02,
      '--dsw-specific-bubble': mix(S.base02, S.cyan, 8),
      '--dsw-specific-bubble-highlight': mix(S.base02, S.cyan, 18),
      // ---- 语法高亮
      ...shikiTokens(S.base1, S.base02, S.base01, S.base0),
    }

    /** 注册到 ctx.theme 的两个主题定义。 */
    const THEMES = [
      { id: 'solarized-light', colorScheme: 'light', tokens: LIGHT_TOKENS },
      { id: 'solarized-dark', colorScheme: 'dark', tokens: DARK_TOKENS },
    ]
    const SOLARIZED_IDS = new Set(THEMES.map((theme) => theme.id))

    // ----------------------------------------------------------- storage

    const PREF_KEY = 'dsh.solarizedThemes.preference'
    const BUILTIN_KEY = 'dsh.solarizedThemes.builtInFallback'

    function readStore(key, fallback) {
      try {
        const value = window.localStorage.getItem(key)
        return value === null ? fallback : value
      } catch {
        return fallback
      }
    }
    function writeStore(key, value) {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        /* 隐私模式等存储不可用：仅本次会话内生效 */
      }
    }

    // ---------------------------------------------------------------- css

    const CSS = `
.dst-row { border-bottom: .5px solid var(--dsw-alias-border-l2); padding: 16px 0; display: flex; flex-direction: column; gap: 8px; }
.dst-title { color: var(--dsw-alias-label-primary); font-size: 14px; font-weight: 400; line-height: 22px; }
.dst-desc { color: var(--dsw-alias-label-tertiary); font-size: 12px; font-weight: 400; line-height: 18px; }
.dst-cubes { flex-wrap: wrap; align-items: stretch; gap: 8px; display: flex; }
.dst-cube { box-sizing: border-box; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-xl); font: inherit; color: var(--dsw-alias-label-primary); cursor: pointer; background: 0 0; flex: 180px; justify-content: center; align-items: center; gap: 8px; padding: 20px 24px; font-size: 14px; line-height: 22px; display: flex; }
.dst-cube:hover:not(.dst-selected) { background: var(--dsw-alias-interactive-bg-hover); }
.dst-selected { background: var(--dsw-alias-bg-module-platform); border-color: var(--dsw-alias-state-business-primary); }
.dst-swatch { border-radius: 8px; border: 1px solid var(--dsw-alias-border-l4); width: 72px; height: 40px; display: flex; align-items: center; gap: 4px; padding: 6px; box-sizing: border-box; }
.dst-swatch-bar { border-radius: 2px; flex: 1; height: 5px; }
`

    // --------------------------------------------------------------- row

    /** 三个 cube 的预览色（关闭 = 当前内置主题的中性预览）。 */
    function CubeSwatch({ kind }) {
      if (kind === 'off') {
        return h('span', { className: 'dst-swatch', style: { background: 'var(--dsw-alias-bg-layer-1)' } },
          h('span', { className: 'dst-swatch-bar', style: { background: 'var(--dsw-alias-label-secondary)' } }),
          h('span', { className: 'dst-swatch-bar', style: { background: 'var(--dsw-alias-label-tertiary)' } }),
          h('span', { className: 'dst-swatch-bar', style: { background: 'var(--dsw-alias-state-business-primary)' } }))
      }
      const bg = kind === 'solarized-light' ? SOLARIZED.base3 : SOLARIZED.base03
      return h('span', { className: 'dst-swatch', style: { background: bg } },
        h('span', { className: 'dst-swatch-bar', style: { background: kind === 'solarized-light' ? SOLARIZED.base01 : SOLARIZED.base1 } }),
        h('span', { className: 'dst-swatch-bar', style: { background: SOLARIZED.blue } }),
        h('span', { className: 'dst-swatch-bar', style: { background: SOLARIZED.cyan } }))
    }

    /** 设置 → 通用 的 Solarized 行。 */
    function SolarizedRow({ t, usePref, select }) {
      const state = usePref()
      const cubes = [
        { id: 'off', label: t('off') },
        { id: 'solarized-light', label: t('light') },
        { id: 'solarized-dark', label: t('dark') },
      ]
      return h('div', { className: 'dst-row' },
        h('div', { className: 'dst-title' }, t('title')),
        h('div', { className: 'dst-desc' }, t('desc')),
        h('div', { className: 'dst-cubes' },
          cubes.map(({ id, label }) => h('button', {
            key: id,
            type: 'button',
            className: id === state ? 'dst-cube dst-selected' : 'dst-cube',
            'aria-pressed': id === state ? 'true' : 'false',
            onClick: () => { select(id) },
          },
          h(CubeSwatch, { kind: id }),
          h('span', null, label)))))
    }

    // -------------------------------------------------------------- apply

    function apply(ctx) {
      try {
        applyInner(ctx)
      } catch (error) {
        console.error('[dsh-solarized-themes] client apply failed:', error)
      }
    }

    function applyInner(ctx) {
      const styleEl = document.createElement('style')
      styleEl.dataset.pluginCss = 'dsh-solarized-themes/client'
      styleEl.textContent = CSS
      document.head.appendChild(styleEl)
      ctx.effect(() => () => { styleEl.remove() }, 'dsh-solarized-themes: css')

      // 注册两个 Solarized 主题（第三方主题面：alias 令牌覆盖）。
      for (const definition of THEMES) {
        ctx.effect(() => ctx.theme.register(definition), `dsh-solarized-themes: register ${definition.id}`)
      }

      // 偏好状态：'solarized-light' | 'solarized-dark' | 'off'
      let pref = readStore(PREF_KEY, 'off')
      if (!SOLARIZED_IDS.has(pref)) pref = 'off'
      let builtInFallback = readStore(BUILTIN_KEY, 'system')
      if (builtInFallback !== 'light' && builtInFallback !== 'dark' && builtInFallback !== 'system') builtInFallback = 'system'
      const listeners = new Set()
      const notify = () => { for (const listener of listeners) listener() }
      const usePref = () => React.useSyncExternalStore(
        (listener) => { listeners.add(listener); return () => { listeners.delete(listener) } },
        () => pref,
      )

      // 跟踪内置偏好：用户在官方外观行切换 light/dark/system 时记住它，
      // 作为「关闭」时回退的目标。
      ctx.on('theme/change', (snapshot) => {
        if (SOLARIZED_IDS.has(snapshot.preference)) {
          if (pref !== snapshot.preference) { pref = snapshot.preference; notify() }
          return
        }
        builtInFallback = snapshot.preference
        writeStore(BUILTIN_KEY, builtInFallback)
        if (pref !== 'off') { pref = 'off'; notify() }
      })

      const select = (choice) => {
        if (choice === 'off') {
          writeStore(PREF_KEY, 'off')
          ctx.theme.setTheme(builtInFallback)
          return
        }
        if (!SOLARIZED_IDS.has(choice)) return
        writeStore(PREF_KEY, choice)
        ctx.theme.setTheme(choice)
      }

      // 加载时回放持久化的偏好。
      if (pref !== 'off') {
        try {
          ctx.theme.setTheme(pref)
        } catch (error) {
          console.error('[dsh-solarized-themes] replay preference failed:', error)
        }
      }

      ctx.effect(() => ctx.locale.register('settings.solarized', {
        zh: {
          title: 'Solarized 配色',
          desc: 'Ethan Schoonover 的 Solarized 色彩方案（浅色 / 深色）；选择后立即生效，代码块语法高亮同套色板。',
          light: 'Solarized 浅色',
          dark: 'Solarized 深色',
          off: '关闭',
        },
        en: {
          title: 'Solarized theme',
          desc: 'The Solarized color schemes by Ethan Schoonover (light / dark); code syntax highlighting follows the same palette.',
          light: 'Solarized Light',
          dark: 'Solarized Dark',
          off: 'Off',
        },
      }), 'dsh-solarized-themes: dictionaries')

      const injected = () => ({ usePref, select })
      ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'solarized',
        order: 12,
        locale: 'settings.solarized',
        inject: injected,
      }, SolarizedRow))
    }

    return { apply, inject: ['theme', 'slots', 'locale'] }
  },
})
