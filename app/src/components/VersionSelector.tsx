import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCompatibleVersions } from '../validators/stateValidator'
import { VERSIONS } from '../data/versions'

interface Props {
  currentVersion: string
  bookId: string
  isDark?: boolean
}

export default function VersionSelector({ currentVersion, bookId, isDark = false }: Props) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const compatibleVersions = getCompatibleVersions(bookId)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    const chapter = params.chapter ?? '1'
    const verse = searchParams.get('verse')
    const url = `/ler/${next}/${bookId}/${chapter}${verse ? `?verse=${verse}` : ''}`
    navigate(url)
  }

  const label = VERSIONS.find(v => v.id === currentVersion)?.name ?? currentVersion
  const selectCls = isDark
    ? 'border-white/20 text-white/90 bg-transparent'
    : 'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 bg-transparent'

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentVersion}
        onChange={handleChange}
        title={label}
        className={`text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${selectCls}`}
      >
        {compatibleVersions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.id} — {v.name}
          </option>
        ))}
      </select>
    </div>
  )
}