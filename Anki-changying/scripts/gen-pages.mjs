// 由各商品数据生成产品详情页 products/<slug>.md
// 详情页只是 <ProductDetail slug="..." /> 的薄壳，数据全部来自 products.json，
// 因此「新增/删除商品」只需改 products.json，本脚本自动生成对应 .md。
// 由管理后台保存商品、或 npm run docs:build/dev 前自动执行。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(
  readFileSync(join(root, '.vitepress/theme/data/products.json'), 'utf-8'),
)
const outDir = join(root, 'products')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const ids = new Set(data.products.map((p) => p.id))

let n = 0
for (const p of data.products) {
  const md = `---
layout: page
title: ${p.name} · ${data.site?.siteName || '长缨记忆卡'}
---

<ProductDetail slug="${p.id}" />
`
  writeFileSync(join(outDir, p.id + '.md'), md, 'utf-8')
  n++
}

// 清理孤儿详情页（商品被删除后对应的 .md 不再需要）
let removed = 0
for (const f of readdirSync(outDir)) {
  if (!f.endsWith('.md')) continue
  const id = f.slice(0, -3)
  if (!ids.has(id)) {
    unlinkSync(join(outDir, f))
    removed++
  }
}
console.log(`已生成 ${n} 个产品详情页${removed ? `，清理 ${removed} 个孤儿页` : ''} -> products/`)
