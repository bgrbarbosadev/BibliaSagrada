import type React from 'react'
import { useReaderStore, type BgThemeId, type ReadingPlanId, type MusicTrackId } from '../store/useReaderStore'

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
    heading:    'text-amber-900',
    subheading: 'text-amber-700/70',
    body:       'text-amber-950',
    border:     'border-amber-300/60',
    navBtn:     'text-amber-800/70 hover:text-amber-700',
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

export default function Sidebar() {
  const { bgTheme, setBgTheme, readingPlan, setReadingPlan, musicTrack, setMusicTrack, musicVolume, setMusicVolume } = useReaderStore()
  const active = BG_THEMES.find(t => t.id === bgTheme)!
  const isDark = active.isDark

  return (
    <aside className={`w-52 flex-shrink-0 border-l px-4 py-6 flex flex-col gap-6 transition-colors duration-500 ${
      isDark
        ? 'border-white/10 bg-black/10'
        : 'border-stone-200 dark:border-stone-700'
    }`}>

      <section>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
        }`}>
          Tema de fundo
        </h2>
        <div className="grid grid-cols-2 gap-2">
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

      <section>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
        }`}>
          Plano de leitura
        </h2>
        <div className="flex flex-col gap-1.5">
          {READING_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setReadingPlan(plan.id)}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                readingPlan === plan.id
                  ? 'bg-amber-500/20 text-amber-300'
                  : isDark
                    ? 'text-white/70 hover:bg-white/10'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <p className="text-xs font-semibold leading-tight">{plan.label}</p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
              }`}>{plan.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className={`border-t ${isDark ? 'border-white/10' : 'border-stone-200 dark:border-stone-700'}`} />

      <section>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
        }`}>
          Música de fundo
        </h2>
        <div className="flex flex-col gap-1.5">
          {MUSIC_TRACKS.map((track) => (
            <button
              key={track.id ?? 'silence'}
              onClick={() => setMusicTrack(track.id as MusicTrackId | null)}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                musicTrack === track.id
                  ? 'bg-amber-500/20 text-amber-300'
                  : isDark
                    ? 'text-white/70 hover:bg-white/10'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <p className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                <span className="opacity-70">{track.icon}</span>
                {track.label}
              </p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
              }`}>{track.description}</p>
            </button>
          ))}
        </div>

        {musicTrack && (
          <div className="mt-3 px-1">
            <div className={`flex items-center justify-between mb-1 ${
              isDark ? 'text-white/40' : 'text-stone-400 dark:text-stone-500'
            }`}>
              <span className="text-[10px]">Volume</span>
              <span className="text-[10px] tabular-nums">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer accent-amber-500"
              style={{ accentColor: '#f59e0b' }}
            />
          </div>
        )}
      </section>

    </aside>
  )
}