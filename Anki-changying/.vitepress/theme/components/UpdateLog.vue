<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import feed from '../data/updatelogs.json'

const cats = feed.categories
const allLogs = feed.logs
const active = ref('all')
const activeMonth = ref('')
const showTop = ref(false)

const catLabel = (key) => (cats.find((c) => c.key === key) || {}).label || key

const KIND_TEXT = { update: '更新', errata: '勘误', mixed: '更新 / 勘误' }
const kindText = (k) => KIND_TEXT[k] || '更新'

// 倒序 + 按 category 过滤
const filtered = computed(() =>
  allLogs
    .filter((l) => active.value === 'all' || l.category === active.value)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
)

// 按「年-月」分组（保持倒序）
const months = computed(() => {
  const map = new Map()
  for (const l of filtered.value) {
    const ym = l.date.slice(0, 7)
    if (!map.has(ym)) {
      map.set(ym, {
        ym,
        id: 'm' + ym.replace('-', ''),
        label: `${ym.slice(0, 4)}年${ym.slice(5, 7)}月`,
        logs: [],
      })
    }
    map.get(ym).logs.push(l)
  }
  return [...map.values()]
})

let observer = null

function bindObserver() {
  observer?.disconnect()
  if (!months.value.length) {
    activeMonth.value = ''
    return
  }
  if (!months.value.some((m) => m.id === activeMonth.value)) {
    activeMonth.value = months.value[0].id
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activeMonth.value = e.target.id
      })
    },
    { rootMargin: '-15% 0px -70% 0px' }
  )
  months.value.forEach((m) => {
    const el = document.getElementById(m.id)
    if (el) observer.observe(el)
  })
}

watch(months, () => nextTick(bindObserver))

function navOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height') || '64px'
  return (parseInt(raw, 10) || 64) + 20
}

function goMonth(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset()
  window.scrollTo({ top, behavior: 'smooth' })
  activeMonth.value = id
  history.replaceState(null, '', '#' + id)
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    showTop.value = window.scrollY > 400
    ticking = false
  })
}

