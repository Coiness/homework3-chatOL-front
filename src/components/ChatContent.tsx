import { memo, useRef, useEffect } from 'react'
import type { FC, ReactNode } from 'react'
import type { message as MessageType } from '@/type'

interface IProps {
  message: MessageType[]
  currentUserId: string
  children?: ReactNode
}

const ChatContent: FC<IProps> = ({ message, currentUserId }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 监听滚动事件，判断是否接近底部
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    // 如果距离底部小于 100px，则认为是在底部
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100
  }

  // 当消息更新时，如果之前在底部，则自动滚动到底部
  useEffect(() => {
    if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [message])

  const renderMessageContent = (msg: MessageType) => {
    switch (msg.type) {
      case 'text':
        return <p className="whitespace-pre-wrap">{msg.content}</p>
      case 'image':
        return <img src={msg.content} alt="图片" className="max-w-48 max-h-48 rounded" />
      case 'file':
        return (
          <a href={msg.content} className="text-blue-500 underline">
            下载文件
          </a>
        )
      default:
        return <p>{msg.content}</p>
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 p-4 space-y-4 overflow-y-scroll"
    >
      {message.map((msg) => {
        const isOwn = msg.uid === currentUserId
        return (
          <div key={msg.mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1 px-1">{msg.uid}</span>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                }`}
              >
                {renderMessageContent(msg)}
                <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(msg.createdat)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(ChatContent)
