import { useState, useCallback } from 'react'
import { useIsMobileStore } from '@/store/useIsMobileStore'
import { useChatStore } from '@/store/useChatStore'
import { jsBridge } from '@/lib/jsBridge'
import { Card } from '@/components/ui/card'
import ChatRoom from '@/components/ChatRoom'
import ChatList from '@/components/ChatList'

const EmptyState = () => (
  <div className="flex-1 h-full flex items-center justify-center text-gray-400">
    请选择一个会话开始聊天
  </div>
)

export const ChatLayout = () => {
  const isMobile = useIsMobileStore((state) => state.isMobile)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const { user, messages, addMessage, sendMessage, logout } = useChatStore()

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
  }

  const handleBack = () => {
    setActiveChatId(null)
  }

  const handleSend = useCallback(
    (content: string, type: 'text' | 'image' | 'file' = 'text') => {
      if (!user || !activeChatId) return

      const newMessage = {
        mid: Date.now().toString(),
        createdat: Date.now(),
        uid: user.uid,
        chatid: activeChatId,
        content,
        type,
      }
      addMessage(newMessage) // 本地立即显示
      sendMessage(newMessage) // 发送到服务器
    },
    [user, activeChatId, addMessage, sendMessage]
  )

  const filteredMessages = messages.filter((msg) => msg.chatid === activeChatId)

  if (isMobile) {
    if (activeChatId) {
      return (
        <div className="h-screen ">
          <ChatRoom
            chatId={activeChatId}
            message={filteredMessages}
            currentUID={user?.uid || ''}
            onBack={handleBack}
            onSend={handleSend}
          />
        </div>
      )
    }
    return (
      <div className="flex flex-col h-screen w-full min-h-0">
        <Card className="rounded-none border-x-0 border-t-0 flex-shrink-0 min-h-0">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-lg font-semibold">Chat App</h1>
            <button
              onClick={() => {
                console.log('logout button clicked')
                logout()
                localStorage.removeItem('chat_user_token')
                if (jsBridge.isAvailable()) {
                  jsBridge.setUserToken('')
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              退出登录
            </button>
          </div>
        </Card>
        <div className="flex-1 ">
          <ChatList onSelect={handleSelectChat} activeChatId={activeChatId} />
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex h-screen w-full  px-8">
        <div className="flex flex-col w-full h-screen min-h-0">
          <Card className="rounded-none border-x-0 border-t-0 min-h-0">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-lg font-semibold">Chat App</h1>
              <button
                onClick={() => {
                  console.log('logout button clicked')
                  logout()
                  localStorage.removeItem('chat_user_token')
                  if (jsBridge.isAvailable()) {
                    jsBridge.setUserToken('')
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                退出登录
              </button>
            </div>
          </Card>
          <div className="flex flex-1 min-h-0">
            <div className="w-80 flex-shrink-0 min-h-0 overflow-auto">
              <ChatList onSelect={handleSelectChat} activeChatId={activeChatId}></ChatList>
            </div>
            {activeChatId ? (
              <div className="flex-1 min-h-0">
                <ChatRoom
                  chatId={activeChatId}
                  message={filteredMessages}
                  currentUID={user?.uid || ''}
                  onBack={handleBack}
                  onSend={handleSend}
                ></ChatRoom>
              </div>
            ) : (
              <div className="flex-1">
                <EmptyState></EmptyState>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
