<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  goal: number
  size?: number
}>()

const size = computed(() => props.size ?? 120)
const stroke = computed(() => Math.max(6, Math.round(size.value * 0.09)))
const radius = computed(() => (size.value - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const ratio = computed(() => {
  if (props.goal <= 0) return 0
  return Math.min(1, props.current / props.goal)
})
const dash = computed(() => circumference.value * ratio.value)
const done = computed(() => props.current >= props.goal)
const percent = computed(() => Math.round(ratio.value * 100))
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="svg">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="stroke"
        class="track"
        fill="none"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="stroke"
        :stroke-dasharray="dash + ' ' + circumference"
        stroke-linecap="round"
        class="bar"
        :class="{ done }"
        fill="none"
        :transform="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
      />
    </svg>
    <div class="center">
      <div class="count">{{ current }}<span class="goal">/{{ goal }}</span></div>
      <div class="label">{{ done ? '今日完成' : percent + '%' }}</div>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.svg {
  display: block;
}

.track {
  stroke: #e5e7eb;
}

.bar {
  stroke: #2563eb;
  transition: stroke-dasharray 0.6s ease;
}

.bar.done {
  stroke: #16a34a;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.count {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.count .goal {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 1px;
}

.label {
  font-size: 10px;
  color: #6b7280;
}
</style>
