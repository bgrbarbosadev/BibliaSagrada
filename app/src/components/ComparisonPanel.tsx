import { useBibleData } from '../hooks/useBibleData'
import VerseList from './VerseList'
import { VERSIONS } from '../data/versions'
import type { BgTheme } from './Sidebar'

interface Props {
  bookId: string
  chapter: number
  highlightVerse: number | null
  compareVersion: string
  onRemove: () => void
  theme: BgTheme
}

export default function ComparisonPanel({ bookId, chapter, highlightVerse, compareVersion, onRemove, theme }: Props) {
  const { data, loading, error } = useBibleData(compareVersion, bookId)
  const versionMeta = VERSIONS.find(v => v.id === compareVersion)
  const rtl = versionMeta?.direction === 'rtl'
  const chapterData = data?.chapters[String(chapter)]

  const colBorder = theme.isDark ? 'border-white/10'  : 'border-stone-200 dark:border-stone-700'
  const colHeader = theme.isDark ? 'bg-white/5'       : 'bg-stone-100 dark:bg-stone-800'
  const nameText  = theme.isDark ? 'text-white/80'    : 'text-stone-700 dark:text-stone-200'
  const closeBtn  = theme.isDark ? 'text-white/40 hover:text-red-400' : 'text-stone-400 hover:text-red-500'

  return (
    <div className={`flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden ${colBorder}`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${colHeader} ${colBorder}`}>
        <span className={`flex-1 text-xs font-medium ${nameText}`}>
          {compareVersion} — {versionMeta?.name ?? compareVersion}
        </span>
        <button onClick={onRemove} className={`transition-colors ${closeBtn}`} title="Fechar comparação">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {loading && <p className={`text-center py-8 ${theme.subheading}`}>Carregando…</p>}
        {error   && <p className="text-red-500 text-center py-8 text-xs">{error}</p>}
        {chapterData && (
          <VerseList
            chapter={chapterData}
            highlightVerse={highlightVerse}
            speakingVerse={null}
            rtl={rtl}
            bodyClass={theme.body}
            bookId={bookId}
            chapterNum={chapter}
          />
        )}
      </div>
    </div>
  )
}