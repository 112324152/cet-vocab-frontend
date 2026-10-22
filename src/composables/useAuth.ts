import { ref } from 'vue'

export interface AuthUser {
  id: number
  username: string
  displayName: string
  guest: boolean
}

const user = ref<AuthUser | null>(null)
const state = ref<'loading' | 'need-login' | 'ready'>('loading')

async function check() {
  try {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      user.value = await res.json()
      state.value = 'ready'
    } else {
      user.value = null
      state.value = 'need-login'
    }
  } catch {
    user.value = null
    state.value = 'need-login'
  }
}

async function login(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    return res.status === 401 ? '用户名或密码错误' : `登录失败：HTTP ${res.status}`
  }
  user.value = await res.json()
  state.value = 'ready'
  return ''
}

async function register(
  username: string,
  password: string,
  displayName: string,
): Promise<string> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, displayName }),
  })
  if (!res.ok) {
    if (res.status === 409) return '用户名已存在'
    if (res.status === 400) return '用户名 3-32 位字母数字下划线，密码至少 6 位'
    return `注册失败：HTTP ${res.status}`
  }
  user.value = await res.json()
  state.value = 'ready'
  return ''
}

async function loginAsGuest(): Promise<string> {
  const res = await fetch('/api/auth/guest', { method: 'POST' })
  if (!res.ok) return `游客登录失败：HTTP ${res.status}`
  user.value = await res.json()
  state.value = 'ready'
  return ''
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // 忽略网络错误，本地也清掉
  }
  user.value = null
  state.value = 'need-login'
}

export function useAuth() {
  return { user, state, check, login, register, loginAsGuest, logout }
}