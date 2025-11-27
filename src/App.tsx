import { useEffect } from 'react'
import { useIsMobileStore } from './store/useIsMobileStore'
import { ChatLayout } from '@/components/ChatLayout'

function App() {
  const setIsMobile = useIsMobileStore((state) => state.setIsMobile)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobile])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <ChatLayout></ChatLayout>
    </div>
  )
}

export default App
