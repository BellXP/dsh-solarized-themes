#!/usr/bin/env node
/**
 * dsh-solarized-themes — dsh 契约探针（升级雷达）。
 *
 * 本插件 client-only，契约面 = 设置页插槽 + 主题注册面 + design token 词表。
 * 探针分两层：
 *   1. 契约断开（FAIL，退出码 1）：插槽名 / 主题注册面消失，或本插件覆盖的
 *      某个 token 在安装树里已不存在（死覆盖）。
 *   2. 词表新增（INFO，不影响退出码）：安装树定义了而本插件尚未覆盖的
 *      alias/specific 令牌——升级 dsh 后据此补色即可。
 *
 * 用法：
 *   node scripts/check-dsh-contract.mjs <dsh安装>/node_modules/@deepseek-ai
 *   （本仓库无 node_modules——必须显式传树。）
 * 退出码：0 = 无断开；1 = 有 FAIL；2 = 没找到 dsh 树。
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..')
const tree = [process.argv[2], path.join(repo, 'node_modules', '@deepseek-ai')].find((p) => p && existsSync(p))
if (tree === undefined) {
  console.error(`未找到 dsh 树——请传入路径：node scripts/check-dsh-contract.mjs <dsh安装>/node_modules/@deepseek-ai`)
  process.exit(2)
}

/** 刻意不覆盖的令牌（理由见 client/index.js 头注释）。 */
const INTENTIONALLY_SKIPPED = [
  /^--dsw-alias-bg-mask-(1|2|3|photo)$/,
  /^--dsw-specific-sidebar-(glass|wash|tint|right-flash)/,
]

const pkgDir = (name) => path.join(tree, name)
const readFirst = (name, ...files) => {
  for (const file of files) {
    try { return readFileSync(path.join(pkgDir(name), file), 'utf8') } catch { /* 下一个 */ }
  }
  return undefined
}

const results = []
const check = (id, ok, detail = '') => results.push({ id, ok: ok === true, detail })
const skip = (id, detail) => results.push({ id, ok: true, skip: true, detail })
const info = (id, detail) => results.push({ id, ok: true, info: true, detail })

console.log(`dsh-solarized-themes 契约探针 — 树: ${tree}\n`)

// ---- 1. 设置页插槽（由 ui-settings-general 的 General 入口声明）----
const general = readFirst('dsh-client-ui-settings-general', 'lib/client.js', 'src/client/index.ts')
if (general === undefined) skip('client/slot: settings.general.item', 'dsh-client-ui-settings-general 不在本树')
else check('client/slot: settings.general.item（主题偏好行）', general.includes('settings.general.item'))

// ---- 2. 主题注册面 ----
const themeSrc = readFirst('dsh-client-ui-theme', 'lib/types/client/index.d.ts', 'lib/client.js')
if (themeSrc === undefined) {
  skip('client/theme: register(ThemeDefinition) 注册面', 'dsh-client-ui-theme 不在本树')
} else {
  check('client/theme: register(ThemeDefinition) 注册面', /register\(definition: ThemeDefinition\)/.test(themeSrc) || themeSrc.includes('register('))
  check('client/theme: ThemeDefinition 仍含 id/colorScheme/tokens', themeSrc.includes('colorScheme') && themeSrc.includes('tokens'))
  check('client/theme: theme/change 事件', themeSrc.includes("'theme/change'"))
}

// ---- 3. design token 词表（源 CSS 优先，打包产物兜底）----
const css = readFirst('dsh-client-ui-theme', 'src/styles/design-platform.css', 'lib/client.js')
if (css === undefined) {
  skip('client/theme: --dsw-alias- 词表', 'dsh-client-ui-theme 的 design-platform.css / client.js 不可读')
} else {
  check('client/theme: 主题注册/别名词汇（--dsw-alias- token 体系）', css.includes('--dsw-alias-'))
  const defined = new Set([...css.matchAll(/(--dsw-(?:alias|specific)-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
  const client = readFileSync(path.join(repo, 'client', 'index.js'), 'utf8')
  const overridden = [...new Set([...client.matchAll(/'(--dsw-(?:alias|specific)-[a-z0-9-]+)'\s*:/g)].map((m) => m[1]))]
  const dead = overridden.filter((name) => !defined.has(name))
  const missing = [...defined].filter((name) => !overridden.includes(name) && !INTENTIONALLY_SKIPPED.some((re) => re.test(name))).sort()
  check(`client/theme: 本插件 ${overridden.length} 项覆盖全部仍存在于安装树（死覆盖 ${dead.length} 项）`, dead.length === 0, dead.join(', '))
  info(`client/theme: 安装树定义 ${defined.size} 项，本插件覆盖 ${overridden.length} 项，尚未覆盖 ${missing.length} 项`, missing.join(', '))
}

// ---- 汇总 ----
let failed = 0
for (const { id, ok, skip: isSkip, info: isInfo, detail } of results) {
  if (!ok) failed += 1
  const tag = isSkip ? '[skip]' : isInfo ? '[info]' : ok ? '[ ok ]' : '[FAIL]'
  const line = `${tag} ${id}${detail ? ` — ${detail}` : ''}`
  console.log(isInfo ? line : line)
}
const checked = results.filter((r) => !r.skip).length
console.log(`\n${checked - failed}/${checked} 契约通过${failed === 0 ? '' : `，${failed} 条断开`}`)
process.exit(failed === 0 ? 0 : 1)
