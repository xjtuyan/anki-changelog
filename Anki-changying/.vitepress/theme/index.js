import DefaultTheme from 'vitepress/theme'
import ProductShowcase from './components/ProductShowcase.vue'
import ProductDetail from './components/ProductDetail.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ProductShowcase', ProductShowcase)
    app.component('ProductDetail', ProductDetail)
  },
}
