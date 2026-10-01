#!/usr/bin/env node
/**
 * dsh-solarized-themes — dsh 契约探针（升级雷达）。
 *
 * 本插件 client-only：契约面 = 设置页插槽 + 主题注册面 + design token 词汇。
 *
 * 用法：
 *   node scripts/check-dsh-contract.mjs <dsh树/@deepseek-ai目录>
 *   （本仓库无 node_modules——必须显式传树，例如：
 *     node scripts/check-dsh-contract.mjs ../dsh-session-manager/node_modules/@deepseek-ai）
 * 退出码：0 = 无断开；1 = 有 FAIL。
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..')
const candidates = [
  process.argv[2],
  path.join(repo, 'node_modules', '@deepseek-ai'),
].filter((value) => value !== undefined)
const tree = candidates.find((value) => existsSync(value))

const results = []
const check = (id, ok, detail = '') => results.push({ id, ok: ok === true, detail })
const skip = (id, detail) => results.push({ id, ok: true, skip: true, detail })

if (tree === undefined) {
  console.error(`未找到 dsh 树——请传入路径：${candidates.join(' 或 ')}`)
  process.exit(1)
}
const pkgDir = (name) => path.join(tree, name)
const distText = (name, ...files) => {
  for (const file of files) {
    try { return readFileSync(path.join(pkgDir(name), file), 'utf8') } catch { /* 下一个 */ }
  }
  return undefined
}
const probe = (name, id, assert) => {
  if (!existsSync(pkgDir(name))) { skip(id, `${name} 不在本树`); return }
  const text = distText(name, 'lib/client.js', 'lib/index.js')
  if (text === undefined) { check(id, false, `${name}: dist 不可读`); return }
  check(id, assert(text))
}

console.log(`dsh-solarized-themes 契约探针 — 树: ${tree}\n`)

probe('dsh-cordis-client-runner', 'client/slot: settings.general.item（主题偏好行）',
  (t) => t.includes('settings.general.item'))
probe('dsh-client-ui-theme', 'client/theme: 主题注册/别名词汇（--dsw-alias- token 体系）',
  (t) => t.includes('--dsw-alias-'))
probe('dsh-client-ui-theme', 'client/theme: register 注册面',
  (t) => t.includes('register'))
probe('dsh-client-ui-primitives', 'client/ui-primitives: 设计令牌词汇（--dsw-alias-）',
  (t) => t.includes('--dsw-alias-'))

let failed = 0
let skipped = 0
for (const { id, ok, skip: isSkip, detail } of results) {
  if (isSkip === true) skipped += 1
  if (!ok) failed += 1
  const tag = isSkip === true ? '[skip]' : ok ? '[ ok ]' : '[FAIL]'
  console.log(`${tag} ${id}${detail === '' || detail === undefined ? '' : ` — ${detail}`}`)
}
console.log(`\n${results.length - failed}/${results.length} 契约通过（${skipped} 条 SKIP）${failed === 0 ? '' : `，${failed} 条断开`}`)
process.exit(failed === 0 ? 0 : 1)
