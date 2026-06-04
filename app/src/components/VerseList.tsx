import { memo } from 'react'
import VerseItem from './VerseItem'
import { useReaderStore } from '../store/useReaderStore'
import type { ChapterData } from '../types/bible'

interface Props {
  chapter: ChapterData
  highlightVerse: number | null
  speakingVerse: number | null
  rtl: boolean
  bodyClass?: string
  bookId: string
  chapterNum: number
}

const VerseList = memo(function VerseList({ chapter, highlightVerse, speakingVerse, rtl, bodyClass, bookId, chapterNum }: Props) {
  const fontSize = useReaderStore((s) => s.fontSize)
  const markedVerses = useReaderStore((s) => s.markedVerses)
  const toggleMarkedVerse = useReaderStore((s) => s.toggleMarkedVerse)
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
          speaking={speakingVerse === Number(num)}
          marked={markedVerses.includes(`${bookId}/${chapterNum}/${num}`)}
          onDoubleClick={() => toggleMarkedVerse(bookId, chapterNum, num)}
          rtl={rtl}
          fontSize={fontSize}
          bodyClass={bodyClass}
        />
      ))}
    </div>
  )
})

export default VerseList