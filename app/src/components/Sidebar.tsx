import type React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReaderStore, type BgThemeId, type ReadingPlanId, type MusicTrackId } from '../store/useReaderStore'

const DRAWER_BG: Partial<Record<BgThemeId, string>> = {
  parchment: '#f5e6c8',
  forest:    '#1a2e1a',
  night:     '#13112b',
}

export interface BgTheme {
  id: BgThemeId
  label: string
  swatchBg: string
  labelColor: string
  pageStyle: React.CSSProperties
  isDark: boolean
  headerBg: string
  heading: string
  subheading: string
  body: string
  border: string
  navBtn: string
}

export const BG_THEMES: BgTheme[] = [
  {
    id: 'default',
    label: 'Padrão',
    swatchBg: '',
    labelColor: '',
    pageStyle: {},
    isDark: false,
    headerBg:   'bg-white/90 dark:bg-stone-900/90 backdrop-blur border-stone-200 dark:border-stone-700',
    heading:    'text-stone-800 dark:text-stone-100',
    subheading: 'text-stone-400 dark:text-stone-500',
    body:       '',
    border:     'border-stone-200 dark:border-stone-700',
    navBtn:     'text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400',
  },
  {
    id: 'parchment',
    label: 'Pergaminho',
    swatchBg: 'linear-gradient(135deg,#f5e6c8 0%,#e8d5a3 100%)',
    labelColor: '#92400e',
    pageStyle: { background: 'linear-gradient(160deg,#f9f0d8 0%,#eedcaa 100%)' },
    isDark: false,
    headerBg:   'bg-amber-50/90 backdrop-blur border-amber-300/60',
    heading:    'text-black',
    subheading: 'text-black/70',
    body:       'text-black',
    border:     'border-amber-300/60',
    navBtn:     'text-black/70 hover:text-black',
  },
  {
    id: 'forest',
    label: 'Floresta',
    swatchBg: 'linear-gradient(135deg,#1a2e1a 0%,#2d4a2d 100%)',
    labelColor: '#bbf7d0',
    pageStyle: { background: 'linear-gradient(160deg,#162216 0%,#1f3a1f 60%,#2d4a2d 100%)' },
    isDark: true,
    headerBg:   'bg-black/30 backdrop-blur border-green-900/50',
    heading:    'text-white',
    subheading: 'text-white/60',
    body:       'text-white',
    border:     'border-green-800/50',
    navBtn:     'text-white/70 hover:text-white',
  },
  {
    id: 'night',
    label: 'Noite',
    swatchBg: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
    labelColor: '#e0e7ff',
    pageStyle: { background: 'linear-gradient(160deg,#0f0c29 0%,#302b63 55%,#1a1830 100%)' },
    isDark: true,
    headerBg:   'bg-black/30 backdrop-blur border-indigo-900/50',
    heading:    'text-indigo-100',
    subheading: 'text-indigo-300/70',
    body:       'text-indigo-50',
    border:     'border-indigo-700/40',
    navBtn:     'text-indigo-300/80 hover:text-indigo-200',
  },
]

export const MUSIC_TRACKS: { id: MusicTrackId | null; label: string; description: string; icon: string }[] = [
  { id: null,     label: 'Silêncio', description: 'Sem música de fundo', icon: '○' },
  { id: 'fundo1', label: 'Fundo 1',  description: 'Melodia suave',       icon: '♪' },
  { id: 'fundo2', label: 'Fundo 2',  description: 'Melodia suave',       icon: '♪' },
  { id: 'fundo3', label: 'Fundo 3',  description: 'Melodia suave',       icon: '♪' },
  { id: 'fundo4', label: 'Fundo 4',  description: 'Melodia suave',       icon: '♪' },
]

export const READING_PLANS: { id: ReadingPlanId; label: string; description: string }[] = [
  { id: 'free',          label: 'Livre',            description: 'Leitura sem plano' },
  { id: 'gospels',       label: 'Evangelhos',       description: 'Mt, Mc, Lc e Jo' },
  { id: 'psalms',        label: 'Salmos',           description: '150 salmos' },
  { id: 'new-testament', label: 'Novo Testamento',  description: '260 capítulos' },
  { id: 'full-bible',    label: 'Bíblia Completa',  description: '1.189 capítulos' },
]

