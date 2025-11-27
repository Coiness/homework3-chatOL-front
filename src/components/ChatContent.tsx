import React, { memo } from 'react'
import type { FC, ReactNode } from 'react'

interface IProps {
  children?: ReactNode
}

const ChatContent: FC<IProps> = () => {
  return <div>ChatContent</div>
}

export default memo(ChatContent)
