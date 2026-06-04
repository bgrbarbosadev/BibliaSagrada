import { memo, useEffect, useRef } from 'react'

interface Props {
  number: string
  text: string
  highlighted: boolean
  rtl: boolean
  fontSize: number
  bodyClass?: string
}

const VerseItem = memo(function VerseItem({ number, text, highlighted, rtl, fontSize, bodyClass }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  return (
    <p
      ref={ref}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ fontSize }}
      className={`py-1.5 px-2 rounded transition-colors leading-relaxed font-serif ${
        bodyClass ?? 'text-stone-800 dark:text-stone-100'
      } ${
        highlighted ? 'verse-highlight' : 'hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      <sup className={`text-amber-500 font-sans text-xs font-bold select-none ${rtl ? 'ms-2' : 'me-2'}`}>
        {number}
      </sup>
      {text}
    </p>
  )
})

export default VerseItem