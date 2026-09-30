import { defineConfig } from 'vitepress'

// base 说明：
// GitHub Pages 项目站与 Cloudflare Pages 均把构建产物 dist 作为站点根目录，
// 因此 base 统一设为 '/'。若日后改子路径托管再调整。
export default defineConfig({
  base: '/',
  title: '长缨记忆卡',
  description: '为考研 · 法考 · 日语备考者打造专业 Anki 牌组。科学记忆，持续迭代，勘误透明。',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#c0392b' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '产品展示', link: '/products' },
      { text: '关于', link: '/about' },
    ],
    footer: {
      message: '长缨记忆卡 · 专业 Anki 牌组',
      copyright: 'Copyright © 2026 闫兵广',
    },
    lastUpdated: true,
    search: { provider: 'local' },
  },
})
