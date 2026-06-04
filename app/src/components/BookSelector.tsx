import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OT_BOOKS, NT_BOOKS } from '../data/booksIndex'
import type { BookMeta } from '../types/bible'

interface Props {
  currentBook: BookMeta
  currentVersion: string
  currentChapter: number
  isDark?: boolean
}

export default function BookSelector({ currentBook, currentVersion, currentChapter, isDark = false }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'OT' | 'NT'>(currentBook.testament)
  const navigate = useNavigate()

  function selectBook(book: BookMeta) {
    const chapter = Math.min(currentChapter, book.chapters)
    navigate(`/ler/${currentVersion}/${book.id}/${chapter}`)
    setOpen(false)
  }

  const triggerText = isDark
    ? 'text-white/90 hover:text-white'
    : 'text-stone-800 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 font-semibold transition-colors text-base ${triggerText}`}
      >
        {currentBook.name}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">Selecionar Livro</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex border-b border-stone-200 dark:border-stone-700">
              {(['OT', 'NT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {t === 'OT' ? 'Antigo Testamento' : 'Novo Testamento'}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto p-3 grid grid-cols-2 gap-1">
              {(tab === 'OT' ? OT_BOOKS : NT_BOOKS).map((book) => (
                <button
                  key={book.id}
                  onClick={() => selectBook(book)}
                  className={`text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    book.id === currentBook.id
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}