<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface DayCount {
  date: string
  total: number
}

interface DayWord {
  wordId: number
  text: string
  phonetic: string
  firstMeaning: string
  state: string
  reviewedAt: string
}

function ymd(d: Date): string {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

const todayStr = ymd(new Date())
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)

const counts = ref<Map<string, number>>(new Map())
const loadingMonth = ref(false)

const selectedDate = ref<string | null>(null)
const dayWords = ref<DayWord[]>([])
const loadingDay = ref(false)
const dayError = ref('')

const monthLabel = computed(() => year.value + ' 年 ' + month.value + ' 月')

const weeks = computed(() => {
  const first = new Date(year.value, month.value - 1, 1)
  const last = new Date(year.value, month.value, 0)
  const startWeekday = (first.getDay() + 6) % 7
  const daysInMonth = last.getDate()

  const cells: { date: string | null; day: number | null; total: number }[] = []

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null, day: null, total: 0 })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ymdStr = year.value + '-' +
      String(month.value).padStart(2, '0') + '-' +
      String(d).padStart(2, '0')
    cells.push({ date: ymdStr, day: d, total: counts.value.get(ymdStr) ?? 0 })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, total: 0 })
  }

  const result: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) {
    result.push(cells.slice(i, i + 7))
  }
  return result
})

function levelClass(total: number): string {
  if (total === 0) return ''
  if (total < 10) return 'l1'
  if (total < 25) return 'l2'
  if (total < 45) return 'l3'
  return 'l4'
}

function isToday(date: string | null): boolean {
  return date === todayStr
}

function isFuture(date: string | null): boolean {
  if (!date) return false
  return date > todayStr
}

async function loadMonth() {
  loadingMonth.value = true
  try {
    const res = await fetch('/api/progress/month?year=' + year.value + '&month=' + month.value)
    if (res.ok) {
      const list = (await res.json()) as DayCount[]
      const map = new Map<string, number>()
      for (const d of list) map.set(d.date, d.total)
      counts.value = map
    }
  } catch {
    // 静默
  } finally {
    loadingMonth.value = false
  }
}

async function loadDay(date: string) {
  selectedDate.value = date
  loadingDay.value = true
  dayError.value = ''
  dayWords.value = []
  try {
    const res = await fetch('/api/progress/day?date=' + date)
    if (res.ok) {
      dayWords.value = await res.json()
    } else {
      dayError.value = 'HTTP ' + res.status
    }
  } catch (e) {
    dayError.value = (e as Error).message
  } finally {
    loadingDay.value = false
  }
}

function prevMonth() {
  if (month.value === 1) {
    year.value -= 1
    month.value = 12
  } else {
    month.value -= 1
  }
}

function nextMonth() {
  const n = new Date()
  if (year.value === n.getFullYear() && month.value === n.getMonth() + 1) return
  if (month.value === 12) {
    year.value += 1
    month.value = 1
  } else {
    month.value += 1
  }
}

function isCurrentMonth(): boolean {
  const n = new Date()
  return year.value === n.getFullYear() && month.value === n.getMonth() + 1
}

function onCellClick(cell: { date: string | null }) {
  if (!cell.date) return
  if (isFuture(cell.date)) return
  loadDay(cell.date)
}

watch([year, month], () => {
  selectedDate.value = null
  dayWords.value = []
  loadMonth()
})

onMounted(loadMonth)
</script>

<template>
  <div class="calendar">
    <div class="header">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <div class="title">{{ monthLabel }}</div>
      <button class="nav-btn" :disabled="isCurrentMonth()" @click="nextMonth">›</button>
    </div>

    <div class="weekday-row">
      <span v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</span>
    </div>

    <div class="grid">
      <template v-for="(week, wi) in weeks" :key="wi">
        <div
          v-for="(cell, ci) in week"
          :key="ci"
          class="cell"
          :class="[
            cell.date ? levelClass(cell.total) : 'empty',
            { today: isToday(cell.date), selected: cell.date === selectedDate },
          ]"
          @click="onCellClick(cell)"
        >
          <template v-if="cell.day">
            <span class="day">{{ cell.day }}</span>
            <span v-if="cell.total > 0" class="count">{{ cell.total }}</span>
          </template>
        </div>
      </template>
    </div>

    <p v-if="loadingMonth" class="hint">加载中…</p>

    <div v-if="selectedDate" class="day-panel">
      <div class="day-header">
        <span class="day-title">{{ selectedDate }}</span>
        <button class="close" @click="selectedDate = null">×</button>
      </div>
      <p v-if="loadingDay" class="hint">加载中…</p>
      <p v-else-if="dayError" class="error">{{ dayError }}</p>
      <p v-else-if="dayWords.length === 0" class="hint">这天没有记录</p>
      <ul v-else class="word-list">
        <li v-for="w in dayWords" :key="w.wordId" class="word-item">
          <span class="w-text">{{ w.text }}</span>
          <span v-if="w.phonetic" class="w-ph">/{{ w.phonetic }}/</span>
          <span class="w-meaning">{{ w.firstMeaning }}</span>
          <span class="w-state" :class="w.state">{{ w.state === 'known' ? '认识' : '不认识' }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.nav-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 6px;
}

.weekday-row span {
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: transform 0.1s;
  background: #f9fafb;
}

.cell.empty {
  background: transparent;
  cursor: default;
}

.cell:not(.empty):hover {
  transform: scale(1.05);
}

.cell.l1 { background: #dbeafe; color: #1e40af; }
.cell.l2 { background: #93c5fd; color: #1e3a8a; }
.cell.l3 { background: #3b82f6; color: #fff; }
.cell.l4 { background: #1d4ed8; color: #fff; }

.cell.today {
  outline: 2px solid #f59e0b;
  outline-offset: -2px;
}

.cell.selected {
  outline: 2px solid #111827;
  outline-offset: -2px;
}

.cell .day {
  font-weight: 600;
  font-size: 13px;
  line-height: 1;
}

.cell .count {
  font-size: 9px;
  opacity: 0.85;
  margin-top: 2px;
}

.hint {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  margin: 10px 0 0;
}

.error {
  text-align: center;
  color: #991b1b;
  font-size: 13px;
  margin: 10px 0 0;
}

.day-panel {
  margin-top: 14px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.close {
  border: 0;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.word-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.word-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 13px;
  flex-wrap: wrap;
}

.w-text { font-weight: 600; color: #111827; }
.w-ph { color: #9ca3af; font-size: 11px; }
.w-meaning { flex: 1; color: #4b5563; min-width: 100px; }

.w-state {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
}

.w-state.known { background: #dcfce7; color: #166534; }
.w-state.unknown { background: #fee2e2; color: #991b1b; }

@media (max-width: 480px) {
  .cell { font-size: 11px; }
  .cell .day { font-size: 12px; }
  .cell .count { font-size: 8px; }
}
</style>
