import { memo } from 'react'
import type { FC } from 'react'

interface IProps {
  onSelect: (chatId: string) => void
  activeChatId: string | null
}

const ChatList: FC<IProps> = ({ onSelect, activeChatId }) => {
  const rooms = [
    { id: 'room1', name: '聊天室 1' },
    { id: 'room2', name: '聊天室 2' },
    { id: 'room3', name: '聊天室 3' },
  ]

  return (
    <div className="w-full md:w-64 border-r h-full bg-gray-100 p-4">
      <h2 className="font-bold mb-4">聊天室列表</h2>
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelect(room.id)}
          className={`w-full p-3 mb-2 rounded cursor-pointer transition-colors ${
            activeChatId === room.id ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'
          }`}
        >
          {room.name}
        </div>
      ))}
    </div>
  )
}

export default memo(ChatList)
