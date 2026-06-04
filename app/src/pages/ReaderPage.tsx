import { useEffect, useRef, useState } from 'react'
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

  const { isCompareMode, toggleCompareMode, bgTheme, readPages, toggleReadPage } = useReaderStore()
  const [compareVersion, setCompareVersion] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null)
  const [isLibrasActive, setIsLibrasActive] = useState(false)
  const vlibrasLoaded = useRef(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vlibrasWidget = useRef<any>(null)

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

  useEffect(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSpeakingVerse(null)
  }, [bookId, chapter])

  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [])

  const { data, loading, error } = useBibleData(version, bookId)

  useEffect(() => {
    if (!isLibrasActive || speakingVerse === null) return
    const chData = data?.chapters[String(chapter)]
    const text = chData?.[String(speakingVerse)]
    if (!text) return
    try {
      if (vlibrasWidget.current?.translate) {
        vlibrasWidget.current.translate(text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((window as any).VLibras?.Widget?.player?.translate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).VLibras.Widget.player.translate(text)
      }
    } catch { /* widget ainda não pronto */ }
  }, [speakingVerse, isLibrasActive, data, chapter])

  if (!bookMeta || !versionMeta) return null

  const rtl = versionMeta.direction === 'rtl'
  const chapterData = data?.chapters[String(chapter)]
  const theme = BG_THEMES.find(t => t.id === bgTheme)!

  function clickVLibrasButton() {
    const btn = document.querySelector('[vw-access-button]') as HTMLElement | null
    btn?.click()
  }

  function handleToggleLibras() {
    const container = document.getElementById('vlibras-container')

    if (!isLibrasActive) {
      if (container) {
        container.style.visibility = 'visible'
        container.style.pointerEvents = 'auto'
      }

      if (!vlibrasLoaded.current) {
        const script = document.createElement('script')
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vlibrasWidget.current = new (window as any).VLibras.Widget('https://vlibras.gov.br/app')
          vlibrasLoaded.current = true
          // Aguarda assets do VLibras carregarem antes de abrir
          setTimeout(clickVLibrasButton, 2000)
        }
        document.body.appendChild(script)
      } else {
        setTimeout(clickVLibrasButton, 200)
      }
    } else {
      clickVLibrasButton()
      setTimeout(() => {
        if (container) {
          container.style.visibility = 'hidden'
          container.style.pointerEvents = 'none'
        }
      }, 400)
    }

    setIsLibrasActive(prev => !prev)
  }

  function handleToggleSpeech() {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeakingVerse(null)
      return
    }
    if (!chapterData) return
    const verses = Object.entries(chapterData)
      .sort(([a], [b]) => Number(a) - Number(b))
    verses.forEach(([num, text], idx) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.onstart = () => setSpeakingVerse(Number(num))
      if (idx === verses.length - 1) {
        utterance.onend = () => { setIsSpeaking(false); setSpeakingVerse(null) }
        utterance.onerror = () => { setIsSpeaking(false); setSpeakingVerse(null) }
      }
      window.speechSynthesis.speak(utterance)
    })
    setIsSpeaking(true)
  }

  function handleSelectCompareVersion(v: string) {
    setCompareVersion(v)
  }

  function handleToggleCompare() {
    if (isCompareMode) {
      setCompareVersion(null)
    }
    toggleCompareMode()
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden transition-all duration-500"
      style={theme.pageStyle}
    >
      <Header
        book={bookMeta}
        chapter={chapter}
        version={version}
        isCompareMode={isCompareMode}
        compareVersion={compareVersion}
        onToggleCompare={handleToggleCompare}
        onSelectCompareVersion={handleSelectCompareVersion}
        isDark={theme.isDark}
        headerBg={theme.headerBg}
      />

      <div className="flex flex-1 min-h-0 max-w-7xl mx-auto w-full">

        {/* Área principal */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Título — estático */}
          <div className={`flex-shrink-0 px-6 pt-6 pb-3 border-b ${theme.border}`}>
            <div className="flex items-center justify-between">
              <h1 className={`text-xl font-bold ${theme.heading}`}>
                {bookMeta.name} {chapter}
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleSpeech}
                  disabled={!chapterData}
                  title={isSpeaking ? 'Parar leitura' : 'Ler página em áudio'}
                  className="flex flex-col items-center gap-0.5 p-1 rounded transition-colors hover:opacity-80 disabled:opacity-30"
                >
                  {isSpeaking ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${theme.subheading}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  )}
                  <span className={`text-[10px] leading-none ${isSpeaking ? 'text-amber-500' : theme.subheading}`}>
                    {isSpeaking ? 'Pausar' : 'Ler página'}
                  </span>
                </button>

                <button
                  onClick={handleToggleLibras}
                  title={isLibrasActive ? 'Desativar Libras' : 'Ativar assistente de Libras'}
                  className="flex flex-col items-center gap-0.5 p-1 rounded transition-colors hover:opacity-80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isLibrasActive ? 'text-amber-500' : theme.subheading}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 1 1 3 0m-3 6a1.5 1.5 0 0 0 3 0m0 0V8m0 3.5a1.5 1.5 0 0 1 3 0V11m0 0a1.5 1.5 0 0 1 3 0V11m-9 3a2 2 0 1 1-4 0 4 4 0 0 1 4-5m12 0a4 4 0 0 1-4 5" />
                  </svg>
                  <span className={`text-[10px] leading-none ${isLibrasActive ? 'text-amber-500' : theme.subheading}`}>
                    Libras
                  </span>
                </button>

                <button
                  onClick={() => toggleReadPage(bookId, chapter)}
                  title={readPages.includes(`${bookId}/${chapter}`) ? 'Desmarcar como lido' : 'Marcar como lido'}
                  className="flex flex-col items-center gap-0.5 p-1 rounded transition-colors hover:opacity-80"
                >
                  {readPages.includes(`${bookId}/${chapter}`) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 3a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2H5z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${theme.subheading}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2H5z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] leading-none ${readPages.includes(`${bookId}/${chapter}`) ? 'text-amber-500' : theme.subheading}`}>
                    Página lida
                  </span>
                </button>
              </div>
            </div>
            <p className={`text-xs mt-0.5 ${theme.subheading}`}>
              {versionMeta.name}
            </p>
          </div>

          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
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
                  speakingVerse={speakingVerse}
                  rtl={rtl}
                  bodyClass={theme.body}
                  bookId={bookId}
                  chapterNum={chapter}
                />
              )}
            </div>

            {isCompareMode && compareVersion && (
              <ComparisonPanel
                bookId={bookId}
                chapter={chapter}
                highlightVerse={highlightVerse}
                compareVersion={compareVersion}
                onRemove={handleToggleCompare}
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
          </div>{/* fim área rolável */}
        </main>

        <Sidebar />
      </div>
      <MusicPlayer />
    </div>
  )
}