const PLAN_START: Record<ReadingPlanId, { book: string; chapter: number }> = {
  'free':          { book: 'GEN', chapter: 1 },
  'gospels':       { book: 'MAT', chapter: 1 },
  'psalms':        { book: 'PSA', chapter: 1 },
  'new-testament': { book: 'MAT', chapter: 1 },
  'full-bible':    { book: 'GEN', chapter: 1 },
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { bgTheme, setBgTheme, readingPlan, setReadingPlan, musicTrack, setMusicTrack, musicVolume, setMusicVolume } = useReaderStore()
  const navigate = useNavigate()
  const { version = 'ARC' } = useParams()
  const active = BG_THEMES.find(t => t.id === bgTheme)!
  const isDark = active.isDark
  const isParchment = bgTheme === 'parchment'

  function selectedClass() {
    if (isDark) return 'bg-amber-500/20 text-amber-300'
    if (isParchment) return 'bg-amber-800/30 text-black font-semibold'
    return 'bg-stone-300 text-black'
  }

  function unselectedClass() {
    if (isDark) return 'text-white/70 hover:bg-white/10'
    if (isParchment) return 'text-black hover:bg-amber-800/10'
    return 'hover:bg-stone-100 dark:hover:bg-stone-800 text-black dark:text-stone-300'
  }

  function labelClass() {
    if (isDark) return 'text-white/40'
    if (isParchment) return 'text-black/60'
    return 'text-stone-400 dark:text-stone-500'
  }


  function sliderAccent() {
    if (isDark) return '#f59e0b'
    if (isParchment) return '#92400e'
    return '#6b7280'
  }

  const drawerBgStyle: React.CSSProperties | undefined =
    DRAWER_BG[bgTheme] ? { backgroundColor: DRAWER_BG[bgTheme] } : undefined

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

    <aside
      style={drawerBgStyle}
      className={`
        fixed top-0 right-0 h-full z-50
        md:relative md:top-auto md:right-auto md:h-auto md:z-auto
        w-[280px] md:w-96
        flex-shrink-0 border-l flex flex-col gap-5 overflow-y-auto
        transition-transform duration-300 md:transition-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        ${isDark
          ? 'border-white/10 bg-stone-950 md:bg-black/10'
          : `border-stone-200 dark:border-stone-700 ${!drawerBgStyle ? 'bg-white dark:bg-stone-900 md:bg-transparent' : ''}`
        }
      `}
    >
      {/* Cabeçalho do drawer (mobile) */}
      <div className={`flex items-center justify-between px-4 pt-5 pb-0 md:hidden`}>
        <span className={`text-sm font-semibold ${isDark ? 'text-white/80' : 'text-stone-700'}`}>Configurações</span>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4 md:py-6 flex flex-col gap-5 flex-1 overflow-y-auto">

      {/* Linha 1: Tema de fundo — largura total */}
      <section>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${labelClass()}`}>
          Tema de fundo
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {BG_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setBgTheme(t.id)}
              title={t.label}
              style={{ backgroundImage: t.swatchBg || undefined }}
              className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                t.id === 'default' ? 'bg-white dark:bg-stone-900' : ''
              } ${
                bgTheme === t.id
                  ? 'border-amber-500 shadow-sm shadow-amber-500/40'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
              }`}
            >
              <span
                style={{ color: t.labelColor || undefined }}
                className={`absolute bottom-1 left-0 right-0 text-center text-[10px] font-medium leading-none px-1 ${
                  !t.labelColor ? 'text-stone-500 dark:text-stone-400' : ''
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className={`border-t ${isDark ? 'border-white/10' : 'border-stone-200 dark:border-stone-700'}`} />

      {/* Linha 2: Música de fundo | Plano de leitura */}
      <div className="grid grid-cols-2 gap-4">

        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${labelClass()}`}>
            Música de fundo
          </h2>
          <div className="flex flex-col gap-1.5">
            {MUSIC_TRACKS.map((track) => (
              <button
                key={track.id ?? 'silence'}
                onClick={() => setMusicTrack(track.id as MusicTrackId | null)}
                className={`text-left px-2 py-1.5 rounded-lg transition-colors ${
                  musicTrack === track.id ? selectedClass() : unselectedClass()
                }`}
              >
                <p className="text-sm font-semibold leading-tight flex items-center gap-1">
                  <span className="opacity-70">{track.icon}</span>
                  {track.label}
                </p>
                <p className={`text-xs leading-tight mt-0.5 ${labelClass()}`}>{track.description}</p>
              </button>
            ))}
          </div>
          {musicTrack && (
            <div className="mt-3 px-1">
              <div className={`flex items-center justify-between mb-1 ${labelClass()}`}>
                <span className="text-xs">Volume</span>
                <span className="text-xs tabular-nums">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: sliderAccent() }}
              />
            </div>
          )}
        </section>

        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${labelClass()}`}>
            Plano de leitura
          </h2>
          <div className="flex flex-col gap-1.5">
            {READING_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setReadingPlan(plan.id)
                  const { book, chapter } = PLAN_START[plan.id]
                  navigate(`/ler/${version}/${book}/${chapter}`)
                }}
                className={`text-left px-2 py-1.5 rounded-lg transition-colors ${
                  readingPlan === plan.id ? selectedClass() : unselectedClass()
                }`}
              >
                <p className="text-sm font-semibold leading-tight">{plan.label}</p>
                <p className={`text-xs leading-tight mt-0.5 ${labelClass()}`}>{plan.description}</p>
              </button>
            ))}
          </div>
        </section>

      </div>

      </div>{/* fim inner scroll */}
    </aside>
    </>
  )
}