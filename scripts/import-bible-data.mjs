/**
 * Script de importação de dados bíblicos
 *
 * Fontes:
 *   - github.com/thiagobodruk/biblia — ARC (acf), ARA (aa), NVI (pt-BR)
 *   - github.com/scrollmapper/bible_databases — KJV, RVR (SpaRV), GRK (TR), HEB (HebModern)
 *
 * Uso:
 *   node scripts/import-bible-data.mjs          ← importa todas
 *   node scripts/import-bible-data.mjs ARA      ← importa só ARA
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'app', 'public', 'data')

// ─── Mapeamento livro (thiagobodruk abbrev → ID do projeto) ──────────────────
const THIAGO_ABBREV_TO_ID = {
  gn:'GEN', ex:'EXO', lv:'LEV', nm:'NUM', dt:'DEU', js:'JOS', jz:'JDG',
  rt:'RUT', '1sm':'1SA', '2sm':'2SA', '1rs':'1KI', '2rs':'2KI',
  '1cr':'1CH', '2cr':'2CH', ed:'EZR', ne:'NEH', et:'EST', 'jó':'JOB',
  job:'JOB', sl:'PSA', pv:'PRO', ec:'ECC', ct:'SNG', is:'ISA', jr:'JER',
  lm:'LAM', ez:'EZK', dn:'DAN', os:'HOS', jl:'JOL', am:'AMO', ob:'OBA',
  jn:'JON', jo:'JHN', mq:'MIC', na:'NAH', hc:'HAB', sf:'ZEP', ag:'HAG',
  zc:'ZEC', ml:'MAL',
  mt:'MAT', mc:'MRK', lc:'LUK', at:'ACT', rm:'ROM',
  '1co':'1CO', '2co':'2CO', gl:'GAL', ef:'EPH', fp:'PHP', cl:'COL',
  '1ts':'1TH', '2ts':'2TH', '1tm':'1TI', '2tm':'2TI', tt:'TIT', fm:'PHM',
  hb:'HEB_NT', tg:'JAS', '1pe':'1PE', '2pe':'2PE', '1jo':'1JN',
  '2jo':'2JN', '3jo':'3JN', jd:'JUD', ap:'REV',
}

// ─── Mapeamento livro (scrollmapper name → ID do projeto) ────────────────────
const SCROLLMAPPER_NAME_TO_ID = {
  'Genesis':'GEN','Exodus':'EXO','Leviticus':'LEV','Numbers':'NUM',
  'Deuteronomy':'DEU','Joshua':'JOS','Judges':'JDG','Ruth':'RUT',
  '1 Samuel':'1SA','2 Samuel':'2SA','1 Kings':'1KI','2 Kings':'2KI',
  '1 Chronicles':'1CH','2 Chronicles':'2CH','Ezra':'EZR','Nehemiah':'NEH',
  'Esther':'EST','Job':'JOB','Psalms':'PSA','Proverbs':'PRO',
  'Ecclesiastes':'ECC','Song of Solomon':'SNG','Isaiah':'ISA',
  'Jeremiah':'JER','Lamentations':'LAM','Ezekiel':'EZK','Daniel':'DAN',
  'Hosea':'HOS','Joel':'JOL','Amos':'AMO','Obadiah':'OBA','Jonah':'JON',
  'Micah':'MIC','Nahum':'NAH','Habakkuk':'HAB','Zephaniah':'ZEP',
  'Haggai':'HAG','Zechariah':'ZEC','Malachi':'MAL',
  'Matthew':'MAT','Mark':'MRK','Luke':'LUK','John':'JHN','Acts':'ACT',
  'Romans':'ROM','1 Corinthians':'1CO','2 Corinthians':'2CO',
  'Galatians':'GAL','Ephesians':'EPH','Philippians':'PHP',
  'Colossians':'COL','1 Thessalonians':'1TH','2 Thessalonians':'2TH',
  '1 Timothy':'1TI','2 Timothy':'2TI','Titus':'TIT','Philemon':'PHM',
  'Hebrews':'HEB_NT','James':'JAS','1 Peter':'1PE','2 Peter':'2PE',
  '1 John':'1JN','2 John':'2JN','3 John':'3JN','Jude':'JUD',
  'Revelation':'REV',
}

const THIAGO_BASE = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json'
const SCROLL_BASE = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json'

const SOURCES = {
  ARC:  { url: `${THIAGO_BASE}/acf.json`,        format: 'thiagobodruk' },
  ARA:  { url: `${THIAGO_BASE}/aa.json`,          format: 'thiagobodruk' },
  NVI:  { url: `${THIAGO_BASE}/nvi.json`,         format: 'thiagobodruk' },
  KJV:  { url: `${SCROLL_BASE}/KJV.json`,         format: 'scrollmapper' },
  RVR:  { url: `${SCROLL_BASE}/SpaRV.json`,       format: 'scrollmapper' },
  GRK:  { url: `${SCROLL_BASE}/TR.json`,          format: 'scrollmapper' },
  HEB:  { url: `${SCROLL_BASE}/HebModern.json`,   format: 'scrollmapper' },
  // NTLH e ARA_ORIG não possuem fontes abertas disponíveis
}

// ─── Conversores ──────────────────────────────────────────────────────────────
function convertThiagobodruk(raw, versionId) {
  let converted = 0
  for (const book of raw) {
    const projectId = THIAGO_ABBREV_TO_ID[book.abbrev?.toLowerCase()]
    if (!projectId) {
      console.warn(`  [AVISO] Abreviação desconhecida: "${book.abbrev}"`)
      continue
    }

    const chaptersObj = {}
    book.chapters.forEach((verses, chIdx) => {
      const chapNum = String(chIdx + 1)
      chaptersObj[chapNum] = {}
      verses.forEach((text, vIdx) => {
        chaptersObj[chapNum][String(vIdx + 1)] = text
      })
    })

    saveBook(versionId, projectId, { version: versionId, book: projectId, chapters: chaptersObj })
    converted++
  }
  console.log(`  ✓ ${converted} livros salvos`)
}

function convertScrollmapper(raw, versionId) {
  let converted = 0
  for (const book of raw.books) {
    const projectId = SCROLLMAPPER_NAME_TO_ID[book.name]
    if (!projectId) {
      console.warn(`  [AVISO] Nome de livro desconhecido: "${book.name}"`)
      continue
    }

    const chaptersObj = {}
    for (const chapter of book.chapters) {
      const chapNum = String(chapter.chapter)
      chaptersObj[chapNum] = {}
      for (const verse of chapter.verses) {
        chaptersObj[chapNum][String(verse.verse)] = verse.text
      }
    }

    saveBook(versionId, projectId, { version: versionId, book: projectId, chapters: chaptersObj })
    converted++
  }
  console.log(`  ✓ ${converted} livros salvos`)
}

function saveBook(version, bookId, data) {
  const dir = join(OUTPUT_DIR, version)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${bookId}.json`), JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Fetch com retry ─────────────────────────────────────────────────────────
async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (i === retries - 1) throw err
      console.warn(`  Tentativa ${i + 1} falhou, aguardando ${i + 1}s…`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

// ─── Principal ────────────────────────────────────────────────────────────────
async function importVersion(versionId) {
  const source = SOURCES[versionId]
  if (!source) {
    console.error(`Versão desconhecida: ${versionId}`)
    console.error(`Versões disponíveis: ${Object.keys(SOURCES).join(', ')}`)
    process.exit(1)
  }

  console.log(`\nImportando ${versionId}…`)
  console.log(`  Fonte: ${source.url}`)

  const raw = await fetchJson(source.url)

  if (source.format === 'thiagobodruk') convertThiagobodruk(raw, versionId)
  else if (source.format === 'scrollmapper') convertScrollmapper(raw, versionId)
}

async function main() {
  const target = process.argv[2]

  if (target) {
    await importVersion(target.toUpperCase())
  } else {
    for (const versionId of Object.keys(SOURCES)) {
      await importVersion(versionId)
    }
  }

  console.log(`\nImportação concluída. Arquivos em: ${OUTPUT_DIR}`)
}

main().catch(err => {
  console.error('\nErro:', err.message)
  process.exit(1)
})
