import React, { memo } from 'react'
import type { FC, ReactNode } from 'react'

interface IProps {
  onBack: () => void
  chatId: string
  children?: ReactNode
}
const ChatHead: FC<IProps> = (props: IProps) => {
  return (
    <div>
      <p onClick={() => props.onBack()} className="md:hidden">
        {'<'}返回
      </p>
      <p>用户{props.chatId}</p>
    </div>
  )
}

export default memo(ChatHead)
