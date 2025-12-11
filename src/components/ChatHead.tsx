import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { useChatStore } from '@/store/useChatStore'

interface IProps {
  onBack: () => void
  chatId: string
  children?: ReactNode
}

const ChatHead: FC<IProps> = (props: IProps) => {
  const { user } = useChatStore()

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
      {/* 左侧：返回按钮和聊天室信息 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => props.onBack()}
          className="md:hidden text-blue-500 hover:text-blue-700"
        >
          {'<'} 返回
        </button>
        <div>
          <h2 className="font-semibold text-lg">聊天室 {props.chatId}</h2>
        </div>
      </div>

      {/* 右侧：用户信息和退出按钮 */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="hidden md:inline">用户: </span>
          <span className="font-medium">{user?.uid}</span>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatHead)
