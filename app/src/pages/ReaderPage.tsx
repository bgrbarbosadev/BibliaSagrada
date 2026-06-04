import { useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getBook } from '../data/booksIndex'
import { VERSIONS, DEFAULT_VERSION } from '../data/versions'
import { getValidVersion, getValidChapter } from '../validators/stateValidator'
import { useBibleData } from '../hooks/useBibleData'
import { useReaderStore } from '../store/useReaderStore'
import { BG_THEMES } from '../components/Sidebar'
import Header from '../components/Header'
import VerseList from '../components/VerseList'
import ComparisonPanel from '../components/ComparisonPanel'
import Sidebar from '../components/Sidebar'
import MusicPlayer from '../components/MusicPlayer'

export default function ReaderPage() {
  const { version = DEFAULT_VERSION, book: bookId = 'GEN', chapter: chapterParam = '1' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { isCompareMode, toggleCompareMode, bgTheme } = useReaderStore()

  const chapter = Number(chapterParam) || 1
  const verseParam = searchParams.get('verse')
  const highlightVerse = verseParam ? Number(verseParam) : null

  const bookMeta = getBook(bookId)
  const versionMeta = VERSIONS.find(v => v.id === version)

  useEffect(() => {
    if (!bookMeta) {
      navigate('/ler/ARC/GEN/1', { replace: true })
      return
    }

    const safeVersion = getValidVersion(version, bookId)
    const safeChapter = getValidChapter(chapter, bookId)

    if (safeVersion !== version || safeChapter !== chapter) {
      const verse = verseParam ? `?verse=${verseParam}` : ''
      navigate(`/ler/${safeVersion}/${bookId}/${safeChapter}${verse}`, { replace: true })
    }
  }, [version, bookId, chapter, bookMeta, navigate, verseParam])

  const { data, loading, error } = useBibleData(version, bookId)

  if (!bookMeta || !versionMeta) return null

  const rtl = versionMeta.direction === 'rtl'
  const chapterData = data?.chapters[String(chapter)]
  const theme = BG_THEMES.find(t => t.id === bgTheme)!

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-500"
      style={theme.pageStyle}
    >
      <Header
        book={bookMeta}
        chapter={chapter}
        version={version}
        isCompareMode={isCompareMode}
        onToggleCompare={toggleCompareMode}
        isDark={theme.isDark}
        headerBg={theme.headerBg}
      />

      <div className="flex flex-1 max-w-7xl mx-auto w-full">

        {/* Área principal */}
        <main className="flex-1 min-w-0 px-6 py-6">
          <div className={`flex gap-6 ${isCompareMode ? 'flex-col' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className={`mb-4 pb-2 border-b ${theme.border}`}>
                <h1 className={`text-xl font-bold ${theme.heading}`}>
                  {bookMeta.name} {chapter}
                </h1>
                <p className={`text-xs mt-0.5 ${theme.subheading}`}>
                  {versionMeta.name}
                </p>
              </div>

              {loading && (
                <div className={`flex items-center justify-center py-20 ${theme.subheading}`}>
                  <svg className="animate-spin w-6 h-6 me-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Carregando…
                </div>
              )}

              {error && (
                <div className="py-12 text-center">
                  <p className={`text-sm ${theme.subheading}`}>{error}</p>
                  <p className={`text-xs mt-1 opacity-60 ${theme.subheading}`}>
                    Adicione o arquivo <code className="font-mono">/public/data/{version}/{bookId}.json</code>
                  </p>
                </div>
              )}

              {chapterData && (
                <VerseList
                  chapter={chapterData}
                  highlightVerse={highlightVerse}
                  rtl={rtl}
                  bodyClass={theme.body}
                />
              )}
            </div>

            {isCompareMode && (
              <ComparisonPanel
                bookId={bookId}
                chapter={chapter}
                highlightVerse={highlightVerse}
                primaryVersion={version}
                theme={theme}
              />
            )}
          </div>

          <div className={`mt-8 flex justify-between items-center border-t pt-4 ${theme.border}`}>
            {chapter > 1 ? (
              <button
                onClick={() => navigate(`/ler/${version}/${bookId}/${chapter - 1}`)}
                className={`flex items-center gap-1 text-sm transition-colors ${theme.navBtn}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Capítulo {chapter - 1}
              </button>
            ) : <span />}

            {chapter < bookMeta.chapters && (
              <button
                onClick={() => navigate(`/ler/${version}/${bookId}/${chapter + 1}`)}
                className={`flex items-center gap-1 text-sm transition-colors ${theme.navBtn}`}
              >
                Capítulo {chapter + 1}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </main>

        <Sidebar />
      </div>
      <MusicPlayer />
    </div>
  )
}