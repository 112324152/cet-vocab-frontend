<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { login, register, loginAsGuest } = useAuth()

type Mode = 'login' | 'register'

const mode = ref<Mode>('login')
const username = ref('')
const password = ref('')
const displayName = ref('')
const errorMsg = ref('')
const busy = ref(false)

function switchMode(m: Mode) {
  mode.value = m
  errorMsg.value = ''
}

async function submit() {
  if (busy.value) return
  errorMsg.value = ''
  busy.value = true
  try {
    const err =
      mode.value === 'login'
        ? await login(username.value.trim(), password.value)
        : await register(username.value.trim(), password.value, displayName.value.trim())
    if (err) errorMsg.value = err
  } finally {
    busy.value = false
  }
}

async function guest() {
  if (busy.value) return
  errorMsg.value = ''
  busy.value = true
  try {
    const err = await loginAsGuest()
    if (err) errorMsg.value = err
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <h1>四六级背单词</h1>
      <p class="sub">
        {{ mode === 'login' ? '登录以同步你的学习记录' : '创建一个新账号' }}
      </p>

      <div class="tabs">
        <button
          class="tab"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >登录</button>
        <button
          class="tab"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >注册</button>
      </div>

      <form class="form" @submit.prevent="submit">
        <label>
          <span>用户名</span>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="3-32 位字母、数字或下划线"
            required
          />
        </label>

        <label v-if="mode === 'register'">
          <span>昵称（可选）</span>
          <input
            v-model="displayName"
            type="text"
            placeholder="显示在界面上的名字"
          />
        </label>

        <label>
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            placeholder="至少 6 位"
            required
          />
        </label>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button class="primary" type="submit" :disabled="busy">
          {{
            busy
              ? '处理中…'
              : mode === 'login'
                ? '登录'
                : '注册并登录'
          }}
        </button>
      </form>

      <div class="divider"><span>或</span></div>

      <button class="guest" :disabled="busy" @click="guest">
        以游客身份体验
      </button>
      <p class="tip">游客数据独立保存，注册后不会自动合并。</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(160deg, #eff6ff 0%, #ffffff 60%);
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 8px 40px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #111827;
  text-align: center;
}

.sub {
  margin: 0 0 20px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 18px;
}

.tab {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.tab.active {
  background: #fff;
  color: #111827;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label span {
  font-size: 13px;
  color: #374151;
}

input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

input:focus {
  border-color: #2563eb;
}

.error {
  color: #991b1b;
  font-size: 13px;
  margin: 0;
}

.primary {
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 4px;
}

.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  color: #9ca3af;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.guest {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  padding: 11px;
  font-size: 14px;
  cursor: pointer;
}

.guest:hover:not(:disabled) {
  background: #f9fafb;
}

.guest:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tip {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 480px) {
  .card {
    padding: 24px 20px;
    border-radius: 16px;
  }

  h1 {
    font-size: 20px;
  }
}
</style>