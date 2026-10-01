<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'
import data from '../data/products.json'

// 每张轮播卡的渐变（按顺序循环）
const GRADS = [
  'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
  'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
  'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)',
]

const slides = computed(() =>
  data.products.map((p, i) => ({ ...p, grad: GRADS[i % GRADS.length] }))
)

const idx = ref(0)
let timer = null

const next = () => { idx.value = (idx.value + 1) % slides.value.length }
const prev = () => { idx.value = (idx.value - 1 + slides.value.length) % slides.value.length }
const go = (i) => { idx.value = i }

const start = () => { stop(); timer = setInterval(next, 5000) }
const stop = () => { if (timer) { clearInterval(timer); timer = null } }

onMounted(start)
onBeforeUnmount(stop)

const year = new Date().getFullYear()
</script>

<template>
  <div class="hl">
    <!-- ===== Hero ===== -->
    <section class="hl-hero">
      <div class="hl-deco hl-deco-a"></div>
      <div class="hl-deco hl-deco-b"></div>

      <div class="hl-hero-inner">
        <p class="hl-kicker">Anki 牌组 · 长缨记忆卡</p>
        <h1 class="hl-hero-title">
          今日长缨在手，<br><span class="hl-accent">何时缚住苍龙</span>
        </h1>
        <p class="hl-hero-cite">—— 毛泽东《清平乐 · 六盘山》</p>
        <p class="hl-hero-sub">
          为考研 · 法考 · 日语备考者打造专业 Anki 牌组<br>
          科学记忆，持续迭代，勘误透明
        </p>

        <div class="hl-hero-actions">
          <a class="hl-btn hl-btn-primary" :href="withBase('/products')">
            📖 浏览产品 <span class="hl-arrow">→</span>
          </a>
          <a class="hl-btn hl-btn-outline" :href="withBase('/updatelogs')">🔔 更新与勘误</a>
          <a class="hl-btn hl-btn-outline" :href="withBase('/about')">💡 关于长缨</a>
        </div>
      </div>

      <div class="hl-scroll-hint" aria-hidden="true">⌄</div>
    </section>

    <!-- ===== 产品轮播 ===== -->
    <section class="hl-products">
      <div class="hl-wrap">
        <header class="hl-sec-head">
          <h2><span class="hl-star">★</span> 热门牌组推荐</h2>
          <p>精选高质量 Anki 牌组，助力你的备考之路</p>
        </header>

        <div class="hl-carousel" @mouseenter="stop" @mouseleave="start">
          <div class="hl-viewport">
            <div class="hl-track" :style="{ transform: `translateX(-${idx * 100}%)` }">
              <div class="hl-slide" v-for="p in slides" :key="p.id">
                <div class="hl-card" :style="{ background: p.grad }">
                  <div class="hl-card-icon">{{ p.icon }}</div>
                  <h3 class="hl-card-name">{{ p.name }}</h3>
                  <p class="hl-card-meta">{{ p.meta }}</p>
                  <p class="hl-card-desc">{{ p.desc }}</p>
                  <a
                    v-if="p.buy"
                    class="hl-card-btn"
                    :href="p.buy"
                    target="_blank"
                    rel="noopener"
                  >立即获取 ↗</a>
                  <span v-else class="hl-card-btn is-soon">筹备中 · 敬请期待</span>
                </div>
              </div>
            </div>
          </div>

          <button class="hl-nav hl-prev" aria-label="上一张" @click="prev">‹</button>
          <button class="hl-nav hl-next" aria-label="下一张" @click="next">›</button>
        </div>

        <div class="hl-dots">
          <button
            v-for="(p, i) in slides"
            :key="p.id"
            :class="{ on: i === idx }"
            :aria-label="'第 ' + (i + 1) + ' 张'"
            @click="go(i)"
          ></button>
        </div>
      </div>
    </section>

    <!-- ===== 什么是 Anki ===== -->
    <section class="hl-what">
      <div class="hl-wrap">
        <header class="hl-sec-head">
          <h2><span class="hl-q">?</span> 什么是 Anki？</h2>
        </header>

        <div class="hl-cols">
          <div class="hl-pane">
            <p class="hl-lead">
              Anki 是一款智能记忆卡片软件，它运用间隔重复算法，模拟人类大脑的遗忘曲线，
              在最佳时间点提醒你复习内容，从而巩固记忆。
            </p>
            <p>
              通过 Anki，你可以把复杂的知识点拆成小单元逐一攻克，形成系统的知识网络。
              长缨记忆卡的使命，就是为考研 / 法考 / 日语备考者提供精心设计的专业牌组。
            </p>
          </div>

          <div class="hl-pane">
            <h3>💡 为什么选长缨</h3>
            <ul class="hl-checks">
              <li>科学的间隔重复排程，记忆效率倍增</li>
              <li>知识点拆解 + 字段结构统一，导入即用</li>
              <li>每份牌组持续迭代，买一次长期受益</li>
              <li>勘误公开可追溯，手上的卡始终有准信</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="hl-cta">
      <div class="hl-cta-veil"></div>
      <div class="hl-wrap hl-cta-inner">
        <h2>了解更多</h2>
        <p>浏览完整牌组清单，或查看每一份牌组的更新与勘误记录</p>
        <div class="hl-hero-actions">
          <a class="hl-btn hl-btn-white" :href="withBase('/products')">
            🛍️ 产品展示 <span class="hl-arrow">→</span>
          </a>
          <a class="hl-btn hl-btn-ghost" :href="withBase('/updatelogs')">🕒 更新与勘误</a>
        </div>
      </div>
    </section>

    <!-- ===== Footer ===== -->
    <footer class="hl-footer">
      <div class="hl-wrap">
        <div class="hl-foot-grid">
          <div class="hl-foot-brand">
            <div class="hl-foot-logo"><span class="hl-foot-mark">缨</span> 长缨记忆卡</div>
            <p>为考研 · 法考 · 日语备考者打造专业 Anki 牌组</p>
          </div>

          <div class="hl-foot-col">
            <h4>产品</h4>
            <a :href="withBase('/products')">产品展示</a>
            <a :href="withBase('/updatelogs')">更新与勘误</a>
            <a :href="withBase('/anki-update')">Anki 更新提醒</a>
          </div>

          <div class="hl-foot-col">
            <h4>支持</h4>
            <a :href="withBase('/about')">关于长缨</a>
            <a :href="withBase('/updatelogs')">勘误反馈</a>
            <a :href="withBase('/about')">常见问题</a>
          </div>
        </div>

        <div class="hl-foot-bottom">
          <span>© {{ year }} 长缨记忆卡 · 保留所有权利</span>
          <span>淘宝 / 闲鱼购买，内容以本站勘误日志为准</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hl {
  --hl-accent: #c0392b;
  --hl-accent-dark: #a93226;
  --hl-ink: #1d1d1f;
  --hl-gray: #6e6e73;
  --hl-line: #ececee;
  --hl-soft: #f5f5f7;
  width: 100%;
  background: #fff;
  color: var(--hl-ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.hl-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== 通用按钮 ===== */
.hl-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 34px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform .25s ease, background .25s ease, color .25s ease,
    box-shadow .25s ease, border-color .25s ease;
  white-space: nowrap;
}
.hl-btn:hover { transform: scale(1.05); }
.hl-arrow { transition: transform .2s ease; }
.hl-btn:hover .hl-arrow { transform: translateX(4px); }

.hl-btn-primary {
  background: var(--hl-accent);
  color: #fff;
  box-shadow: 0 10px 24px rgba(192, 57, 43, .28);
}
.hl-btn-primary:hover { background: var(--hl-accent-dark); }

.hl-btn-outline {
  background: #fff;
  color: var(--hl-accent);
  border: 2px solid var(--hl-accent);
}
.hl-btn-outline:hover { background: var(--hl-accent); color: #fff; }

.hl-btn-white {
  background: #fff;
  color: var(--hl-accent);
  box-shadow: 0 10px 24px rgba(0, 0, 0, .16);
}
.hl-btn-white:hover { background: #f5f5f7; }

.hl-btn-ghost {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, .85);
}
.hl-btn-ghost:hover { background: #fff; color: var(--hl-accent); }

/* ===== Hero ===== */
.hl-hero {
  position: relative;
  min-height: calc(100vh - var(--vp-nav-height, 64px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f3 0%, #ffffff 45%, #f3f4ff 100%);
}

.hl-deco {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
}
.hl-deco-a {
  width: 420px; height: 420px;
  background: rgba(192, 57, 43, .12);
  top: -80px; right: -60px;
}
.hl-deco-b {
  width: 380px; height: 380px;
  background: rgba(109, 40, 217, .10);
  bottom: -100px; left: -60px;
}

.hl-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 900px;
}

.hl-kicker {
  display: inline-block;
  margin: 0 0 22px;
  padding: 7px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: .02em;
  color: var(--hl-accent);
  background: rgba(192, 57, 43, .09);
}

.hl-hero-title {
  margin: 0 0 14px;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  line-height: 1.14;
  font-weight: 900;
  letter-spacing: -.01em;
  color: var(--hl-ink);
}
.hl-accent { color: var(--hl-accent); }

.hl-hero-cite {
  margin: 0 0 28px;
  font-size: clamp(.92rem, 1.7vw, 1.1rem);
  letter-spacing: .1em;
  font-weight: 500;
  color: var(--hl-gray);
  opacity: .85;
}

.hl-hero-sub {
  margin: 0 auto 44px;
  max-width: 640px;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  line-height: 1.75;
  color: var(--hl-gray);
}

.hl-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  align-items: center;
}

.hl-scroll-hint {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  line-height: 1;
  color: var(--hl-gray);
  animation: hl-bounce 2s infinite;
}
@keyframes hl-bounce {
  0%, 100% { transform: translate(-50%, 0); opacity: .55; }
  50% { transform: translate(-50%, 10px); opacity: 1; }
}

/* ===== 区块标题 ===== */
.hl-sec-head { text-align: center; margin-bottom: 52px; }
.hl-sec-head h2 {
  margin: 0 0 14px;
  font-size: clamp(1.6rem, 3.6vw, 2.4rem);
  font-weight: 800;
  color: var(--hl-ink);
}
.hl-sec-head p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--hl-gray);
}
.hl-star { color: #f5a623; margin-right: 8px; }
.hl-q {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px; height: 34px;
  margin-right: 10px;
  border-radius: 50%;
  background: var(--hl-accent);
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  vertical-align: middle;
}

/* ===== 产品轮播 ===== */
.hl-products {
  padding: 92px 0 76px;
  background: linear-gradient(135deg, #fafafc 0%, #f4f6ff 100%);
}

.hl-carousel { position: relative; }

.hl-viewport { overflow: hidden; border-radius: 28px; }

.hl-track {
  display: flex;
  transition: transform .55s cubic-bezier(.4, 0, .2, 1);
}

.hl-slide {
  flex: 0 0 100%;
  box-sizing: border-box;
}

.hl-card {
  position: relative;
  min-height: 420px;
  border-radius: 28px;
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .16);
  overflow: hidden;
}
.hl-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 82% 12%, rgba(255,255,255,.22), transparent 42%);
  pointer-events: none;
}

