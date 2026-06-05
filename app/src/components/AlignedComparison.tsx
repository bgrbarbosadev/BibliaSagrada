import { useBibleData } from '../hooks/useBibleData'
import { useReaderStore } from '../store/useReaderStore'
import { VERSIONS } from '../data/versions'
import type { ChapterData } from '../types/bible'
import type { BgTheme } from './Sidebar'

interface Props {
  mainChapter: ChapterData
  mainVersionId: string
  mainVersionName: string
  compareVersionId: string
  bookId: string
  chapterNum: number
  highlightVerse: number | null
  speakingVerse: number | null
  rtl: boolean
  bodyClass: string
  theme: BgTheme
  onClose: () => void
}

export default function AlignedComparison({
  mainChapter, mainVersionId, mainVersionName,
  compareVersionId, bookId, chapterNum,
  highlightVerse, speakingVerse, rtl, bodyClass, theme, onClose,
}: Props) {
  const { data, loading } = useBibleData(compareVersionId, bookId)
  const fontSize = useReaderStore(s => s.fontSize)
  const markedVerses = useReaderStore(s => s.markedVerses)

  const compareVersionMeta = VERSIONS.find(v => v.id === compareVersionId)
  const compareChapter: ChapterData = data?.chapters[String(chapterNum)] ?? {}

  const colBorder  = theme.isDark ? 'border-white/10'  : 'border-stone-200 dark:border-stone-700'
  const colHeader  = theme.isDark ? 'bg-white/5'        : 'bg-stone-100 dark:bg-stone-800'
  const nameText   = theme.isDark ? 'text-white/80'     : 'text-stone-700 dark:text-stone-200'
  const closeBtn   = theme.isDark ? 'text-white/40 hover:text-red-400' : 'text-stone-400 hover:text-red-500'
  const rowDivider = theme.isDark ? 'border-white/5'   : 'border-stone-100 dark:border-stone-800'
  const colDivider = theme.isDark ? 'border-white/10'  : 'border-stone-200 dark:border-stone-700'
  const bodyText   = bodyClass || 'text-stone-800 dark:text-stone-100'

  const verseNums = Object.keys(mainChapter).sort((a, b) => Number(a) - Number(b))

  return (
    <div className={`flex-1 flex flex-col border rounded-xl overflow-hidden ${colBorder}`}>

      {/* Cabeçalho duplo */}
      <div className={`grid grid-cols-2 border-b shrink-0 ${colBorder}`}>
        <div className={`px-3 py-2 border-r ${colHeader} ${colDivider}`}>
          <span className={`text-xs font-medium ${nameText}`}>
            {mainVersionId} — {mainVersionName}
          </span>
        </div>
        <div className={`flex items-center justify-between px-3 py-2 ${colHeader}`}>
          <span className={`text-xs font-medium ${nameText}`}>
            {compareVersionId} — {compareVersionMeta?.name ?? compareVersionId}
          </span>
          <button onClick={onClose} className={`transition-colors ml-2 shrink-0 ${closeBtn}`} title="Fechar comparação">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Versículos alinhados linha por linha */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className={`text-center py-10 text-sm ${theme.subheading}`}>Carregando…</p>
        ) : (
          verseNums.map(num => {
            const mainText    = mainChapter[num] ?? ''
            const compareText = compareChapter[num] ?? ''
            const isHighlighted = highlightVerse === Number(num)
            const isSpeaking    = speakingVerse   === Number(num)
            const isMarked      = markedVerses.includes(`${bookId}/${chapterNum}/${num}`)

            const rowHighlight = isHighlighted
              ? 'verse-highlight'
              : isSpeaking
                ? 'bg-amber-500/25'
                : isMarked
                  ? 'bg-amber-400/20'
                  : ''

            const cellBase = `px-3 py-2 leading-relaxed font-serif ${bodyText} ${rowHighlight}`

            return (
              <div key={num} className={`grid grid-cols-2 border-b last:border-b-0 ${rowDivider}`}>
                <div
                  className={`${cellBase} border-r ${colDivider}`}
                  dir={rtl ? 'rtl' : 'ltr'}
                  style={{ fontSize }}
                >
                  <sup className="text-amber-500 font-sans text-xs font-bold select-none me-2">{num}</sup>
                  {mainText}
                </div>
                <div
                  className={cellBase}
                  dir={rtl ? 'rtl' : 'ltr'}
                  style={{ fontSize }}
                >
                  <sup className="text-amber-500 font-sans text-xs font-bold select-none me-2">{num}</sup>
                  {compareText}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
