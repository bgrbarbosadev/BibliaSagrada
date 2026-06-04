<#
.SYNOPSIS
  Importa versoes biblicas para o projeto BibliaSagrada

.PARAMETER Version
  Versao especifica (ARC, ARA, NVI, KJV, RVR, GRK, HEB). Se omitido, importa todas.

.EXAMPLE
  .\scripts\import-bible-data.ps1
  .\scripts\import-bible-data.ps1 -Version ARA
#>

param([string]$Version = '')

$ErrorActionPreference = 'Stop'
$OutputDir = Join-Path $PSScriptRoot "..\app\public\data"

# ---- Fontes -----------------------------------------------------------------
$ThiagoBase = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json"
$ScrollBase = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json"

$Sources = @{
  ARC = @{ Url = "$ThiagoBase/acf.json";       Format = 'thiagobodruk' }
  ARA = @{ Url = "$ThiagoBase/aa.json";         Format = 'thiagobodruk' }
  NVI = @{ Url = "$ThiagoBase/nvi.json";        Format = 'thiagobodruk' }
  KJV = @{ Url = "$ScrollBase/KJV.json";        Format = 'scrollmapper' }
  RVR = @{ Url = "$ScrollBase/SpaRV.json";      Format = 'scrollmapper' }
  GRK = @{ Url = "$ScrollBase/TR.json";         Format = 'scrollmapper' }
  HEB = @{ Url = "$ScrollBase/HebModern.json";  Format = 'scrollmapper' }
}

# ---- Mapeamento thiagobodruk abbrev -> ID do projeto ------------------------
$ThiagoMap = @{}
$ThiagoMap['gn']='GEN';  $ThiagoMap['ex']='EXO';  $ThiagoMap['lv']='LEV'
$ThiagoMap['nm']='NUM';  $ThiagoMap['dt']='DEU';  $ThiagoMap['js']='JOS'
$ThiagoMap['jz']='JDG';  $ThiagoMap['rt']='RUT';  $ThiagoMap['1sm']='1SA'
$ThiagoMap['2sm']='2SA'; $ThiagoMap['1rs']='1KI'; $ThiagoMap['2rs']='2KI'
$ThiagoMap['1cr']='1CH'; $ThiagoMap['2cr']='2CH'; $ThiagoMap['ed']='EZR'
$ThiagoMap['ne']='NEH';  $ThiagoMap['et']='EST';  $ThiagoMap['job']='JOB'
$ThiagoMap['sl']='PSA';  $ThiagoMap['pv']='PRO';  $ThiagoMap['ec']='ECC'
$ThiagoMap['ct']='SNG';  $ThiagoMap['is']='ISA';  $ThiagoMap['jr']='JER'
$ThiagoMap['lm']='LAM';  $ThiagoMap['ez']='EZK';  $ThiagoMap['dn']='DAN'
$ThiagoMap['os']='HOS';  $ThiagoMap['jl']='JOL';  $ThiagoMap['am']='AMO'
$ThiagoMap['ob']='OBA';  $ThiagoMap['jn']='JON';  $ThiagoMap['mq']='MIC'
$ThiagoMap['na']='NAH';  $ThiagoMap['hc']='HAB';  $ThiagoMap['sf']='ZEP'
$ThiagoMap['ag']='HAG';  $ThiagoMap['zc']='ZEC';  $ThiagoMap['ml']='MAL'
$ThiagoMap['mt']='MAT';  $ThiagoMap['mc']='MRK';  $ThiagoMap['lc']='LUK'
$ThiagoMap['jo']='JHN';  $ThiagoMap['at']='ACT';  $ThiagoMap['rm']='ROM'
$ThiagoMap['1co']='1CO'; $ThiagoMap['2co']='2CO'; $ThiagoMap['gl']='GAL'
$ThiagoMap['ef']='EPH';  $ThiagoMap['fp']='PHP';  $ThiagoMap['cl']='COL'
$ThiagoMap['1ts']='1TH'; $ThiagoMap['2ts']='2TH'; $ThiagoMap['1tm']='1TI'
$ThiagoMap['2tm']='2TI'; $ThiagoMap['tt']='TIT';  $ThiagoMap['fm']='PHM'
$ThiagoMap['hb']='HEB_NT'; $ThiagoMap['tg']='JAS'; $ThiagoMap['1pe']='1PE'
$ThiagoMap['2pe']='2PE'; $ThiagoMap['1jo']='1JN'; $ThiagoMap['2jo']='2JN'
$ThiagoMap['3jo']='3JN'; $ThiagoMap['jd']='JUD';  $ThiagoMap['ap']='REV'
# Variacoes de abreviacoes usadas em algumas versoes
$ThiagoMap['atos']='ACT'   # aa.json usa "atos" em vez de "at"
$ThiagoMap["j`u00f3"]='JOB'  # jo com acento (U+00F3) = Job em algumas versoes

