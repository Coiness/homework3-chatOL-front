import { memo, useRef, useEffect, useCallback } from 'react'
import type { FC, ReactNode } from 'react'
import type { message as MessageType } from '@/type'
import { Button } from '@/components/ui/button'
import { Download, FileIcon } from 'lucide-react'
import { jsBridge } from '@/lib/jsBridge'

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
        // 图片在对话框外面显示
        return null
      case 'file':
        // 文件在对话框外面显示
        return null
      default:
        return <p>{msg.content}</p>
    }
  }

  // 渲染附件（图片或文件）
  const renderAttachment = (msg: MessageType) => {
    const isOwn = msg.uid === currentUserId

    switch (msg.type) {
      case 'image':
        return (
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mt-1`}>
            <img
              src={msg.content}
              alt="图片"
              className="max-w-48 max-h-48 rounded cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(msg.content)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFileDownload(msg.content, 'image')}
              className="mt-2 h-8 px-3 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              下载
            </Button>
          </div>
        )
      case 'file':
        return (
          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-1`}>
            <Button
              variant="outline"
              onClick={() => handleFileDownload(msg.content, 'file')}
              className="flex items-center gap-2 h-10 px-4"
            >
              <FileIcon className="h-4 w-4" />
              <span>下载文件</span>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  // 处理图片点击（在新标签页打开）
  const handleImageClick = useCallback((base64Data: string) => {
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>图片查看</title></head>
          <body style="margin:0;padding:20px;text-align:center;background:#f5f5f5;">
            <img src="${base64Data}" style="max-width:100%;max-height:100vh;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }, [])

  // 处理文件下载
  const handleFileDownload = useCallback(
    async (base64Data: string, fileType: 'file' | 'image' = 'file') => {
      try {
        // 解析Base64数据
        const [mimeType, base64String] = base64Data.split(',')
        const mime = mimeType.split(':')[1].split(';')[0] // 提取mime类型，如 "application/pdf"

        const byteCharacters = atob(base64String)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mime })

        // 根据mime类型生成文件扩展名
        const getFileExtension = (mimeType: string) => {
          const mimeToExt: { [key: string]: string } = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'application/zip': 'zip',
            'application/x-rar-compressed': 'rar',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
          }
          return mimeToExt[mimeType] || 'file'
        }

        const extension = getFileExtension(mime)
        const timestamp = Date.now()
        const fileName =
          fileType === 'image'
            ? `image_${timestamp}.${extension}`
            : `file_${timestamp}.${extension}`

        // 检查是否在Android WebView中
        const isAndroidWebView = navigator.userAgent.includes('Android') && window.AndroidBridge

        if (isAndroidWebView) {
          // 在Android WebView中，使用JSBridge下载
          console.log('Android WebView detected, using JSBridge download')

          try {
            await jsBridge.call('downloadFile', {
              base64Data: base64Data,
              fileName: fileName,
            })
            console.log('File download initiated via JSBridge')
            return
          } catch (e) {
            console.warn('JSBridge download failed, falling back to web methods:', e)
          }
        }

        // 在普通浏览器中或fallback
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL对象
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('文件下载失败:', error)
        alert('文件下载失败')
      }
    },
    []
  )

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
            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
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
              {renderAttachment(msg)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(ChatContent)
