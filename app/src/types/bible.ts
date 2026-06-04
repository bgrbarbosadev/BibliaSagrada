export type Testament = 'OT' | 'NT';
export type TextDirection = 'ltr' | 'rtl';

export interface BookMeta {
  id: string;
  name: string;
  testament: Testament;
  chapters: number;
}

export interface VersionMeta {
  id: string;
  name: string;
  language: string;
  direction: TextDirection;
  testament: Testament | 'ALL';
}

export type ChapterData = Record<string, string>;

export interface BookData {
  version: string;
  book: string;
  chapters: Record<string, ChapterData>;
}