# ---- Mapeamento scrollmapper name -> ID do projeto --------------------------
$ScrollMap = @{}
$ScrollMap['Genesis']='GEN';   $ScrollMap['Exodus']='EXO';     $ScrollMap['Leviticus']='LEV'
$ScrollMap['Numbers']='NUM';   $ScrollMap['Deuteronomy']='DEU'; $ScrollMap['Joshua']='JOS'
$ScrollMap['Judges']='JDG';    $ScrollMap['Ruth']='RUT';        $ScrollMap['1 Samuel']='1SA'
$ScrollMap['2 Samuel']='2SA';  $ScrollMap['1 Kings']='1KI';     $ScrollMap['2 Kings']='2KI'
$ScrollMap['1 Chronicles']='1CH'; $ScrollMap['2 Chronicles']='2CH'; $ScrollMap['Ezra']='EZR'
$ScrollMap['Nehemiah']='NEH';  $ScrollMap['Esther']='EST';      $ScrollMap['Job']='JOB'
$ScrollMap['Psalms']='PSA';    $ScrollMap['Proverbs']='PRO';    $ScrollMap['Ecclesiastes']='ECC'
$ScrollMap['Song of Solomon']='SNG'; $ScrollMap['Isaiah']='ISA'; $ScrollMap['Jeremiah']='JER'
$ScrollMap['Lamentations']='LAM'; $ScrollMap['Ezekiel']='EZK'; $ScrollMap['Daniel']='DAN'
$ScrollMap['Hosea']='HOS';     $ScrollMap['Joel']='JOL';        $ScrollMap['Amos']='AMO'
$ScrollMap['Obadiah']='OBA';   $ScrollMap['Jonah']='JON';       $ScrollMap['Micah']='MIC'
$ScrollMap['Nahum']='NAH';     $ScrollMap['Habakkuk']='HAB';    $ScrollMap['Zephaniah']='ZEP'
$ScrollMap['Haggai']='HAG';    $ScrollMap['Zechariah']='ZEC';   $ScrollMap['Malachi']='MAL'
$ScrollMap['Matthew']='MAT';   $ScrollMap['Mark']='MRK';        $ScrollMap['Luke']='LUK'
$ScrollMap['John']='JHN';      $ScrollMap['Acts']='ACT';        $ScrollMap['Romans']='ROM'
$ScrollMap['1 Corinthians']='1CO'; $ScrollMap['2 Corinthians']='2CO'
$ScrollMap['Galatians']='GAL'; $ScrollMap['Ephesians']='EPH';   $ScrollMap['Philippians']='PHP'
$ScrollMap['Colossians']='COL'; $ScrollMap['1 Thessalonians']='1TH'; $ScrollMap['2 Thessalonians']='2TH'
$ScrollMap['1 Timothy']='1TI'; $ScrollMap['2 Timothy']='2TI';   $ScrollMap['Titus']='TIT'
$ScrollMap['Philemon']='PHM';  $ScrollMap['Hebrews']='HEB_NT';  $ScrollMap['James']='JAS'
$ScrollMap['1 Peter']='1PE';   $ScrollMap['2 Peter']='2PE';     $ScrollMap['1 John']='1JN'
$ScrollMap['2 John']='2JN';    $ScrollMap['3 John']='3JN';      $ScrollMap['Jude']='JUD'
$ScrollMap['Revelation']='REV'; $ScrollMap['Revelation of John']='REV'
# Variacoes com numerais romanos usadas pelo scrollmapper
$ScrollMap['I Samuel']='1SA';  $ScrollMap['II Samuel']='2SA'
$ScrollMap['I Kings']='1KI';   $ScrollMap['II Kings']='2KI'
$ScrollMap['I Chronicles']='1CH'; $ScrollMap['II Chronicles']='2CH'
$ScrollMap['I Corinthians']='1CO'; $ScrollMap['II Corinthians']='2CO'
$ScrollMap['I Thessalonians']='1TH'; $ScrollMap['II Thessalonians']='2TH'
$ScrollMap['I Timothy']='1TI'; $ScrollMap['II Timothy']='2TI'
$ScrollMap['I Peter']='1PE';   $ScrollMap['II Peter']='2PE'
$ScrollMap['I John']='1JN';    $ScrollMap['II John']='2JN';  $ScrollMap['III John']='3JN'

