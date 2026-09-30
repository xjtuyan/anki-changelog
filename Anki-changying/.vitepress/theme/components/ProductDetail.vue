<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import data from '../data/products.json'

const props = defineProps({ slug: { type: String, required: true } })
const p = computed(() => data.products.find(x => x.id === props.slug))
</script>

<template>
  <div v-if="p" class="pd">
    <a class="pd-back" :href="withBase('/products.html')">← 返回产品展示</a>

    <div class="pd-head">
      <div class="pct-icon big">{{ p.icon }}</div>
      <div>
        <h1>{{ p.name }}
          <span v-for="t in p.tags" :key="t" class="tag" :class="t === '热门' ? 'tag-hot' : 'tag-new'">{{ t }}</span>
        </h1>
        <div class="meta">{{ p.meta }}<template v-if="p.version"> · 当前版本 v{{ p.version }} · 更新于 {{ p.updated }}</template></div>
      </div>
    </div>

    <div class="pd-buy">
      <span class="price">{{ p.price }}</span>
      <a v-if="p.buy" class="pd-btn" :href="p.buy" target="_blank" rel="noopener">前往购买</a>
      <span v-else class="pd-btn ghost">筹备中</span>
    </div>

    <div v-if="p.version" class="pd-anki">🔔 Anki 用户：安装「牌组更新提醒」插件后，打开 Anki 会自动提示本牌组的最新版本（当前 v{{ p.version }}）。安装方法见 <a :href="withBase('/about.html')">关于页</a>。</div>

    <h2>产品介绍</h2>
    <ul class="pd-intro"><li v-for="line in p.intro" :key="line">{{ line }}</li></ul>

    <h2>更新 &amp; 勘误日志</h2>
    <p class="pd-hint">更新与勘误合并展示，按时间倒序。<strong>勘误以本页为准</strong>，请及时同步你手上的卡。</p>

    <div v-if="p.timeline.length" class="tl">
      <div v-for="e in p.timeline" :key="e.date + e.title" class="tl-item">
        <div class="tl-dot" :class="e.type"></div>
        <div class="tl-body">
          <div class="tl-head">
            <span class="tl-date">{{ e.date }}</span>
            <span class="tl-badge" :class="e.type">{{ e.type === 'update' ? '更新' : '勘误' }}</span>
            <strong>{{ e.title }}</strong>
          </div>
          <ul><li v-for="it in e.items" :key="it">{{ it }}</li></ul>
        </div>
      </div>
    </div>
    <p v-else class="pd-hint">本牌组尚未发布，上线后此处将展示更新与勘误时间轴。</p>
  </div>
</template>
