import { defineConfig } from 'vitepress'

// base 说明：
// - GitHub Pages 项目站托管在 https://xjtuyan.github.io/anki-changelog/ 子路径下，
//   构建时需设 DEPLOY_TARGET=gh → base = '/anki-changelog/'（deploy.yml 已设置）。
// - Cloudflare Pages / 自定义域名把 dist 作为站点根 → 不设 DEPLOY_TARGET，base = '/'。
const isGhPages = process.env.DEPLOY_TARGET === 'gh'
const BASE = isGhPages ? '/anki-changelog/' : '/'

export default defineConfig({
  base: BASE,
  title: '长缨记忆卡',
  description: '为考研 · 法考 · 日语备考者打造专业 Anki 牌组。科学记忆，持续迭代，勘误透明。',
  lang: 'zh-CN',
  head: [
    // head 里的静态资源不会被 VitePress 自动加 base 前缀，手动拼
    ['link', { rel: 'icon', href: `${BASE}favicon.ico` }],
    ['meta', { name: 'theme-color', content: '#c0392b' }],
  ],
  themeConfig: {
    // themeConfig.logo 会由 VitePress 自动加 base 前缀，写根路径即可
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '产品展示', link: '/products' },
      { text: '更新与勘误', link: '/updatelogs' },
      { text: '关于', link: '/about' },
    ],
    footer: {
      message: '长缨记忆卡 · 专业 Anki 牌组',
      copyright: 'Copyright © 2026 长缨记忆卡',
    },
    lastUpdated: true,
    search: { provider: 'local' },
  },
})
