<script setup>
import { computed, ref } from 'vue'
import notifications from '../data/notifications.json'

const STORE_KEY = 'cy_dismissed_notifs'
const today = () => new Date().toISOString().slice(0, 10)

function loadDismissed() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
  } catch {
    return []
  }
}
const dismissed = ref(loadDismissed())

// 当前应展示的通知：active 且处于 start~end 区间内
const active = computed(() =>
  (notifications.items || []).filter((n) => {
    if (n.active === false) return false
    const t = today()
    if (n.start && n.start > t) return false
    if (n.end && n.end < t) return false
    return !dismissed.value.includes(n.id)
  }),
)

function dismiss(id) {
  const next = [...dismissed.value, id]
  dismissed.value = next
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
  } catch {
    /* 忽略隐私模式写入失败 */
  }
}

const LEVEL = {
  info: { bg: '#2563eb', label: '通知' },
  success: { bg: '#16a34a', label: '好消息' },
  warning: { bg: '#d97706', label: '提示' },
  danger: { bg: '#c0392b', label: '重要' },
}
const styleOf = (lv) => LEVEL[lv] || LEVEL.info
</script>

<template>
  <div v-if="active.length" class="cy-notif">
    <div
      v-for="n in active"
      :key="n.id"
      class="cy-notif-bar"
      :style="{ background: styleOf(n.level).bg }"
    >
      <span class="cy-notif-tag">{{ styleOf(n.level).label }}</span>
      <div class="cy-notif-body">
        <strong v-if="n.title" class="cy-notif-title">{{ n.title }}</strong>
        <span v-if="n.text" class="cy-notif-text">{{ n.text }}</span>
        <a
          v-if="n.link"
          class="cy-notif-link"
          :href="n.link"
          target="_blank"
          rel="noopener"
          >{{ n.linkText || '查看详情' }} →</a
        >
      </div>
      <button
        class="cy-notif-close"
        type="button"
        :aria-label="'关闭通知'"
        @click="dismiss(n.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.cy-notif {
  position: relative;
  z-index: 1000;
}
.cy-notif-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.cy-notif-tag {
  flex: 0 0 auto;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 12px;
  font-weight: 700;
}
.cy-notif-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.cy-notif-title {
  font-weight: 700;
}
.cy-notif-text {
  opacity: 0.95;
}
.cy-notif-link {
  color: #fff;
  font-weight: 700;
  text-decoration: underline;
  white-space: nowrap;
}
.cy-notif-link:hover {
  opacity: 0.85;
}
.cy-notif-close {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
}
.cy-notif-close:hover {
  background: rgba(255, 255, 255, 0.32);
}
</style>