.hl-card-icon {
  font-size: 68px;
  line-height: 1;
  margin-bottom: 22px;
  opacity: .95;
}
.hl-card-name {
  margin: 0 0 8px;
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  font-weight: 800;
}
.hl-card-meta {
  margin: 0 0 16px;
  font-size: 14px;
  letter-spacing: .04em;
  opacity: .82;
}
.hl-card-desc {
  margin: 0 auto 30px;
  max-width: 560px;
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.7;
  opacity: .94;
}
.hl-card-btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 34px;
  border-radius: 999px;
  background: #fff;
  color: var(--hl-accent);
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: transform .25s ease, background .25s ease;
}
.hl-card-btn:hover { transform: scale(1.05); background: #f5f5f7; }
.hl-card-btn.is-soon {
  background: rgba(255, 255, 255, .18);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, .55);
  cursor: default;
}
.hl-card-btn.is-soon:hover { transform: none; }

.hl-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px; height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, .92);
  color: var(--hl-ink);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
  transition: background .2s, transform .2s;
  z-index: 3;
}
.hl-nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
.hl-prev { left: 18px; }
.hl-next { right: 18px; }

.hl-dots {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 28px;
}
.hl-dots button {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: #cfd2d9;
  cursor: pointer;
  transition: width .25s ease, background .25s ease;
}
.hl-dots button.on {
  width: 30px;
  border-radius: 999px;
  background: var(--hl-accent);
}

