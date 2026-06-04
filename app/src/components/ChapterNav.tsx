import { useNavigate } from 'react-router-dom'
import type { BookMeta } from '../types/bible'
import { useReaderStore } from '../store/useReaderStore'

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
}

export default function ChapterNav({ book, chapter, version, isDark = false }: Props) {
  const navigate = useNavigate()
  const bgTheme = useReaderStore((s) => s.bgTheme)

  const hasPrev = chapter > 1
  const hasNext = chapter < book.chapters

  function go(target: number) {
    navigate(`/ler/${version}/${book.id}/${target}`)
  }

  const btnText   = isDark ? 'text-white/70 hover:bg-white/10' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
  const selectCls = isDark
    ? 'border-white/20 text-white/90'
    : 'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200'
  const selectBg = SELECT_BG[bgTheme] || ''

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => go(chapter - 1)}
        disabled={!hasPrev}
        className={`p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnText}`}
        title="Capítulo anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <select
        value={chapter}
        onChange={(e) => go(Number(e.target.value))}
        style={selectBg ? { backgroundColor: selectBg } : undefined}
        className={`text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${selectCls}`}
      >
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
          <option key={c} value={c} style={selectBg ? { backgroundColor: selectBg } : undefined}>
            Capítulo {c}
          </option>
        ))}
      </select>

      <button
        onClick={() => go(chapter + 1)}
        disabled={!hasNext}
        className={`p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnText}`}
        title="Próximo capítulo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}