import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getBook } from '../data/booksIndex'
import { VERSIONS, DEFAULT_VERSION } from '../data/versions'
import { getValidVersion, getValidChapter } from '../validators/stateValidator'
import { useBibleData } from '../hooks/useBibleData'
import { useReaderStore, MIN_FONT_SIZE, MAX_FONT_SIZE } from '../store/useReaderStore'
import { getCompatibleVersions } from '../validators/stateValidator'
import { BG_THEMES } from '../components/Sidebar'
import Header from '../components/Header'
import VerseList from '../components/VerseList'
import ComparisonPanel from '../components/ComparisonPanel'
import Sidebar from '../components/Sidebar'
import MusicPlayer from '../components/MusicPlayer'
import LibrasPopup from '../components/LibrasPopup'

const SPEECH_RATES = [0.5, 0.75, 1.0, 1.3, 1.6]   // índices 0–4 → chave -2 a +2
const LANG_MAP: Record<string, string> = {
  'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
  'he': 'he-IL', 'el': 'el-GR', 'arc': 'pt-BR',
}

// Carrega vozes de forma assíncrona e cacheia
let cachedVoices: SpeechSynthesisVoice[] = []
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length) { cachedVoices = voices; resolve(voices); return }
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices()
      resolve(cachedVoices)
    }
    // fallback: se onvoiceschanged não disparar em 1s, usa o que tiver
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
  })
}

function resolveSpeechLang(voices: SpeechSynthesisVoice[], language: string): string {
  const target = LANG_MAP[language] ?? language
  if (!target) return navigator.language || 'pt-BR'
  if (!voices.length) return target
  const prefix = target.split('-')[0].toLowerCase()
  const hasVoice = voices.some(v => v.lang.toLowerCase().startsWith(prefix))
  // sem voz nativa, usa a voz padrão do sistema (sempre fala algo)
  return hasVoice ? target : (navigator.language || 'pt-BR')
}
const SPEED_OPTIONS = [
  { key: -2, label: 'Muito lenta' },
  { key: -1, label: 'Lenta' },
  { key:  0, label: 'Normal' },
  { key:  1, label: 'Rápida' },
  { key:  2, label: 'Muito rápida' },
]

