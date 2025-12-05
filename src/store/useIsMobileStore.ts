import { create } from 'zustand'
interface IsMobileState {
  isMobile: boolean
  isAndroidApp: boolean
  setIsMobile: (isMobile: boolean) => void
}

export const useIsMobileStore = create<IsMobileState>((set) => ({
  // 布局判断：基于宽度
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,

  // 环境判断：基于 JSBridge 对象是否存在
  // (window as any).AndroidInterface 是我们在安卓端注入的对象名
  isAndroidApp: typeof window !== 'undefined' && !!window.AndroidInterface,

  setIsMobile: (isMobile: boolean) => set({ isMobile }),
}))
