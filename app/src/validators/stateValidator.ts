import { BOOKS } from '../data/booksIndex'
import { VERSIONS, DEFAULT_VERSION } from '../data/versions'
import type { VersionMeta } from '../types/bible'

export function getValidVersion(versionId: string, bookId: string): string {
  const version = VERSIONS.find(v => v.id === versionId)
  const book = BOOKS.find(b => b.id === bookId)

  if (!version || !book) return DEFAULT_VERSION
  if (version.testament === 'ALL') return versionId
  if (version.testament === book.testament) return versionId

  return DEFAULT_VERSION
}

export function getCompatibleVersions(bookId: string): VersionMeta[] {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) return VERSIONS.filter(v => v.testament === 'ALL')
  return VERSIONS.filter(v => v.testament === 'ALL' || v.testament === book.testament)
}

export function getValidChapter(chapter: number, bookId: string): number {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) return 1
  if (chapter < 1) return 1
  if (chapter > book.chapters) return book.chapters
  return chapter
}
