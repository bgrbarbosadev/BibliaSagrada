import { useState } from 'react'
import { getCompatibleVersions } from '../validators/stateValidator'
import { useBibleData } from '../hooks/useBibleData'
import VerseList from './VerseList'
import { VERSIONS } from '../data/versions'
import type { BgTheme } from './Sidebar'

interface ColumnProps {
  bookId: string
  chapter: number
  highlightVerse: number | null
  initialVersion: string
  onRemove: () => void
  theme: BgTheme
}

function CompareColumn({ bookId, chapter, highlightVerse, initialVersion, onRemove, theme }: ColumnProps) {
  const [version, setVersion] = useState(initialVersion)
  const { data, loading, error } = useBibleData(version, bookId)
  const compatible = getCompatibleVersions(bookId)
  const versionMeta = VERSIONS.find(v => v.id === version)
  const rtl = versionMeta?.direction === 'rtl'
  const chapterData = data?.chapters[String(chapter)]

  const colBorder  = theme.isDark ? 'border-white/10'  : 'border-stone-200 dark:border-stone-700'
  const colHeader  = theme.isDark ? 'bg-white/5'       : 'bg-stone-100 dark:bg-stone-800'
  const selectText = theme.isDark ? 'text-white/80'    : 'text-stone-700 dark:text-stone-200'
  const closeBtn   = theme.isDark ? 'text-white/40 hover:text-red-400' : 'text-stone-400 hover:text-red-500 dark:hover:text-red-400'

  return (
    <div className={`flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden ${colBorder}`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${colHeader} ${colBorder}`}>
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className={`flex-1 text-xs bg-transparent focus:outline-none cursor-pointer ${selectText}`}
        >
          {compatible.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id} — {v.name}
            </option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className={`transition-colors ${closeBtn}`}
          title="Remover coluna"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {loading && <p className={`text-center py-8 ${theme.subheading}`}>Carregando…</p>}
        {error && <p className="text-red-500 text-center py-8 text-xs">{error}</p>}
        {chapterData && (
          <VerseList
            chapter={chapterData}
            highlightVerse={highlightVerse}
            rtl={rtl}
            bodyClass={theme.body}
          />
        )}
      </div>
    </div>
  )
}

interface Props {
  bookId: string
  chapter: number
  highlightVerse: number | null
  primaryVersion: string
  theme: BgTheme
}

export default function ComparisonPanel({ bookId, chapter, highlightVerse, primaryVersion, theme }: Props) {
  const compatible = getCompatibleVersions(bookId)
  const secondary = compatible.find(v => v.id !== primaryVersion)
  const [columns, setColumns] = useState<string[]>(secondary ? [secondary.id] : [])

  function addColumn() {
    const next = compatible.find(v => v.id !== primaryVersion && !columns.includes(v.id))
    if (next && columns.length < 2) setColumns([...columns, next.id])
  }

  function removeColumn(idx: number) {
    setColumns(columns.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((ver, idx) => (
          <CompareColumn
            key={`${ver}-${idx}`}
            bookId={bookId}
            chapter={chapter}
            highlightVerse={highlightVerse}
            initialVersion={ver}
            onRemove={() => removeColumn(idx)}
            theme={theme}
          />
        ))}
      </div>
      {columns.length < 2 && compatible.length > columns.length + 1 && (
        <button
          onClick={addColumn}
          className="self-start text-sm text-amber-500 hover:underline"
        >
          + Adicionar versão para comparar
        </button>
      )}
    </div>
  )
}