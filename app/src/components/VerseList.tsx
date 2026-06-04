import { memo } from 'react'
import VerseItem from './VerseItem'
import { useReaderStore } from '../store/useReaderStore'
import type { ChapterData } from '../types/bible'

interface Props {
  chapter: ChapterData
  highlightVerse: number | null
  rtl: boolean
  bodyClass?: string
}

const VerseList = memo(function VerseList({ chapter, highlightVerse, rtl, bodyClass }: Props) {
  const fontSize = useReaderStore((s) => s.fontSize)
  const entries = Object.entries(chapter).sort(
    ([a], [b]) => Number(a) - Number(b)
  )

  return (
    <div className="flex flex-col gap-0.5">
      {entries.map(([num, text]) => (
        <VerseItem
          key={num}
          number={num}
          text={text}
          highlighted={highlightVerse === Number(num)}
          rtl={rtl}
          fontSize={fontSize}
          bodyClass={bodyClass}
        />
      ))}
    </div>
  )
})

export default VerseList