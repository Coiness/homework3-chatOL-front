import { create } from 'zustand'
import type { message, user } from '@/type'

interface ChatState {
  user: user | null
  isConneted: boolean
  messages: message[]
  setUser: (user: user) => void
  setConnected: (connected: boolean) => void
  addMessage: (msg: message) => void
  logout: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  user: null,
  isConneted: false,
  messages: [],
  setUser: (user) => set({ user: user }),
  setConnected: (connected) => set({ isConneted: connected }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  logout: () => set({ user: null, isConneted: false, messages: [] }),
}))