# ---- Funcoes auxiliares -----------------------------------------------------
function Save-BookJson {
  param([string]$VersionId, [string]$BookId, $Data)
  $dir = Join-Path $OutputDir $VersionId
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $path = Join-Path $dir "$BookId.json"
  $Data | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
}

function Get-RemoteJson {
  param([string]$Url)
  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 120
  $bytes = $response.RawContentStream.ToArray()
  $text = [System.Text.Encoding]::UTF8.GetString($bytes).TrimStart([char]0xFEFF)
  return $text | ConvertFrom-Json
}

function ConvertFrom-ThiagobdrukFormat {
  param($Raw, [string]$VersionId)
  $count = 0
  foreach ($book in $Raw) {
    $abbrev = $book.abbrev.ToLower()
    # Normaliza 'jo' com acento (U+00F3) = "Jo" em pt-BR = Jó (Livro de Jó)
    if ($abbrev -ceq "j$([char]0x00F3)") { $abbrev = 'job' }
    $projectId = $ThiagoMap[$abbrev]
    if (-not $projectId) {
      # Try lookup after removing diacritics
      Write-Warning "[AVISO] Abreviacao nao mapeada: '$($book.abbrev)' (normalizado: '$abbrev')"
      continue
    }

    $chaptersObj = [ordered]@{}
    $chIdx = 0
    foreach ($verses in $book.chapters) {
      $chNum = [string]($chIdx + 1)
      $chaptersObj[$chNum] = [ordered]@{}
      $vIdx = 0
      foreach ($text in $verses) {
        $chaptersObj[$chNum][[string]($vIdx + 1)] = $text
        $vIdx++
      }
      $chIdx++
    }

    $data = [ordered]@{ version=$VersionId; book=$projectId; chapters=$chaptersObj }
    Save-BookJson -VersionId $VersionId -BookId $projectId -Data $data
    $count++
  }
  Write-Host "  OK: $count livros salvos"
}

function ConvertFrom-ScrollmapperFormat {
  param($Raw, [string]$VersionId)
  $count = 0
  foreach ($book in $Raw.books) {
    $projectId = $ScrollMap[$book.name]
    if (-not $projectId) {
      Write-Warning "[AVISO] Nome de livro nao mapeado: '$($book.name)'"
      continue
    }

    $chaptersObj = [ordered]@{}
    foreach ($chapter in $book.chapters) {
      $chNum = [string]$chapter.chapter
      $chaptersObj[$chNum] = [ordered]@{}
      foreach ($verse in $chapter.verses) {
        $chaptersObj[$chNum][[string]$verse.verse] = $verse.text
      }
    }

    $data = [ordered]@{ version=$VersionId; book=$projectId; chapters=$chaptersObj }
    Save-BookJson -VersionId $VersionId -BookId $projectId -Data $data
    $count++
  }
  Write-Host "  OK: $count livros salvos"
}

function Import-BibleVersion {
  param([string]$VersionId)
  $source = $Sources[$VersionId]
  if (-not $source) {
    Write-Error "Versao desconhecida: $VersionId. Disponiveis: $($Sources.Keys -join ', ')"
    exit 1
  }

  Write-Host ""
  Write-Host "Importando $VersionId ..."
  Write-Host "  Fonte: $($source.Url)"

  $raw = Get-RemoteJson -Url $source.Url

  switch ($source.Format) {
    'thiagobodruk' { ConvertFrom-ThiagobdrukFormat -Raw $raw -VersionId $VersionId }
    'scrollmapper' { ConvertFrom-ScrollmapperFormat -Raw $raw -VersionId $VersionId }
  }
}

# ---- Adiciona chave com 'Jo' acentuado para Job ------------------------------
$ThiagoMap["j$([char]0x00F3)"] = 'JOB'

# ---- Execucao ----------------------------------------------------------------
if ($Version) {
  Import-BibleVersion -VersionId $Version.ToUpper()
} else {
  foreach ($vid in @('ARC','ARA','NVI','KJV','RVR','GRK','HEB')) {
    Import-BibleVersion -VersionId $vid
  }
}

Write-Host ""
Write-Host "Importacao concluida. Arquivos em: $OutputDir"
