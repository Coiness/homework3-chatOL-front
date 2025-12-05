import { create } from 'zustand'
import type { message, user } from '@/type'

interface ChatState {
  user: user | null
  isConnected: boolean
  messages: message[]
  ws: WebSocket | null
  setUser: (user: user) => void
  setConnected: (connected: boolean) => void
  addMessage: (msg: message) => void
  sendMessage: (msg: message) => void
  logout: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  user: null,
  isConnected: false,
  messages: [],
  ws: null,
  setUser: (user) => {
    set({ user })
    // 当设置用户时，连接 WebSocket
    // 智能判断连接地址
    let wsUrl = 'ws://localhost:8080'

    const hostname = window.location.hostname
    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroid = userAgent.includes('android')

    // 策略 1: 如果 hostname 已经是 IP (如 10.0.2.2 或 192.168.x.x)，直接用它
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      wsUrl = `ws://${hostname}:8080`
    }
    // 策略 2: 如果是在 Android 设备上，且 hostname 是 localhost，
    // 这通常意味着没有做 adb reverse，我们尝试用 10.0.2.2
    else if (isAndroid) {
      console.log('[ChatStore] Android environment detected, using 10.0.2.2 for WebSocket')
      wsUrl = 'ws://10.0.2.2:8080'
    }

    console.log(`[ChatStore] Connecting to: ${wsUrl} (Host: ${hostname}, IsAndroid: ${isAndroid})`)

    const ws = new WebSocket(`${wsUrl}?token=${user.token}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      set({ isConnected: true, ws })
    }

    ws.onmessage = (event) => {
      try {
        const msg: message = JSON.parse(event.data)
        set((state) => ({ messages: [...state.messages, msg] }))
      } catch (error) {
        console.error('Failed to parse message', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      set({ isConnected: false, ws: null })
    }

    ws.onerror = (error) => {
      console.error('WebSocket error', error)
      set({ isConnected: false, ws: null })
    }
  },
  setConnected: (connected) => set({ isConnected: connected }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  sendMessage: (msg) => {
    const { ws, isConnected } = get()
    if (ws && isConnected) {
      ws.send(JSON.stringify(msg))
    } else {
      console.warn('WebSocket not connected')
    }
  },
  logout: () => {
    console.log('logout called, current user:', get().user)
    const { ws } = get()
    if (ws) {
      ws.close()
    }
    set({ user: null, isConnected: false, messages: [], ws: null })
    console.log('after logout, user should be null:', get().user)
  },
}))