export default function ReaderPage() {
  const { version = DEFAULT_VERSION, book: bookId = 'GEN', chapter: chapterParam = '1' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { isCompareMode, toggleCompareMode, bgTheme, readPages, toggleReadPage, fontSize, increaseFontSize, decreaseFontSize } = useReaderStore()
  const [compareVersion, setCompareVersion] = useState<string | null>(null)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null)
  const [isLibrasActive, setIsLibrasActive] = useState(false)
  const [speechRate, setSpeechRate] = useState(0)
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false)
  const [freeReading, setFreeReading] = useState(true)
  const [verseFrom, setVerseFrom] = useState(1)
  const [verseTo, setVerseTo] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const speakingStateRef = useRef({ isSpeaking: false, speakingVerse: null as number | null })
  const restartVerseRef = useRef<number | null>(null)
  const speechRateRef = useRef(0)

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
    setFreeReading(true)
    setVerseFrom(1)
    setVerseTo(1)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [bookId, chapter])

  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [])

  // Mantém refs sincronizados para leitura em effects sem deps desnecessários
  speakingStateRef.current = { isSpeaking, speakingVerse }
  speechRateRef.current = speechRate

  // Ao trocar versão: cancela e guarda verso atual para reiniciar
  useEffect(() => {
    const { isSpeaking: wasPlaying, speakingVerse: verse } = speakingStateRef.current
    if (!wasPlaying) return
    restartVerseRef.current = verse
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSpeakingVerse(null)
  }, [version]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, loading, error } = useBibleData(version, bookId)

  // Atualiza verseTo quando os dados do capítulo carregam
  useEffect(() => {
    const chData = data?.chapters[String(chapter)]
    if (!chData) return
    const total = Object.keys(chData).length
    setVerseTo(total)
  }, [data, chapter])

  // Reinicia áudio após troca de versão quando novos dados chegam
  useEffect(() => {
    const fromVerse = restartVerseRef.current
    if (fromVerse === null || !data || !versionMeta) return
    const chData = data.chapters[String(chapter)]
    if (!chData) return
    restartVerseRef.current = null
    const entries = Object.entries(chData)
      .sort(([a], [b]) => Number(a) - Number(b))
      .filter(([n]) => Number(n) >= fromVerse)
    const language = versionMeta.language
    const rate = speechRateRef.current
    setIsSpeaking(true)
    loadVoices().then(voices => {
      const resolvedLang = resolveSpeechLang(voices, language)
      entries.forEach(([num, text], idx) => {
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = resolvedLang
        utt.rate = SPEECH_RATES[rate + 2]
        utt.onstart = () => setSpeakingVerse(Number(num))
        if (idx === entries.length - 1) {
          utt.onend = () => { setIsSpeaking(false); setSpeakingVerse(null) }
          utt.onerror = () => { setIsSpeaking(false); setSpeakingVerse(null) }
        }
        window.speechSynthesis.speak(utt)
      })
    })
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!bookMeta || !versionMeta) return null

  const rtl = versionMeta.direction === 'rtl'
  const chapterData = data?.chapters[String(chapter)]
  const totalVerses = chapterData ? Object.keys(chapterData).length : 0

  const filteredChapterData = chapterData && !freeReading
    ? Object.fromEntries(
        Object.entries(chapterData).filter(([n]) => {
          const num = Number(n)
          return num >= verseFrom && num <= verseTo
        })
      ) as typeof chapterData
    : chapterData

  const theme = BG_THEMES.find(t => t.id === bgTheme)!


  async function queueVerses(
    entries: [string, string][],
    rate: number,
    lang: string
  ) {
    const voices = await loadVoices()
    const resolvedLang = resolveSpeechLang(voices, lang)
    entries.forEach(([num, text], idx) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = resolvedLang
      utterance.rate = SPEECH_RATES[rate + 2]
      utterance.onstart = () => setSpeakingVerse(Number(num))
      if (idx === entries.length - 1) {
        utterance.onend  = () => { setIsSpeaking(false); setSpeakingVerse(null) }
        utterance.onerror = () => { setIsSpeaking(false); setSpeakingVerse(null) }
      }
      window.speechSynthesis.speak(utterance)
    })
  }

  async function handleToggleSpeech() {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeakingVerse(null)
      return
    }
    if (isCompareMode) {
      setCompareVersion(null)
      toggleCompareMode()
    }
    if (!filteredChapterData) return
    const verses = Object.entries(filteredChapterData)
      .sort(([a], [b]) => Number(a) - Number(b))
    setIsSpeaking(true)
    await queueVerses(verses, speechRate, versionMeta?.language ?? 'pt-BR')
  }

  async function handleSelectSpeed(newRate: number) {
    setSpeechRate(newRate)
    setSpeedMenuOpen(false)
    if (!isSpeaking || !filteredChapterData) return
    const fromVerse = speakingVerse ?? verseFrom
    window.speechSynthesis.cancel()
    const verses = Object.entries(filteredChapterData)
      .sort(([a], [b]) => Number(a) - Number(b))
      .filter(([num]) => Number(num) >= fromVerse)
    await queueVerses(verses, newRate, versionMeta?.language ?? 'pt-BR')
  }

  function handleSelectCompareVersion(v: string) {
    setCompareVersion(v)
    setCompareModalOpen(false)
    if (!isCompareMode) toggleCompareMode()
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
        isDark={theme.isDark}
        headerBg={theme.headerBg}
        totalVerses={totalVerses}
        freeReading={freeReading}
        verseFrom={verseFrom}
        verseTo={verseTo}
        onFreeReadingChange={v => {
          setFreeReading(v)
          if (v) { setVerseFrom(1); setVerseTo(totalVerses) }
        }}
        onVerseFromChange={v => { setVerseFrom(v); if (v > verseTo) setVerseTo(v) }}
        onVerseToChange={v => { setVerseTo(v); if (v < verseFrom) setVerseFrom(v) }}
        onSidebarOpen={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1 min-h-0 max-w-7xl mx-auto w-full">

        {/* Área principal */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Título — estático */}
          <div className={`flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b ${theme.border}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
              <h1 className={`text-xl font-bold ${theme.heading}`}>
                {bookMeta.name} {chapter}
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto flex-shrink-0 pb-0.5">

                {/* Tamanho da fonte */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <button onClick={decreaseFontSize} disabled={fontSize <= MIN_FONT_SIZE} title="Diminuir fonte"
                      className={`p-1 rounded transition-colors disabled:opacity-30 ${theme.subheading} hover:opacity-80`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className={`text-xs w-5 text-center tabular-nums font-medium ${theme.subheading}`}>{fontSize}</span>
                    <button onClick={increaseFontSize} disabled={fontSize >= MAX_FONT_SIZE} title="Aumentar fonte"
                      className={`p-1 rounded transition-colors disabled:opacity-30 ${theme.subheading} hover:opacity-80`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className={`hidden sm:block text-[10px] leading-none ${theme.subheading}`}>Tamanho</span>
                </div>

                {/* Comparar versões */}
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel()
                    setIsSpeaking(false)
                    setSpeakingVerse(null)
                    isCompareMode ? handleToggleCompare() : setCompareModalOpen(true)
                  }}
                  title={isCompareMode ? 'Fechar comparação' : 'Comparar versão'}
                  className={`flex flex-col items-center gap-0.5 p-1 rounded transition-colors hover:opacity-80 ${isCompareMode ? 'text-amber-500' : theme.subheading}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                  </svg>
                  <span className="hidden sm:block text-[10px] leading-none">Comparar</span>
                </button>

                {/* Ler página */}
                <button
                  onClick={handleToggleSpeech}
                  disabled={!filteredChapterData}
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
                  <span className={`hidden sm:block text-[10px] leading-none ${isSpeaking ? 'text-amber-500' : theme.subheading}`}>
                    {isSpeaking ? 'Pausar' : 'Ler página'}
                  </span>
                </button>

                {/* Velocidade de leitura */}
                <div className="relative flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => setSpeedMenuOpen(o => !o)}
                    title="Velocidade de leitura"
                    className={`p-1 rounded transition-colors hover:opacity-80 ${theme.subheading}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zm0 0v10l4 2"/>
                    </svg>
                  </button>
                  <span className={`hidden sm:block text-[10px] leading-none ${theme.subheading}`}>
                    {SPEED_OPTIONS.find(o => o.key === speechRate)?.label ?? 'Normal'}
                  </span>
                  {speedMenuOpen && (
                    <div
                      className={`absolute top-full mt-1 right-0 z-30 rounded-xl shadow-xl border overflow-hidden min-w-[130px] ${
                        theme.isDark ? 'bg-stone-900 border-white/10' : 'bg-white border-stone-200'
                      }`}
                      onMouseLeave={() => setSpeedMenuOpen(false)}
                    >
                      {SPEED_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectSpeed(opt.key)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            speechRate === opt.key
                              ? 'text-amber-500 font-semibold'
                              : theme.isDark
                                ? 'text-white/80 hover:bg-white/10'
                                : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Libras */}
                <button
                  onClick={() => setIsLibrasActive(prev => !prev)}
                  title={isLibrasActive ? 'Desativar Libras' : 'Ativar assistente de Libras'}
                  className="flex flex-col items-center gap-0.5 p-1 rounded transition-colors hover:opacity-80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isLibrasActive ? 'text-amber-500' : theme.subheading}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 1 1 3 0m-3 6a1.5 1.5 0 0 0 3 0m0 0V8m0 3.5a1.5 1.5 0 0 1 3 0V11m0 0a1.5 1.5 0 0 1 3 0V11m-9 3a2 2 0 1 1-4 0 4 4 0 0 1 4-5m12 0a4 4 0 0 1-4 5" />
                  </svg>
                  <span className={`hidden sm:block text-[10px] leading-none ${isLibrasActive ? 'text-amber-500' : theme.subheading}`}>Libras</span>
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
                  <span className={`hidden sm:block text-[10px] leading-none ${readPages.includes(`${bookId}/${chapter}`) ? 'text-amber-500' : theme.subheading}`}>
                    Página lida
                  </span>
                </button>
              </div>
            </div>
            <p className={`text-xs mt-0.5 ${theme.subheading} sm:block`}>
              {versionMeta.name}
            </p>
          </div>

          {/* Conteúdo rolável */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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

              {filteredChapterData && (
                <VerseList
                  chapter={filteredChapterData}
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

          <div className={`mt-8 flex justify-between items-center border-t pt-4 gap-2 ${theme.border}`}>
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

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <MusicPlayer />

      {/* Modal de seleção de versão para comparar */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setCompareModalOpen(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Escolher versão para comparar</h2>
              <button onClick={() => setCompareModalOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="py-2 max-h-72 overflow-y-auto">
              {getCompatibleVersions(bookId).filter(v => v.id !== version).map(v => (
                <li key={v.id}>
                  <button onClick={() => handleSelectCompareVersion(v.id)}
                    className={`w-full text-left px-5 py-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 ${compareVersion === v.id ? 'bg-stone-200 dark:bg-stone-700 font-semibold' : ''}`}>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{v.name}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{v.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isLibrasActive && (
        <LibrasPopup
          currentVerseText={
            speakingVerse !== null
              ? (data?.chapters[String(chapter)]?.[String(speakingVerse)] ?? null)
              : null
          }
          theme={theme}
          onClose={() => {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            setSpeakingVerse(null)
            setIsLibrasActive(false)
          }}
        />
      )}
    </div>
  )
}