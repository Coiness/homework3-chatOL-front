import { create } from 'zustand'
interface IsMobileState {
  isMobile: boolean
  setIsMobile: (isMobile: boolean) => void
}

export const useIsMobileStore = create<IsMobileState>((set) => ({
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,

  setIsMobile: (isMobile: boolean) => set({ isMobile }),
}))
