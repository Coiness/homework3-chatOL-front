import { useState } from 'react'
import { useIsMobileStore } from '@/store/useIsMobileStore'

// 临时占位组件
const ChatList = ({ onSelect }: { onSelect: (id: string) => void }) => (
  <div className="w-full md:w-64 border-r h-full bg-gray-100 p-4">
    <h2 className="font-bold mb-4">消息列表</h2>
    {['1', '2', '3'].map((id) => (
      <div
        key={id}
        onClick={() => onSelect(id)}
        className="p-3 bg-white mb-2 rounded cursor-pointer hover:bg-blue-50"
      >
        用户 {id}
      </div>
    ))}
  </div>
)

const ChatRoom = ({ chatId, onBack }: { chatId: string | null; onBack: () => void }) => (
  <div className="flex-1 h-full bg-white flex flex-col">
    <div className="h-12 border-b flex items-center px-4">
      {/* 仅在移动端显示返回按钮 */}
      <button onClick={onBack} className="mr-4 md:hidden text-blue-500">
        &lt; 返回
      </button>
      <span className="font-bold">正在与 用户 {chatId} 聊天</span>
    </div>
    <div className="flex-1 p-4">聊天内容区域...</div>
  </div>
)

const EmptyState = () => (
  <div className="flex-1 h-full flex items-center justify-center text-gray-400">
    请选择一个会话开始聊天
  </div>
)

export const ChatLayout = () => {
  const isMobile = useIsMobileStore((state) => state.isMobile)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
  }

  const handleBack = () => {
    setActiveChatId(null)
  }

  if (isMobile) {
    if (activeChatId) {
      return <ChatRoom chatId={activeChatId} onBack={handleBack} />
    }
    return <ChatList onSelect={handleSelectChat} />
  } else {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <ChatList onSelect={handleSelectChat}></ChatList>
        {activeChatId ? (
          <ChatRoom chatId={activeChatId} onBack={handleBack}></ChatRoom>
        ) : (
          <EmptyState></EmptyState>
        )}
      </div>
    )
  }
}
