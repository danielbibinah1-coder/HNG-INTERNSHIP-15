import { nextPriority } from '../../store'
import type { Priority } from '../../types'

const labels: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }

interface Props {
  priority: Priority
  onChange?: (priority: Priority) => void
}

export default function PriorityBadge({ priority, onChange }: Props) {
  const className = `badge badge-${priority}`

  if (!onChange) {
    return <span className={className}>{labels[priority]}</span>
  }

  return (
    <button
      type="button"
      className={className}
      title="Click to change priority"
      aria-label={`Priority ${labels[priority]}. Click to change.`}
      onClick={(event) => {
        event.stopPropagation()
        onChange(nextPriority(priority))
      }}
    >
      {labels[priority]}
    </button>
  )
}

