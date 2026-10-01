<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import products from '../data/products.json'
import catsData from '../data/categories.json'

// 分类筛选栏：真实分类 + 「全部」虚拟项
const cats = [{ key: 'all', label: '全部' }, ...catsData]
const active = ref('all')
const filtered = computed(() =>
  active.value === 'all'
    ? products.products
    : products.products.filter(p => p.category === active.value)
)
const link = id => withBase('/products/' + id + '.html')
const tagClass = t => (t === '热门' ? 'tag-hot' : t === '筹备中' ? 'tag-soon' : 'tag-new')
</script>

<template>
  <div class="site-wrap">
    <header class="ps-head">
      <h1 class="ps-title">产品展示</h1>
      <p class="ps-sub">
        每一份牌组都随考情持续迭代。点击卡片进入<strong>详情页</strong>，查看更新 &amp; 勘误时间轴；
        全站所有牌组的改动汇总，见<a :href="withBase('/updatelogs')">《更新与勘误日志》</a>。
      </p>
    </header>

    <div class="ps-cats">
      <button
        v-for="c in cats"
        :key="c.key"
        class="ps-cat"
        :class="{ on: active === c.key }"
        @click="active = c.key"
      >{{ c.icon ? c.icon + ' ' : '' }}{{ c.label }}</button>
    </div>

    <div class="deck-grid">
      <a v-for="p in filtered" :key="p.id" class="product-card" :href="link(p.id)">
        <div class="pct-icon">{{ p.icon }}</div>
        <h3>{{ p.name }}
          <span v-for="t in p.tags" :key="t" class="tag" :class="tagClass(t)">{{ t }}</span>
        </h3>
        <div class="meta">{{ p.meta }}</div>
        <div class="desc">{{ p.desc }}</div>
        <div class="pct-foot">
          <span class="price">{{ p.price }}</span>
          <span class="more">详情 &amp; 更新记录 →</span>
        </div>
      </a>
    </div>

    <p class="ps-tip">
      💡 想第一时间知道牌组有更新？安装 Anki 插件「长缨记忆卡 · 牌组更新提醒」，打开 Anki 自动提示，
      安装方法见<a :href="withBase('/about')">关于页</a>。
    </p>
  </div>
</template>

<style scoped>
.ps-tip {
  margin: 34px 0 0;
  padding: 16px 20px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}
.ps-tip a { color: var(--vp-c-brand-1); font-weight: 600; }
</style>
