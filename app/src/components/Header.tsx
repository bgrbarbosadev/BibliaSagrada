import { useState } from 'react'
import BookSelector from './BookSelector'
import ChapterNav from './ChapterNav'
import VersionSelector from './VersionSelector'
import { useReaderStore, MIN_FONT_SIZE, MAX_FONT_SIZE } from '../store/useReaderStore'
import { getCompatibleVersions } from '../validators/stateValidator'
import type { BookMeta } from '../types/bible'

interface Props {
  book: BookMeta
  chapter: number
  version: string
  isCompareMode: boolean
  compareVersion: string | null
  onToggleCompare: () => void
  onSelectCompareVersion: (v: string) => void
  isDark?: boolean
  headerBg?: string
}

export default function Header({
  book, chapter, version, isCompareMode, compareVersion,
  onToggleCompare, onSelectCompareVersion,
  isDark = false,
  headerBg = 'bg-white/90 dark:bg-stone-900/90 backdrop-blur border-stone-200 dark:border-stone-700',
}: Props) {
  const { fontSize, increaseFontSize, decreaseFontSize } = useReaderStore()
  const [modalOpen, setModalOpen] = useState(false)
  const atMin = fontSize <= MIN_FONT_SIZE
  const atMax = fontSize >= MAX_FONT_SIZE

  const compatible = getCompatibleVersions(book.id).filter(v => v.id !== version)

  const text  = isDark ? 'text-white/70'    : 'text-stone-500 dark:text-stone-400'
  const hover = isDark ? 'hover:bg-white/10' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
  const label = isDark ? 'text-white/40'    : 'text-stone-400 dark:text-stone-500'
  const value = isDark ? 'text-white/90'    : 'text-stone-600 dark:text-stone-300'

  function handleOpenModal() {
    if (isCompareMode) {
      onToggleCompare()
    } else {
      setModalOpen(true)
    }
  }

  function handleSelectVersion(v: string) {
    setModalOpen(false)
    onSelectCompareVersion(v)
    if (!isCompareMode) onToggleCompare()
  }

  return (
    <>
      <header className={`sticky top-0 z-40 border-b shadow-sm transition-colors duration-500 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-2 flex flex-col gap-2">

          {/* Linha 1: navegação */}
          <div className="relative flex items-center">
            <span className="font-bold text-amber-500 text-lg tracking-tight">
              ✝ Bíblia
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              <BookSelector currentBook={book} currentVersion={version} currentChapter={chapter} isDark={isDark} />
              <ChapterNav book={book} chapter={chapter} version={version} isDark={isDark} />
              <VersionSelector currentVersion={version} bookId={book.id} isDark={isDark} />
            </div>
          </div>

          {/* Linha 2: controles */}
          <div className="flex items-center justify-center gap-10">

            {/* Tamanho da fonte */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={decreaseFontSize}
                  disabled={atMin}
                  title="Diminuir fonte"
                  className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${text} ${hover}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className={`text-xs w-6 text-center select-none tabular-nums font-medium ${value}`}>
                  {fontSize}
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={atMax}
                  title="Aumentar fonte"
                  className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${text} ${hover}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <span className={`text-[10px] leading-none select-none ${label}`}>Tamanho</span>
            </div>

            {/* Comparar versões */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={handleOpenModal}
                title={isCompareMode ? 'Fechar comparação' : 'Comparar versão'}
                className={`p-1.5 rounded transition-colors ${
                  isCompareMode
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-stone-300 text-black'
                    : `${text} ${hover}`
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </button>
              <span className={`text-[10px] leading-none select-none ${label}`}>Comparar</span>
            </div>

          </div>
        </div>
      </header>

      {/* Modal de seleção de versão */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                Escolher versão para comparar
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="py-2 max-h-72 overflow-y-auto">
              {compatible.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => handleSelectVersion(v.id)}
                    className={`w-full text-left px-5 py-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 ${
                      compareVersion === v.id
                        ? 'bg-stone-200 dark:bg-stone-700 font-semibold'
                        : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{v.name}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{v.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}