onMounted(() => {
  nextTick(bindObserver)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="ulg">
    <header class="ulg-head">
      <h1 class="ulg-title">产品更新与勘误日志</h1>
      <p class="ulg-sub">
        每一次改动都留痕 · 全站共 {{ allLogs.length }} 条记录 · 最后更新 {{ feed._updated }}
      </p>
    </header>

    <div class="ulg-tabs">
      <div class="ulg-seg">
        <button
          v-for="c in cats"
          :key="c.key"
          type="button"
          :class="{ on: active === c.key }"
          @click="active = c.key"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <div class="ulg-wrap">
      <div class="ulg-main">
        <section v-for="m in months" :id="m.id" :key="m.ym" class="ulg-month">
          <h2 class="ulg-month-h">{{ m.label }}<em>{{ m.logs.length }} 条</em></h2>
          <div class="ulg-cards">
            <article v-for="(l, i) in m.logs" :key="m.ym + '-' + i" class="ulg-card">
              <div class="ulg-card-head">
                <div class="ulg-date">
                  {{ l.date }}
                  <span class="ulg-kind" :class="l.kind">{{ kindText(l.kind) }}</span>
                </div>
                <div class="ulg-badge" :class="'c-' + l.category">{{ catLabel(l.category) }}</div>
              </div>
              <h3 v-if="l.title" class="ulg-card-title">{{ l.title }}</h3>
              <div class="ulg-content">{{ l.content }}</div>
            </article>
          </div>
        </section>

        <p v-if="!months.length" class="ulg-empty">当前科目暂无更新内容</p>
      </div>

      <nav v-if="months.length" class="ulg-side">
        <a
          v-for="m in months"
          :key="m.ym"
          :href="'#' + m.id"
          :class="{ on: activeMonth === m.id }"
          @click.prevent="goMonth(m.id)"
        >
          {{ m.label }}
        </a>
      </nav>
    </div>

    <button
      type="button"
      class="ulg-top"
      :class="{ show: showTop }"
      aria-label="回到顶部"
      title="回到顶部"
      @click="toTop"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ulg {
  --ulg-ink: #1d1d1f;
  --ulg-ink-2: #86868b;
  --ulg-card: #ffffff;
  --ulg-line: #e5e5ea;
  --ulg-seg: #e9e9ee;
  --ulg-accent: #c0392b;
  --ulg-accent-2: #e8734a;
  --ulg-shadow: 0 4px 14px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03);
  --ulg-shadow-hover: 0 10px 30px rgba(192, 57, 43, 0.12), 0 4px 10px rgba(0, 0, 0, 0.03);

  max-width: 1020px;
  margin: 0 auto;
  padding: 44px 22px 90px;
  color: var(--ulg-ink);
  font-size: 16px;
  line-height: 1.75;
}

.dark .ulg {
  --ulg-ink: #e7e7ea;
  --ulg-ink-2: #9a9aa2;
  --ulg-card: #1d1d20;
  --ulg-line: #32323a;
  --ulg-seg: #26262c;
  --ulg-accent: #e05a4a;
  --ulg-accent-2: #f08a5d;
  --ulg-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.25);
  --ulg-shadow-hover: 0 10px 30px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* ---------- 标题 ---------- */
.ulg-head {
  text-align: center;
  margin-bottom: 30px;
}
.ulg .ulg-title {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 38px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(45deg, var(--ulg-accent), var(--ulg-accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.ulg .ulg-sub {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--ulg-ink-2);
}

/* ---------- 分段筛选器 ---------- */
.ulg-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 38px;
}
.ulg-seg {
  display: inline-flex;
  max-width: 100%;
  padding: 4px;
  border-radius: 10px;
  background-color: var(--ulg-seg);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.ulg-seg::-webkit-scrollbar {
  display: none;
}
.ulg .ulg-seg button {
  flex: 0 0 auto;
  padding: 8px 22px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--ulg-ink);
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ulg .ulg-seg button:hover {
  color: var(--ulg-accent);
}
.ulg .ulg-seg button.on {
  background: linear-gradient(135deg, var(--ulg-accent) 0%, #98261b 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);
}

/* ---------- 两栏布局 ---------- */
.ulg-wrap {
  display: flex;
  align-items: flex-start;
  gap: 36px;
}
.ulg-main {
  flex: 1;
  min-width: 0;
}

/* ---------- 月份分组 ---------- */
.ulg-month {
  margin-bottom: 32px;
  scroll-margin-top: 100px;
}
.ulg .ulg-month-h {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 18px;
  padding: 0;
  border: 0;
  font-size: 23px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--ulg-ink);
}
.ulg .ulg-month-h::before {
  content: '🗓️';
  font-size: 21px;
}
.ulg .ulg-month-h em {
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  color: var(--ulg-ink-2);
}

/* ---------- 卡片 ---------- */
.ulg-cards {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ulg-card {
  padding: 26px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 18px;
  background-color: var(--ulg-card);
  box-shadow: var(--ulg-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  animation: ulg-fade-in 0.4s ease both;
}
.ulg-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--ulg-shadow-hover);
  border-color: rgba(192, 57, 43, 0.2);
}
.ulg-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--ulg-line);
}
.ulg-date {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ulg-ink);
  font-variant-numeric: tabular-nums;
}
.ulg .ulg-kind {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(192, 57, 43, 0.1);
  color: var(--ulg-accent);
}
.ulg .ulg-kind.errata {
  background-color: rgba(180, 83, 9, 0.12);
  color: #b45309;
}
.ulg .ulg-kind.mixed {
  background-color: rgba(0, 122, 255, 0.12);
  color: #0080ff;
}
.ulg-badge {
  flex: 0 0 auto;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}
