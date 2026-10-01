import { defineConfig } from 'vitepress'

// base 说明：
// 站点以 GitHub Pages + 自定义域名 www.cycards.cn 为主力。
// 自定义域名下 GitHub Pages 把 dist 作为「站点根」提供服务，
// 因此 base 固定为 '/'，所有资源都从根路径加载。
// （早期无自定义域名时曾用 /anki-changelog/ 项目子路径 base，现不再使用。）
const BASE = '/'

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
