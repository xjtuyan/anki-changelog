import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ProductShowcase from './components/ProductShowcase.vue'
import ProductDetail from './components/ProductDetail.vue'
import UpdateLog from './components/UpdateLog.vue'
import HomeLanding from './components/HomeLanding.vue'
import NotificationBar from './components/NotificationBar.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // 通过 layout-top 插槽把「通知横幅」挂到全站最顶部（nav 之上）
  Layout: () => {
    return h(DefaultTheme.Layout, {}, {
      'layout-top': () => h(NotificationBar),
    })
  },
  enhanceApp({ app }) {
    app.component('ProductShowcase', ProductShowcase)
    app.component('ProductDetail', ProductDetail)
    app.component('UpdateLog', UpdateLog)
    app.component('HomeLanding', HomeLanding)
    app.component('NotificationBar', NotificationBar)
  },
}
