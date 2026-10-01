// 长缨记忆卡 · 网站管理后台（零依赖 Node 服务）
// 启动：node admin/server.mjs   （默认 http://localhost:4780）
// 数据全部以 JSON 文件为唯一来源，本服务只做「读写 + 重新生成 + 发布」。
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ADMIN_DIR = __dirname
const SITE_ROOT = resolve(ADMIN_DIR, '..', 'Anki-changying')
const DATA_DIR = join(SITE_ROOT, '.vitepress', 'theme', 'data')
const SCRIPTS_DIR = join(SITE_ROOT, 'scripts')
const REPO_ROOT = resolve(ADMIN_DIR, '..') // Cloudflare Pages/
const PUBLIC_DIR = join(ADMIN_DIR, 'public')
const PORT = Number(process.env.PORT) || 4780

const FILES = {
  site: join(DATA_DIR, 'site.json'),
  products: join(DATA_DIR, 'products.json'),
  categories: join(DATA_DIR, 'categories.json'),
  notifications: join(DATA_DIR, 'notifications.json'),
}

const JSON_OPTS = { spaces: 2, trailingNewline: true }

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}
function writeJSON(path, obj) {
  let text = JSON.stringify(obj, null, 2)
  if (!text.endsWith('\n')) text += '\n'
  writeFileSync(path, text, 'utf-8')
}

// 重新生成：详情页 + Anki 更新源 + 更新与勘误日志
function regenerate() {
  const out = []
  for (const s of ['gen-pages.mjs', 'gen-decks.mjs', 'gen-updatelogs.mjs']) {
    const p = join(SCRIPTS_DIR, s)
    if (!existsSync(p)) continue
    out.push(
      execFileSync(process.execPath, [p], {
        cwd: SITE_ROOT,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
        .toString('utf-8')
        .trim(),
    )
  }
  return out.join('\n')
}

// 发布：提交到本地仓库并推送到 origin / backup
// git 可执行文件解析：Electron 启动器环境 PATH 可能没有 git，逐个探测兜底。
let gitBin = null
function gitCmd() {
  if (gitBin) return gitBin
  const candidates = [
    'git',
    'C:/Users/YAN/.workbuddy/binaries/PortableGit/versions/1.2.0/cmd/git.exe',
    'C:/Program Files/Git/cmd/git.exe',
    'C:/Program Files (x86)/Git/cmd/git.exe',
  ]
  for (const c of candidates) {
    try {
      execFileSync(c, ['--version'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      gitBin = c
      return c
    } catch (e) { /* 试下一个 */ }
  }
  throw new Error('找不到 git，请安装 Git 或将其加入 PATH')
}

function publish() {
  const log = []
  const run = (args, cwd = REPO_ROOT) =>
    execFileSync(gitCmd(), args, {
      cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .toString('utf-8')
      .trim()

  run(['add', 'Anki-changying'])
  const status = run(['status', '--porcelain', 'Anki-changying'])
  if (!status) return '没有需要发布的改动。'

  const msg = `chore(site): 通过管理后台更新 ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`
  run(['commit', '-m', msg])
  log.push('已提交：' + msg)

  for (const remote of ['origin', 'backup']) {
    try {
      run(['push', remote, 'main'])
      log.push(`已推送到 ${remote}`)
    } catch (e) {
      log.push(`推送 ${remote} 失败（可能无凭证或远程不存在）：${String(e.message || e).split('\n')[0]}`)
    }
  }
  return log.join('\n')
}

function send(res, code, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname

  // 静态首页
  if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
    const html = readFileSync(join(PUBLIC_DIR, 'index.html'), 'utf-8')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  // API
  if (path.startsWith('/api/')) {
    try {
      if (req.method === 'GET' && path === '/api/site') {
        return send(res, 200, readJSON(FILES.site))
      }
      if (req.method === 'GET' && path === '/api/categories') {
        return send(res, 200, readJSON(FILES.categories))
      }
      if (req.method === 'GET' && path === '/api/products') {
        return send(res, 200, readJSON(FILES.products))
      }
      if (req.method === 'GET' && path === '/api/notifications') {
        return send(res, 200, readJSON(FILES.notifications))
      }

      if (req.method === 'PUT' && path === '/api/site') {
        const body = await readBody(req)
        writeJSON(FILES.site, body)
        return send(res, 200, { ok: true, msg: '站点信息已保存' })
      }
      if (req.method === 'PUT' && path === '/api/products') {
        const body = await readBody(req)
        writeJSON(FILES.products, body)
        const regen = regenerate()
        return send(res, 200, { ok: true, msg: '商品已保存', regen })
      }
      if (req.method === 'PUT' && path === '/api/categories') {
        const body = await readBody(req)
        if (!Array.isArray(body)) {
          return send(res, 400, { ok: false, msg: '分类数据必须是数组' })
        }
        // 基本校验
        const seen = new Set()
        for (const c of body) {
          if (!c.key || !c.label) {
            return send(res, 400, { ok: false, msg: '每个分类都必须有 key 和名称' })
          }
          if (c.key === 'all') {
            return send(res, 400, { ok: false, msg: '「all」是前端虚拟项（全部），不能作为真实分类' })
          }
          if (!/^[\w-]+$/.test(c.key)) {
            return send(res, 400, { ok: false, msg: `分类 key「${c.key}」只能用英文/数字/下划线/连字符` })
          }
          if (seen.has(c.key)) {
            return send(res, 400, { ok: false, msg: `分类 key「${c.key}」重复` })
          }
          seen.add(c.key)
        }
        // 删除保护：不允许有商品仍引用被删除的分类
        const products = readJSON(FILES.products).products || []
        const counts = {}
        for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1
        const orphaned = Object.keys(counts).filter((k) => !seen.has(k) && counts[k] > 0)
        if (orphaned.length) {
          const detail = orphaned
            .map((k) => `「${k}」仍有 ${counts[k]} 个商品`)
            .join('、')
          return send(res, 400, {
            ok: false,
            msg: `删除失败：${detail}。请先到「商品管理」把这些商品改到其他分类。`,
          })
        }
        // 排序
        body.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        writeJSON(FILES.categories, body)
        return send(res, 200, { ok: true, msg: '分类已保存' })
      }
      if (req.method === 'PUT' && path === '/api/notifications') {
        const body = await readBody(req)
        writeJSON(FILES.notifications, body)
        return send(res, 200, { ok: true, msg: '通知已保存' })
      }

      if (req.method === 'POST' && path === '/api/regen') {
        const regen = regenerate()
        return send(res, 200, { ok: true, msg: regen })
      }
      if (req.method === 'POST' && path === '/api/publish') {
        const msg = publish()
        return send(res, 200, { ok: true, msg })
      }

      return send(res, 404, { ok: false, msg: '接口不存在' })
    } catch (e) {
      return send(res, 500, { ok: false, msg: String(e.message || e) })
    }
  }

  send(res, 404, { ok: false, msg: 'Not found' })
})

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        reject(new Error('JSON 解析失败：' + e.message))
      }
    })
    req.on('error', reject)
  })
}

server.listen(PORT, () => {
  console.log(`长缨记忆卡管理后台已启动：http://localhost:${PORT}`)
})
