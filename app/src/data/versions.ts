import type { VersionMeta } from '../types/bible'

export const DEFAULT_VERSION = 'ARC'

export const VERSIONS: VersionMeta[] = [
  { id: 'ARC', name: 'Almeida Revista e Corrigida', language: 'pt-BR', direction: 'ltr', testament: 'ALL' },
  { id: 'ARA', name: 'Almeida Revista e Atualizada', language: 'pt-BR', direction: 'ltr', testament: 'ALL' },
  { id: 'NVI', name: 'Nova Versão Internacional', language: 'pt-BR', direction: 'ltr', testament: 'ALL' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje', language: 'pt-BR', direction: 'ltr', testament: 'ALL' },
  { id: 'KJV', name: 'King James Version', language: 'en', direction: 'ltr', testament: 'ALL' },
  { id: 'RVR', name: 'Reina-Valera Revisada', language: 'es', direction: 'ltr', testament: 'ALL' },
  { id: 'HEB', name: 'Hebraico (Texto Massorético)', language: 'he', direction: 'rtl', testament: 'OT' },
  { id: 'ARA_ORIG', name: 'Aramaico (Peshitta)', language: 'arc', direction: 'rtl', testament: 'OT' },
  { id: 'GRK', name: 'Grego Koiné (Textus Receptus)', language: 'el', direction: 'ltr', testament: 'NT' },
]
