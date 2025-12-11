import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import type { message } from '@/type'
import ChatHead from '@/components/ChatHead'
import ChatInput from './ChatInput'
import ChatContent from './ChatContent'

interface IProps {
  chatId: string
  message: message[]
  currentUID: string
  onBack: () => void
  onSend: (content: string, type?: 'text' | 'image' | 'file') => void
  children?: ReactNode
}

const ChatRoom: FC<IProps> = (props: IProps) => {
  return (
    <div className="flex flex-col h-full">
      <ChatHead onBack={props.onBack} chatId={props.chatId}></ChatHead>
      <ChatContent message={props.message} currentUserId={props.currentUID}></ChatContent>
      <ChatInput onSend={props.onSend}></ChatInput>
    </div>
  )
}

export default memo(ChatRoom)
