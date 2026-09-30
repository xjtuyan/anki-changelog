// 从产品数据生成 Anki 牌组更新源：
//   public/decks.json  —— 标准 JSON
//   public/decks.js    —— JSONP（window.DECKS_FEED），供 Anki 卡片 JS 免 CORS 加载
// npm run docs:build / docs:dev 前自动执行（prebuild / predev）
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(
  readFileSync(join(root, '.vitepress/theme/data/products.json'), 'utf-8'),
)

const feed = {
  feedVersion: 1,
  site: '长缨记忆卡',
  generatedAt: new Date().toISOString().slice(0, 10),
  decks: data.products
    .filter(p => p.deckName && p.version)
    .map(p => ({
      id: p.id,
      name: p.deckName,
      match: p.match || [p.deckName],
      version: p.version,
      date: p.updated,
      summary: p.timeline && p.timeline.length ? p.timeline[0].title : '',
      url: '/products/' + p.id + '.html',
    })),
}

writeFileSync(join(root, 'public/decks.json'), JSON.stringify(feed, null, 2) + '\n', 'utf-8')
// JSONP：规避 Anki 卡片 WebView 跨域限制（<script src> 不受 CORS 约束）
writeFileSync(join(root, 'public/decks.js'), 'window.DECKS_FEED = ' + JSON.stringify(feed, null, 2) + ';\n', 'utf-8')
console.log(`decks.json / decks.js 生成完毕：${feed.decks.length} 个牌组`)
