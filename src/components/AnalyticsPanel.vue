<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { DailyStat, HardestWord, IntervalBucket, Overview } from '../types/analytics'

Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
)

const emit = defineEmits<{ close: [] }>()

const loading = ref(true)
const error = ref('')
const overview = ref<Overview | null>(null)
const daily = ref<DailyStat[]>([])
const hardest = ref<HardestWord[]>([])
const intervals = ref<IntervalBucket[]>([])

const dailyCanvas = ref<HTMLCanvasElement | null>(null)
const intervalCanvas = ref<HTMLCanvasElement | null>(null)
let dailyChart: Chart | null = null
let intervalChart: Chart | null = null

const hasData = computed(() => (overview.value?.totalReviews ?? 0) > 0)

function minutesToHuman(m: number): string {
  if (m < 60) return `${m} 分钟`
  if (m < 1440) return `${Math.round(m / 60)} 小时`
  return `${Math.round(m / 1440)} 天`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [oRes, dRes, hRes, iRes] = await Promise.all([
      fetch('/api/analytics/overview'),
      fetch('/api/analytics/daily?days=14'),
      fetch('/api/analytics/hardest?limit=15'),
      fetch('/api/analytics/intervals'),
    ])
    if (!oRes.ok) throw new Error(`HTTP ${oRes.status}`)

    overview.value = await oRes.json()
    daily.value = dRes.ok ? await dRes.json() : []
    hardest.value = hRes.ok ? await hRes.json() : []
    intervals.value = iRes.ok ? await iRes.json() : []
  } catch (e) {
    error.value = `加载失败：${(e as Error).message}`
  } finally {
    loading.value = false
  }

  // 关键：loading 置 false 之后 DOM 才会渲染 canvas，
  // 此刻再 nextTick 才能拿到真实引用
  await nextTick()
  if (!error.value) {
    renderCharts()
  }
}

function renderCharts() {
  if (dailyCanvas.value) {
    dailyChart?.destroy()
    const labels = daily.value.map((d) => d.date.slice(5))
    dailyChart = new Chart(dailyCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '复习次数',
            data: daily.value.map((d) => d.total),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
          {
            label: '认识',
            data: daily.value.map((d) => d.knownCount),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    })
  }

  if (intervalCanvas.value) {
    intervalChart?.destroy()
    intervalChart = new Chart(intervalCanvas.value, {
      type: 'bar',
      data: {
        labels: intervals.value.map((b) => b.bucket),
        datasets: [
          {
            label: '单词数',
            data: intervals.value.map((b) => b.count),
            backgroundColor: '#93c5fd',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    })
  }
}

function cleanup() {
  dailyChart?.destroy()
  intervalChart?.destroy()
  dailyChart = null
  intervalChart = null
}

onMounted(load)
onUnmounted(cleanup)
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <header class="panel-header">
        <div class="title">学习数据</div>
        <button class="close" @click="emit('close')">×</button>
      </header>

      <div class="body">
        <p v-if="loading" class="hint">正在加载…</p>
        <p v-else-if="error" class="hint error">{{ error }}</p>

        <template v-else>
          <section v-if="overview" class="cards">
            <div class="card">
              <div class="card-label">累计复习</div>
              <div class="card-value">{{ overview.totalReviews }}</div>
            </div>
            <div class="card">
              <div class="card-label">学习天数</div>
              <div class="card-value">{{ overview.studyDays }}</div>
            </div>
            <div class="card">
              <div class="card-label">正确率</div>
              <div class="card-value">{{ overview.accuracyPercent }}%</div>
            </div>
            <div class="card">
              <div class="card-label">待复习</div>
              <div class="card-value due">{{ overview.dueNow }}</div>
            </div>
          </section>

          <p v-if="!hasData" class="hint">
            还没有复习记录。标记几个单词后，这里会显示你的学习数据。
          </p>

          <template v-else>
            <section class="block">
              <h3>最近 14 天</h3>
              <div class="chart-box">
                <canvas ref="dailyCanvas"></canvas>
              </div>
            </section>

            <section class="block">
              <h3>记忆巩固分布</h3>
              <p class="sub">间隔越长，说明记得越牢</p>
              <div class="chart-box">
                <canvas ref="intervalCanvas"></canvas>
              </div>
            </section>

            <section class="block">
              <h3>易忘词排行</h3>
              <p class="sub">忘记次数越多，越需要重点复习</p>
              <ul class="hardest">
                <li v-for="w in hardest" :key="w.wordId">
                  <div class="hw-main">
                    <span class="hw-text">{{ w.text }}</span>
                    <span class="hw-phonetic">{{ w.phonetic }}</span>
                  </div>
                  <div class="hw-meaning">{{ w.firstMeaning }}</div>
                  <div class="hw-meta">
                    忘记 {{ w.lapses }} 次 · 间隔 {{ minutesToHuman(w.intervalMinutes) }}
                  </div>
                </li>
                <li v-if="hardest.length === 0" class="empty">
                  没有需要重点复习的词
                </li>
              </ul>
            </section>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 20px;
}

.panel {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.title {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  padding: 4px 8px;
  min-width: 44px;
  min-height: 44px;
}

.body {
  padding: 18px;
  overflow-y: auto;
}

.hint {
  text-align: center;
  color: #9ca3af;
  padding: 24px 0;
  font-size: 14px;
}

.hint.error {
  color: #991b1b;
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 22px;
}

.card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-value {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.card-value.due {
  color: #b45309;
}

.block {
  margin-bottom: 26px;
}

h3 {
  font-size: 15px;
  color: #111827;
  margin: 0 0 4px;
}

.sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 10px;
}

.chart-box {
  position: relative;
  height: 200px;
}

.hardest {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.hardest li {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.hardest li:last-child {
  border-bottom: none;
}

.hardest li.empty {
  color: #9ca3af;
  text-align: center;
  font-size: 14px;
}

.hw-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.hw-text {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}

.hw-phonetic {
  font-size: 13px;
  color: #9ca3af;
}

.hw-meaning {
  font-size: 13px;
  color: #374151;
  margin-top: 2px;
}

.hw-meta {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

@media (max-width: 480px) {
  .overlay {
    padding: 0;
    align-items: flex-end;
  }

  .panel {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-box {
    height: 180px;
  }
}
</style>