/* ===== 什么是 Anki ===== */
.hl-what { padding: 92px 0; background: #fff; }

.hl-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;
}
.hl-pane {
  background: var(--hl-soft);
  border-radius: 24px;
  padding: 40px;
  transition: transform .25s ease, box-shadow .25s ease;
}
.hl-pane:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, .08);
}
.hl-pane p {
  margin: 0 0 16px;
  font-size: 1.05rem;
  line-height: 1.85;
  color: #3a3a3c;
}
.hl-pane p:last-child { margin-bottom: 0; }
.hl-lead { font-size: 1.15rem !important; color: var(--hl-ink) !important; }

.hl-pane h3 {
  margin: 0 0 24px;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--hl-ink);
}
.hl-checks { list-style: none; margin: 0; padding: 0; }
.hl-checks li {
  position: relative;
  padding-left: 34px;
  margin-bottom: 18px;
  font-size: 1.02rem;
  line-height: 1.65;
  color: #3a3a3c;
}
.hl-checks li:last-child { margin-bottom: 0; }
.hl-checks li::before {
  content: '✓';
  position: absolute;
  left: 0; top: 0;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #22a06b;
  color: #fff;
  font-size: 13px;
  line-height: 22px;
  text-align: center;
  font-weight: 700;
}

/* ===== CTA ===== */
.hl-cta {
  position: relative;
  padding: 96px 0;
  background: linear-gradient(135deg, #c0392b 0%, #a93226 55%, #7c3aed 130%);
  color: #fff;
  overflow: hidden;
  text-align: center;
}
.hl-cta-veil {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .08);
  pointer-events: none;
}
.hl-cta-inner { position: relative; z-index: 2; }
.hl-cta h2 {
  margin: 0 0 18px;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
}
.hl-cta p {
  margin: 0 auto 40px;
  max-width: 620px;
  font-size: 1.15rem;
  line-height: 1.7;
  opacity: .92;
}

