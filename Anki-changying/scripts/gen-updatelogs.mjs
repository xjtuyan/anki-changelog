// 由各商品 timeline 汇总生成「更新与勘误日志」页的唯一数据源 updatelogs.json。
// 单一来源：商品的 timeline 改动一次，详情页与全站日志页同时更新，永不脱节。
// 由管理后台保存商品、或 npm run docs:build/dev 前自动执行。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(
  readFileSync(join(root, '.vitepress/theme/data/products.json'), 'utf-8'),
)

// 归档页分类标签（与 products.json 的 key 对齐，label 用更贴合归档的措辞）
const CATS = [
  { key: 'all', label: '全部' },
  { key: 'yingyu', label: '考研英语' },
  { key: 'riyu', label: '日语' },
  { key: 'fakao', label: '法考' },
]

const logs = []
for (const p of data.products) {
  for (const e of p.timeline || []) {
    if (!e || !e.date) continue
    logs.push({
      date: e.date,
      category: p.category,
      kind: e.type || 'update',
      title: e.title || p.name,
      content: Array.isArray(e.items) ? e.items.join('\n') : (e.content || ''),
    })
  }
}

// 倒序
logs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

const feed = {
  _note:
    '产品更新与勘误日志「唯一数据源」，由 scripts/gen-updatelogs.mjs 从各商品 timeline 自动汇总生成，请勿手改。category 取值必须是 CATS 里的 key；kind 取值 update | errata | mixed。content 用 \\n 换行。',
  _updated: new Date().toISOString().slice(0, 10),
  categories: CATS,
  logs,
}

writeFileSync(
  join(root, '.vitepress/theme/data/updatelogs.json'),
  JSON.stringify(feed, null, 2) + '\n',
  'utf-8',
)
console.log(`已生成 updatelogs.json：${logs.length} 条记录`)
