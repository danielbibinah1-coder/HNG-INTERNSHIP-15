import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../store'
import type { Task } from '../../types'
import PriorityBadge from './PriorityBadge'

interface Props {
  task: Task
  active?: boolean
  large?: boolean
  onActivate?: () => void
}

export default function TaskItem({ task, active = false, large = false, onActivate }: Props) {
  const { toggleTask, deleteTask, updateTask, setTaskPriority } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) updateTask(task.id, trimmed)
    else setDraft(task.title)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(task.title)
    setEditing(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    if (event.key === 'Escape') cancel()
  }

  const rowClass = [
    'task-row group/task',
    task.completed ? 'task-row--done' : '',
    active ? 'task-row--active' : '',
    large ? 'rounded-xl border border-[rgba(255,23,68,0.35)] bg-[rgba(255,23,68,0.05)] px-3.5 py-4 !border-b' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={rowClass} onClick={onActivate}>
      <button
        type="button"
        className={`task-check ${task.completed ? 'task-check--done' : ''} ${large ? 'h-5 w-5' : ''}`}
        aria-pressed={task.completed}
        aria-label={task.completed ? `Reopen "${task.title}"` : `Complete "${task.title}"`}
        onClick={(event) => {
          event.stopPropagation()
          toggleTask(task.id)
        }}
      >
        <Check size={large ? 13 : 11} strokeWidth={3} />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          className="field min-w-0 flex-1 py-1.5"
          value={draft}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          aria-label="Edit task title"
          maxLength={160}
        />
      ) : (
        <span
          className={`task-title min-w-0 flex-1 cursor-default select-none truncate ${
            large ? 'text-[15.5px] font-medium' : 'text-[13px]'
          }`}
          title="Double-click to edit"
          onDoubleClick={(event) => {
            event.stopPropagation()
            setEditing(true)
          }}
        >
          {task.title}
        </span>
      )}

      <PriorityBadge priority={task.priority} onChange={(priority) => setTaskPriority(task.id, priority)} />

      {!large && (
        <span className="flex flex-none items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/task:opacity-100 group-focus-within/task:opacity-100">
          <button
            type="button"
            className="icon-btn h-7 w-7"
            title={`Edit "${task.title}"`}
            onClick={(event) => {
              event.stopPropagation()
              setEditing(true)
            }}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            className="icon-btn h-7 w-6 hover:!text-neon-2"
            title={`Delete "${task.title}"`}
            onClick={(event) => {
              event.stopPropagation()
              deleteTask(task.id)
            }}
          >
            <Trash2 size={12} />
          </button>
        </span>
      )}
    </li>
  )
}
