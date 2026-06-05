import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OT_BOOKS, NT_BOOKS } from '../data/booksIndex'
import { useReaderStore } from '../store/useReaderStore'
import { BG_THEMES } from './Sidebar'
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
  const bgTheme = useReaderStore(s => s.bgTheme)
  const theme = BG_THEMES.find(t => t.id === bgTheme)!

  function selectBook(book: BookMeta) {
    const chapter = Math.min(currentChapter, book.chapters)
    navigate(`/ler/${currentVersion}/${book.id}/${chapter}`)
    setOpen(false)
  }

  const triggerText = isDark
    ? 'text-white/90 hover:text-white'
    : 'text-stone-800 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400'

  // Cor de fundo sólida por tema (sem gradiente, para modal)
  const MODAL_BG: Record<string, string> = {
    default:   '',
    parchment: '#f5e6c8',
    forest:    '#1a2e1a',
    night:     '#13112b',
  }
  const modalBg = MODAL_BG[bgTheme] || ''
  const modalStyle = modalBg ? { backgroundColor: modalBg } : undefined

  const headingCls = theme.heading || 'text-stone-800'
  const borderCls  = theme.border  || 'border-stone-200'
  const subCls     = theme.subheading || 'text-stone-400'
  const bodyCls    = theme.body    || 'text-stone-700'

  const tabActiveCls   = 'text-amber-500 border-b-2 border-amber-500'
  const tabInactiveCls = `${subCls} hover:opacity-80`

  const bookActiveCls   = 'bg-amber-500/20 text-amber-500 font-medium'
  const bookInactiveCls = `${bodyCls} ${theme.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`

  const closeCls = `${subCls} hover:opacity-80`

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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden border ${borderCls} ${!modalBg ? 'bg-white dark:bg-stone-900' : ''}`}
            style={modalStyle}
          >
            {/* Cabeçalho */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${borderCls}`}>
              <h2 className={`font-semibold ${headingCls}`}>Selecionar Livro</h2>
              <button onClick={() => setOpen(false)} className={`transition-colors ${closeCls}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Abas */}
            <div className={`flex border-b ${borderCls}`}>
              {(['OT', 'NT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === t ? tabActiveCls : tabInactiveCls
                  }`}
                >
                  {t === 'OT' ? 'Antigo Testamento' : 'Novo Testamento'}
                </button>
              ))}
            </div>

            {/* Lista de livros */}
            <div className="overflow-y-auto p-3 grid grid-cols-2 gap-1">
              {(tab === 'OT' ? OT_BOOKS : NT_BOOKS).map((book) => (
                <button
                  key={book.id}
                  onClick={() => selectBook(book)}
                  className={`text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    book.id === currentBook.id ? bookActiveCls : bookInactiveCls
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