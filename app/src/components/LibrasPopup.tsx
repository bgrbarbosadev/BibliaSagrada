import { useEffect } from 'react'
import type { BgTheme } from './Sidebar'

interface Props {
  currentVerseText: string | null
  theme: BgTheme
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vw = () => (window as any).VLibras

function openWidget() {
  setTimeout(() => {
    const btn = document.querySelector('[vw-access-button]') as HTMLElement | null
    btn?.click()
  }, 400)
}

function closeWidget() {
  // Fecha o player se estiver aberto
  const closeBtn = document.querySelector('.vw-close-btn') as HTMLElement | null
  closeBtn?.click()
}

export default function LibrasPopup({ currentVerseText, theme, onClose }: Props) {
  // Abre o widget VLibras ao montar e fecha ao desmontar
  useEffect(() => {
    openWidget()
    return () => closeWidget()
  }, [])

  // Traduz o versículo atual conforme o áudio avança
  useEffect(() => {
    if (!currentVerseText) return
    try {
      vw()?.Widget?.player?.translate?.(currentVerseText)
    } catch { /* ainda carregando */ }
  }, [currentVerseText])

  const panelBg  = theme.isDark ? 'bg-stone-900 border-white/10'  : 'bg-white border-stone-200'
  const subtleBg = theme.isDark ? 'bg-black/20 border-white/10'   : 'bg-stone-50 border-stone-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative z-10 rounded-2xl shadow-2xl border flex flex-col ${panelBg}`}
        style={{ width: 360 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${panelBg}`}>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 1 1 3 0m-3 6a1.5 1.5 0 0 0 3 0m0 0V8m0 3.5a1.5 1.5 0 0 1 3 0V11m0 0a1.5 1.5 0 0 1 3 0V11m-9 3a2 2 0 1 1-4 0 4 4 0 0 1 4-5m12 0a4 4 0 0 1-4 5" />
            </svg>
            <span className={`text-sm font-semibold ${theme.heading}`}>Intérprete de Libras</span>
          </div>
          <button
            onClick={onClose}
            title="Fechar e pausar leitura"
            className={`p-1 rounded transition-colors hover:opacity-80 ${theme.subheading}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Versículo sendo interpretado */}
        <div className={`px-4 py-3 border-b text-sm leading-relaxed ${subtleBg}`}>
          {currentVerseText
            ? <>
                <span className={`block text-xs mb-1 ${theme.subheading}`}>Interpretando:</span>
                <span className={theme.body || 'text-stone-700 dark:text-stone-200'}>{currentVerseText}</span>
              </>
            : <span className={`text-xs ${theme.subheading}`}>
                Inicie a leitura em áudio para ativar a interpretação em Libras.
              </span>
          }
        </div>

        {/* Dica */}
        <div className={`px-4 py-3 text-xs ${theme.subheading}`}>
          O avatar aparece no canto inferior direito da tela. Fechar este painel também pausa o áudio.
        </div>
      </div>
    </div>
  )
}