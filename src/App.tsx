import { useEffect } from 'react'
import { useIsMobileStore } from './store/useIsMobileStore'
import { useChatStore } from './store/useChatStore'
import { ChatLayout } from '@/components/ChatLayout'
import Auth from '@/components/Auth'

function App() {
  const setIsMobile = useIsMobileStore((state) => state.setIsMobile)
  const user = useChatStore((state) => state.user)

  console.log('App render, user:', user)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobile])

  if (!user) {
    return <Auth />
  }

  return (
    <div className="flex h-screen  flex-col items-center justify-center gap-6 bg-background">
      <ChatLayout></ChatLayout>
    </div>
  )
}

export default App
