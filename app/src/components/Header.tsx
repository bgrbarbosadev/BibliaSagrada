import BookSelector from './BookSelector'
import ChapterNav from './ChapterNav'
import VersionSelector from './VersionSelector'
import { useReaderStore } from '../store/useReaderStore'
import type { BookMeta } from '../types/bible'
import { version as appVersion } from '../../package.json'

const SELECT_BG: Record<string, string> = {
  default:   '',
  parchment: '#f9f0d8',
  forest:    '#1f3a1f',
  night:     '#1a1830',
}

interface Props {
  book: BookMeta
  chapter: number
  version: string
  isDark?: boolean
  headerBg?: string
  totalVerses: number
  freeReading: boolean
  verseFrom: number
  verseTo: number
  onFreeReadingChange: (v: boolean) => void
  onVerseFromChange: (v: number) => void
  onVerseToChange: (v: number) => void
  onSidebarOpen?: () => void
}

export default function Header({
  book, chapter, version,
  isDark = false,
  headerBg = 'bg-white/90 dark:bg-stone-900/90 backdrop-blur border-stone-200 dark:border-stone-700',
  totalVerses, freeReading, verseFrom, verseTo,
  onFreeReadingChange, onVerseFromChange, onVerseToChange,
  onSidebarOpen,
}: Props) {
  const bgTheme = useReaderStore(s => s.bgTheme)
  const selectBg = SELECT_BG[bgTheme] || ''

  const selectCls = isDark
    ? 'border-white/20 text-white/90'
    : 'border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-200'

  const labelCls = isDark ? 'text-white/60' : 'text-stone-500'
  const toggleCls = isDark
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-700'

  const optionStyle = selectBg ? { backgroundColor: selectBg } : undefined
  const selectStyle = selectBg ? { backgroundColor: selectBg } : undefined

  const verseControls = (
    <>
      <label className={`flex items-center gap-1.5 cursor-pointer select-none text-xs ${labelCls}`}>
        <input
          type="checkbox"
          checked={freeReading}
          onChange={e => onFreeReadingChange(e.target.checked)}
          className="accent-amber-500 w-3 h-3"
        />
        Livre
      </label>

      <span className={`text-xs ${freeReading ? 'opacity-30' : ''} ${labelCls}`}>v.</span>

      <select
        value={verseFrom}
        disabled={freeReading || totalVerses === 0}
        onChange={e => onVerseFromChange(Number(e.target.value))}
        style={selectStyle}
        className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-30 ${selectCls}`}
      >
        {Array.from({ length: totalVerses }, (_, i) => i + 1).map(v => (
          <option key={v} value={v} style={optionStyle}>{v}</option>
        ))}
      </select>

      <span className={`text-xs ${freeReading ? 'opacity-30' : ''} ${labelCls}`}>ao</span>

      <select
        value={verseTo}
        disabled={freeReading || totalVerses === 0}
        onChange={e => onVerseToChange(Number(e.target.value))}
        style={selectStyle}
        className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-30 ${selectCls}`}
      >
        {Array.from({ length: totalVerses }, (_, i) => i + 1).map(v => (
          <option key={v} value={v} style={optionStyle}>{v}</option>
        ))}
      </select>
    </>
  )

  return (
    <header className={`sticky top-0 z-40 border-b shadow-sm transition-colors duration-500 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">

        {/* Linha 1: Logo | Controles de nav | Botão sidebar (mobile) */}
        <div className="flex items-center gap-2">

          {/* Logo */}
          <div className="flex flex-col items-start leading-none flex-shrink-0">
            <span className="font-bold text-amber-500 text-lg tracking-tight">✝ Bíblia</span>
            <span className={`text-[10px] ${labelCls} opacity-50`}>version - {appVersion}</span>
          </div>

          {/* Controles centrais */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-center flex-wrap min-w-0">
            <BookSelector currentBook={book} currentVersion={version} currentChapter={chapter} isDark={isDark} />
            <ChapterNav book={book} chapter={chapter} version={version} isDark={isDark} />

            {/* Seleção de versículos — visível apenas em sm+ (inline) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className={`text-xs ${labelCls} opacity-40`}>|</span>
              {verseControls}
              <span className={`text-xs ${labelCls} opacity-40`}>|</span>
            </div>

            <VersionSelector currentVersion={version} bookId={book.id} isDark={isDark} />
          </div>

          {/* Botão abrir sidebar — apenas mobile */}
          {onSidebarOpen && (
            <button
              onClick={onSidebarOpen}
              title="Configurações"
              className={`md:hidden flex-shrink-0 p-1.5 rounded-lg transition-colors ${toggleCls}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Linha 2: Seleção de versículos — apenas em telas < sm */}
        <div className="flex sm:hidden items-center gap-2 mt-1.5 justify-center flex-wrap pb-0.5">
          {verseControls}
        </div>

      </div>
    </header>
  )
}
