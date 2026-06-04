import { memo, useEffect, useRef } from 'react'

interface Props {
  number: string
  text: string
  highlighted: boolean
  speaking: boolean
  marked: boolean
  onDoubleClick: () => void
  rtl: boolean
  fontSize: number
  bodyClass?: string
}

const VerseItem = memo(function VerseItem({ number, text, highlighted, speaking, marked, onDoubleClick, rtl, fontSize, bodyClass }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  useEffect(() => {
    if (speaking && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [speaking])

  return (
    <p
      ref={ref}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ fontSize }}
      onDoubleClick={onDoubleClick}
      className={`py-1.5 px-2 rounded transition-colors leading-relaxed font-serif cursor-pointer ${
        bodyClass ?? 'text-stone-800 dark:text-stone-100'
      } ${
        highlighted
          ? 'verse-highlight'
          : speaking
            ? 'bg-amber-500/25 border-l-2 border-amber-500'
            : marked
              ? 'bg-amber-400/20 border-l-2 border-amber-500'
              : 'hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      <sup className="text-amber-500 font-sans text-xs font-bold select-none me-2">
        {number}
      </sup>
      {text}
    </p>
  )
})

export default VerseItem