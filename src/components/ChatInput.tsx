import React, { memo, useState, useRef } from 'react'
import type { FC, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageIcon, Send, Smile } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

interface IProps {
  onSend: (message: string, type?: 'text' | 'image') => void
  children?: ReactNode
}

const ChatInput: FC<IProps> = ({ onSend }) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), 'text')
      setMessage('')
      setShowEmojiPicker(false)
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji)
  }

  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 检查文件大小 (限制为10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB')
        return
      }

      try {
        // 压缩图片: 最大宽度800px, 质量0.6
        const compressedBase64 = await compressImage(file, 800, 0.6)
        onSend(compressedBase64, 'image')
      } catch (error) {
        console.error('Failed to compress image:', error)
        alert('图片处理失败')
      }
    }
    // 重置input值，允许选择相同文件
    e.target.value = ''
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t flex-shrink-0 relative">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-lg">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" size="icon" onClick={handleImageSelect} className="h-12 w-12">
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className={`h-12 w-12 ${showEmojiPicker ? 'bg-gray-100' : ''}`}
      >
        <Smile className="h-5 w-5" />
      </Button>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="输入消息..."
        className="flex-1 h-12"
      />
      <Button onClick={handleSend} disabled={!message.trim()} className="h-12 px-6">
        <Send className="h-4 w-4 mr-2" />
        发送
      </Button>
    </div>
  )
}

export default memo(ChatInput)
