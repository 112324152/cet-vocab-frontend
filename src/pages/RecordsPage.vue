<script setup lang="ts">
import AnalyticsPanel from '../components/AnalyticsPanel.vue'
import MonthCalendar from '../components/MonthCalendar.vue'
</script>

<template>
  <div class="records">
    <section class="block">
      <div class="block-head">
        <h2>学习日历</h2>
      </div>
      <MonthCalendar />
    </section>

    <section class="block">
      <div class="block-head">
        <h2>数据统计</h2>
      </div>
      <div class="embed">
        <AnalyticsPanel />
      </div>
    </section>
  </div>
</template>

<style scoped>
.records {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.embed :deep(.overlay) {
  position: static;
  background: transparent;
  padding: 0;
  display: block;
  min-height: 0;
}

.embed :deep(.panel) {
  max-height: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.embed :deep(.close) {
  display: none;
}
</style>
