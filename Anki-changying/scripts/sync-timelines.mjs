// 一次性/可重复：把现有 updatelogs.json 的归档条目回填进各商品的 timeline，
// 使「商品 timeline」成为更新与勘误的唯一来源（之后 updatelogs.json 由 gen-updatelogs.mjs 生成）。
// 匹配规则：归档标题含商品关键词（红宝书 / COCA / 日语卡 / 法考核心考点）则归入该商品；
// 关键词未命中时按 category 归入该分类下的首个商品。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(root, '.vitepress/theme/data/products.json')
const logsPath = join(root, '.vitepress/theme/data/updatelogs.json')
const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
const logs = JSON.parse(readFileSync(logsPath, 'utf-8')).logs

// 关键词 -> 商品 id
const KEYWORDS = [
  { kw: '红宝书', id: 'hongbaoshu-27' },
  { kw: 'COCA', id: 'coca-tank562' },
  { kw: '日语卡', id: 'riyu-3.0' },
  { kw: '法考核心考点', id: 'fakao-core' },
]

const byCat = {}
for (const p of data.products) {
  if (!byCat[p.category]) byCat[p.category] = p.id
}

function findProduct(log) {
  for (const k of KEYWORDS) {
    if (log.title.includes(k.kw)) return k.id
  }
  return byCat[log.category] || null
}

// 重置 timeline
for (const p of data.products) p.timeline = []

for (const log of logs) {
  const pid = findProduct(log)
  if (!pid) {
    console.warn(`[skip] 未匹配到商品：${log.title}`)
    continue
  }
  const p = data.products.find((x) => x.id === pid)
  p.timeline.push({
    date: log.date,
    type: log.kind || 'update',
    title: log.title,
    items: String(log.content || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  })
}

// 每个商品 timeline 按日期倒序
for (const p of data.products) {
  p.timeline.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  // 同步商品最新版本/更新日期为 timeline 最新一条（若有）
  if (p.timeline.length) {
    const last = p.timeline[0]
    if (last.type === 'update' && /([\d.]+)\s*发布/.test(last.title)) {
      const m = last.title.match(/([\d.]+)\s*发布/)
      if (m) p.version = m[1]
    }
    p.updated = last.date
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
console.log('已把归档条目回填进各商品 timeline，请运行 gen-updatelogs.mjs 重新生成 updatelogs.json')
