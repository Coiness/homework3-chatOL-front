import React, { memo } from 'react'
import type { FC, ReactNode } from 'react'
import ChatHead from '@/components/ChatHead'

interface IProps {
  chatId: string
  message: string[]
  onBack: () => void
  children?: ReactNode
}

const ChatRoom: FC<IProps> = (props: IProps) => {
  return (
    <div>
      <ChatHead onBack={props.onBack} chatId={props.chatId}></ChatHead>
    </div>
  )
}

export default memo(ChatRoom)
