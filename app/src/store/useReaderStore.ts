import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

export const MIN_FONT_SIZE = 12
export const MAX_FONT_SIZE = 40
const FONT_STEP = 2

export type BgThemeId = 'default' | 'parchment' | 'forest' | 'night'
export type ReadingPlanId = 'free' | 'gospels' | 'psalms' | 'new-testament' | 'full-bible'
export type MusicTrackId = 'fundo1' | 'fundo2' | 'fundo3' | 'fundo4'

interface ReaderStore {
  theme: Theme
  isCompareMode: boolean
  compareVersions: string[]
  fontSize: number
  bgTheme: BgThemeId
  readingPlan: ReadingPlanId
  musicTrack: MusicTrackId | null
  musicVolume: number
  toggleTheme: () => void
  toggleCompareMode: () => void
  setCompareVersions: (versions: string[]) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  setBgTheme: (id: BgThemeId) => void
  setReadingPlan: (id: ReadingPlanId) => void
  setMusicTrack: (id: MusicTrackId | null) => void
  setMusicVolume: (v: number) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const SCROLLBAR_VARS: Record<BgThemeId, { track: string; thumb: string }> = {
  default:   { track: '#f5f5f4', thumb: '#d6d3d1' },
  parchment: { track: '#f5e6c8', thumb: '#c8a870' },
  forest:    { track: '#162216', thumb: '#2d5a2d' },
  night:     { track: '#0f0c29', thumb: '#4c4880' },
}

function applyBgTheme(id: BgThemeId) {
  const root = document.documentElement
  const vars = SCROLLBAR_VARS[id]
  root.style.setProperty('--scrollbar-track', vars.track)
  root.style.setProperty('--scrollbar-thumb', vars.thumb)
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set) => ({
      theme: 'light',
      isCompareMode: false,
      compareVersions: [],
      fontSize: 18,
      bgTheme: 'default',
      readingPlan: 'free',
      musicTrack: null,
      musicVolume: 0.3,

      setMusicTrack: (id) => set({ musicTrack: id }),
      setMusicVolume: (v) => set({ musicVolume: v }),

      toggleTheme: () =>
        set((state) => {
          const next: Theme = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        }),

      toggleCompareMode: () =>
        set((state) => ({ isCompareMode: !state.isCompareMode })),

      setCompareVersions: (versions) =>
        set({ compareVersions: versions }),

      increaseFontSize: () =>
        set((state) => ({ fontSize: Math.min(state.fontSize + FONT_STEP, MAX_FONT_SIZE) })),

      decreaseFontSize: () =>
        set((state) => ({ fontSize: Math.max(state.fontSize - FONT_STEP, MIN_FONT_SIZE) })),

      setBgTheme: (id) => { applyBgTheme(id); set({ bgTheme: id }) },

      setReadingPlan: (id) => set({ readingPlan: id }),
    }),
    {
      name: 'biblia-reader-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          applyBgTheme(state.bgTheme)
        }
      },
    }
  )
)