/* ===== Footer ===== */
.hl-footer {
  background: #1d1d1f;
  color: #fff;
  padding: 64px 0 32px;
}
.hl-foot-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
}
.hl-foot-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.hl-foot-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px; height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  font-size: 18px;
  font-weight: 800;
}
.hl-foot-brand p {
  margin: 0;
  max-width: 320px;
  font-size: 14px;
  line-height: 1.7;
  color: #a1a1a6;
}
.hl-foot-col h4 {
  margin: 0 0 18px;
  font-size: 1rem;
  font-weight: 700;
}
.hl-foot-col a {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  color: #a1a1a6;
  text-decoration: none;
  transition: color .2s;
}
.hl-foot-col a:hover { color: #fff; }
.hl-foot-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 26px;
  font-size: 13px;
  color: #86868b;
}

/* ===== 响应式 ===== */
@media (max-width: 860px) {
  .hl-cols { grid-template-columns: 1fr; }
  .hl-foot-grid { grid-template-columns: 1fr 1fr; }
  .hl-foot-brand { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .hl-hero { padding: 60px 20px 100px; }
  .hl-btn { padding: 13px 26px; font-size: 15px; }
  .hl-hero-actions { flex-direction: column; width: 100%; }
  .hl-hero-actions .hl-btn { width: 100%; justify-content: center; }
  .hl-card { min-height: 380px; padding: 44px 26px; }
  .hl-card-icon { font-size: 54px; }
  .hl-nav { width: 40px; height: 40px; font-size: 22px; }
  .hl-prev { left: 10px; } .hl-next { right: 10px; }
  .hl-pane { padding: 28px; }
  .hl-products, .hl-what { padding: 64px 0; }
  .hl-cta { padding: 72px 0; }
  .hl-foot-grid { grid-template-columns: 1fr; gap: 28px; }
}
</style>
