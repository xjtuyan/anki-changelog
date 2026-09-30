<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import data from '../data/products.json'

const active = ref('all')
const filtered = computed(() =>
  active.value === 'all'
    ? data.products
    : data.products.filter(p => p.category === active.value)
)
const link = id => withBase('/products/' + id + '.html')
const tagClass = t => (t === '热门' ? 'tag-hot' : t === '筹备中' ? 'tag-soon' : 'tag-new')
</script>

<template>
  <div class="ps">
    <div class="ps-cats">
      <button
        v-for="c in data.categories"
        :key="c.key"
        class="ps-cat"
        :class="{ on: active === c.key }"
        @click="active = c.key"
      >{{ c.label }}</button>
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
  </div>
</template>
