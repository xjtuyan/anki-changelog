import { defineConfig } from 'vitepress'
// 站点基本信息改为「数据驱动」：统一从 theme/data/site.json 读取，
// 管理后台（admin/）改 site.json 后，构建即生效，无需再动这份配置。
import site from './theme/data/site.json'

// base 说明：
// 站点以 GitHub Pages + 自定义域名 www.cycards.cn 为主力。
// 自定义域名下 GitHub Pages 把 dist 作为「站点根」提供服务，
// 因此 base 固定为 '/'，所有资源都从根路径加载。
// （早期无自定义域名时曾用 /anki-changelog/ 项目子路径 base，现不再使用。）
const BASE = '/'

export default defineConfig({
  base: BASE,
  title: site.title,
  description: site.description,
  lang: site.lang || 'zh-CN',
  head: [
    // head 里的静态资源不会被 VitePress 自动加 base 前缀，手动拼
    ['link', { rel: 'icon', href: `${BASE}favicon.ico` }],
    ['meta', { name: 'theme-color', content: '#c0392b' }],
  ],
  themeConfig: {
    // themeConfig.logo 会由 VitePress 自动加 base 前缀，写根路径即可
    logo: '/logo.svg',
    nav: site.nav,
    footer: {
      message: site.footer?.message || '',
      copyright: site.footer?.copyright || '',
    },
    lastUpdated: true,
    search: { provider: 'local' },
  },
})