.ulg-badge.c-yingyu {
  background-color: #e5f3ff;
  color: #0080ff;
}
.ulg-badge.c-riyu {
  background-color: #e8f8f5;
  color: #12a594;
}
.ulg-badge.c-fakao {
  background-color: #f4ecf7;
  color: #9b59b6;
}
.dark .ulg-badge.c-yingyu {
  background-color: rgba(0, 128, 255, 0.18);
}
.dark .ulg-badge.c-riyu {
  background-color: rgba(18, 165, 148, 0.18);
}
.dark .ulg-badge.c-fakao {
  background-color: rgba(155, 89, 182, 0.2);
}
.ulg .ulg-card-title {
  margin: 0 0 10px;
  padding: 0;
  border: 0;
  font-size: 16.5px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--ulg-ink);
}
.ulg .ulg-content {
  font-size: 15.5px;
  line-height: 1.85;
  color: var(--ulg-ink);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ---------- 空状态 ---------- */
.ulg .ulg-empty {
  margin: 60px 0 0;
  text-align: center;
  font-size: 17px;
  color: var(--ulg-ink-2);
}

/* ---------- 右侧月份导航 ---------- */
.ulg-side {
  position: sticky;
  top: calc(var(--vp-nav-height, 64px) + 26px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 132px;
  flex: 0 0 auto;
  margin-top: 56px;
  padding-left: 20px;
  border-left: 2px solid var(--ulg-line);
}
.ulg .ulg-side a {
  position: relative;
  font-size: 15px;
  font-weight: 500;
  color: var(--ulg-ink-2);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}
.ulg .ulg-side a::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--ulg-line);
  transform: translateY(-50%);
  transition: all 0.3s;
}
.ulg .ulg-side a:hover,
.ulg .ulg-side a.on {
  color: var(--ulg-accent);
  font-weight: 600;
  transform: translateX(4px);
}
.ulg .ulg-side a:hover::before,
.ulg .ulg-side a.on::before {
  background-color: var(--ulg-accent);
  box-shadow: 0 0 8px rgba(192, 57, 43, 0.45);
  transform: translateY(-50%) scale(1.3);
}

/* ---------- 回到顶部 ---------- */
.ulg .ulg-top {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 1px solid rgba(192, 57, 43, 0.25);
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1.5px 1px rgba(255, 255, 255, 0.85);
  color: var(--ulg-accent);
  opacity: 0;
  visibility: hidden;
  transform: translateY(16px) scale(0.9);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  outline: none;
}
.ulg .ulg-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}
.ulg .ulg-top:hover {
  transform: translateY(-3px) scale(1.05);
  border-color: rgba(192, 57, 43, 0.5);
  box-shadow: 0 12px 32px rgba(192, 57, 43, 0.22);
}
.ulg .ulg-top:active {
  transform: scale(0.92);
}
.ulg .ulg-top svg {
  width: 24px;
  height: 24px;
}
.dark .ulg .ulg-top {
  background: linear-gradient(145deg, rgba(60, 60, 66, 0.85), rgba(38, 38, 44, 0.7));
  border-color: rgba(224, 90, 74, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

@keyframes ulg-fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 900px) {
  .ulg {
    padding: 30px 18px 80px;
  }
  .ulg .ulg-title {
    font-size: 29px;
    letter-spacing: 1px;
  }
  .ulg .ulg-seg button {
    padding: 7px 16px;
    font-size: 15px;
  }
  .ulg-wrap {
    flex-direction: column-reverse;
    gap: 18px;
  }
  .ulg-side {
    position: sticky;
    top: var(--vp-nav-height, 64px);
    z-index: 20;
    flex-direction: row;
    gap: 8px;
    width: 100%;
    margin-top: -8px;
    padding: 10px 0;
    border-left: 0;
    border-bottom: 1px solid var(--ulg-line);
    background: var(--ulg-card);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ulg-side::-webkit-scrollbar {
    display: none;
  }
  .ulg .ulg-side a {
    flex: 0 0 auto;
    padding: 5px 14px;
    border-radius: 20px;
    background: var(--ulg-seg);
    font-size: 14px;
  }
  .ulg .ulg-side a::before {
    display: none;
  }
  .ulg .ulg-side a:hover,
  .ulg .ulg-side a.on {
    transform: none;
    background: linear-gradient(135deg, var(--ulg-accent) 0%, #98261b 100%);
    color: #fff;
  }
  .ulg-card {
    padding: 20px;
    border-radius: 15px;
  }
  .ulg .ulg-month-h {
    font-size: 20px;
  }
  .ulg .ulg-top {
    right: 20px;
    bottom: 24px;
    width: 44px;
    height: 44px;
  }
  .ulg .ulg-top svg {
    width: 20px;
    height: 20px;
  }
}
</style>
