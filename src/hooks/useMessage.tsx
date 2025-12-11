import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/useChatStore'
import type { message } from '@/type'

export const useMessage = (url: string) => {
  const ws = useRef<WebSocket | null>(null)
  const { user, setConnected, addMessage } = useChatStore()

  useEffect(() => {
    if (!user) return

    ws.current = new WebSocket(`${url}?token=${user.token}`) //带token连接
    ws.current.onopen = () => setConnected(true)
    ws.current.onmessage = (event) => {
      const msg: message = JSON.parse(event.data)
      addMessage(msg)
    }
    ws.current.onclose = () => setConnected(false)
    ws.current.onerror = () => alert('连接失败')

    return () => ws.current?.close()
  }, [user, url, setConnected, addMessage])

  const sendMessage = (msg: message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
    }
  }

  return { sendMessage }
}
