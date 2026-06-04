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
}

export default function Header({
  book, chapter, version,
  isDark = false,
  headerBg = 'bg-white/90 dark:bg-stone-900/90 backdrop-blur border-stone-200 dark:border-stone-700',
  totalVerses, freeReading, verseFrom, verseTo,
  onFreeReadingChange, onVerseFromChange, onVerseToChange,
}: Props) {
  const bgTheme = useReaderStore(s => s.bgTheme)
  const selectBg = SELECT_BG[bgTheme] || ''

  const selectCls = isDark
    ? 'border-white/20 text-white/90'
    : 'border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-200'

  const labelCls = isDark ? 'text-white/60' : 'text-stone-500'

  const optionStyle = selectBg ? { backgroundColor: selectBg } : undefined
  const selectStyle = selectBg ? { backgroundColor: selectBg } : undefined

  return (
    <header className={`sticky top-0 z-40 border-b shadow-sm transition-colors duration-500 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="relative flex items-center">
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-amber-500 text-lg tracking-tight">
              ✝ Bíblia
            </span>
            <span className={`text-[10px] ${labelCls} opacity-50`}>version - {appVersion}</span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <BookSelector currentBook={book} currentVersion={version} currentChapter={chapter} isDark={isDark} />
            <ChapterNav book={book} chapter={chapter} version={version} isDark={isDark} />

            <span className={`text-xs ${labelCls} opacity-40`}>|</span>

            {/* Seleção de versículos */}
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

            <span className={`text-xs ${labelCls} opacity-40`}>|</span>

            <VersionSelector currentVersion={version} bookId={book.id} isDark={isDark} />
          </div>
        </div>
      </div>
    </header>
  )
}