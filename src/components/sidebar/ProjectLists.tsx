import { useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Check, ChevronRight, Folder, FolderOpen, List, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useApp } from '../../store'

interface RowProps {
  label: string
  icon: ReactNode
  selected?: boolean
  chevron?: { expanded: boolean; onClick: () => void }
  indent?: boolean
  onLabelClick: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

function Row({ label, icon, selected, chevron, indent, onLabelClick, onRename, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const [confirming, setConfirming] = useState(false)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) onRename(trimmed)
    setEditing(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    if (event.key === 'Escape') {
      setDraft(label)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="field py-1.5 text-[12.5px]"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        aria-label={`Rename ${label}`}
      />
    )
  }

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 rounded-lg border border-[rgba(255,23,68,0.4)] bg-[rgba(255,23,68,0.07)] px-2 py-1.5 ${indent ? 'ml-6' : ''}`}>
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-neon-2">Delete “{label}”?</span>
        <button type="button" className="icon-btn h-6 w-6 !text-neon-2" title="Confirm delete" onClick={() => { onDelete(); setConfirming(false) }}>
          <Check size={12} />
        </button>
        <button type="button" className="icon-btn h-6 w-6" title="Cancel" onClick={() => setConfirming(false)}>
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="group/row flex items-center gap-1 rounded-lg transition-colors duration-150 hover:bg-panel-3">
      {chevron ? (
        <button type="button" className="icon-btn h-6 w-6 flex-none" title={chevron.expanded ? 'Collapse' : 'Expand'} onClick={chevron.onClick}>
          <ChevronRight size={12} className="transition-transform duration-150" style={{ transform: chevron.expanded ? 'rotate(90deg)' : 'none' }} />
        </button>
      ) : (
        <span className="w-6 flex-none" />
      )}
      <button
        type="button"
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1.5 text-left text-[12.5px] transition-colors duration-150 ${selected ? 'text-neon-2' : 'text-ink-2 hover:text-ink'}`}
        onClick={onLabelClick}
        title={label}
      >
        <span className={selected ? 'text-neon-2' : 'text-ink-3'}>{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
      <span className="flex flex-none items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 focus-within:opacity-100">
        <button type="button" className="icon-btn h-6 w-6" title={`Rename ${label}`} onClick={() => { setDraft(label); setEditing(true) }}>
          <Pencil size={11} />
        </button>
        <button type="button" className="icon-btn h-6 w-6 hover:!text-neon-2" title={`Delete ${label}`} onClick={() => setConfirming(true)}>
          <Trash2 size={11} />
        </button>
      </span>
    </div>
  )
}

export default function ProjectLists() {
  const {
    groups,
    projects,
    selectedProjectId,
    selectProject,
    toggleGroup,
    renameGroup,
    deleteGroup,
    renameProject,
    deleteProject,
    addProject,
  } = useApp()
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')

  const commitAdd = () => {
    const trimmed = draftName.trim()
    if (trimmed) addProject(trimmed)
    setDraftName('')
    setAdding(false)
  }

  return (
    <section aria-label="Lists">
      <div className="mb-2 flex items-center justify-between px-2">
        <p className="kicker">Lists</p>
        <button
          type="button"
          className="grid h-5 w-5 place-content-center rounded-full bg-neon text-white shadow-[0_0_10px_-4px_var(--glow)] transition-transform duration-150 hover:scale-110"
          title="New list"
          onClick={() => setAdding(true)}
        >
          <Plus size={12} />
        </button>
      </div>

      {adding && (
        <input
          autoFocus
          className="field mb-2 py-1.5 text-[12.5px]"
          placeholder="List name — press Enter"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitAdd()
            if (event.key === 'Escape') {
              setDraftName('')
              setAdding(false)
            }
          }}
          onBlur={commitAdd}
          aria-label="New list name"
        />
      )}

      <div className="space-y-0.5">
        {groups.map((group) => {
          const children = projects.filter((project) => project.groupId === group.id)
          const expanded = !group.collapsed
          return (
            <div key={group.id}>
              <Row
                label={group.name}
                icon={expanded ? <FolderOpen size={13} /> : <Folder size={13} />}
                chevron={{ expanded, onClick: () => toggleGroup(group.id) }}
                onLabelClick={() => toggleGroup(group.id)}
                onRename={(name) => renameGroup(group.id, name)}
                onDelete={() => deleteGroup(group.id)}
              />
              {expanded && (
                <div className="ml-3 space-y-0.5 border-l border-line pl-2">
                  {children.map((project) => (
                    <Row
                      key={project.id}
                      label={project.name}
                      icon={<List size={13} />}
                      indent
                      selected={selectedProjectId === project.id}
                      onLabelClick={() => selectProject(project.id)}
                      onRename={(name) => renameProject(project.id, name)}
                      onDelete={() => deleteProject(project.id)}
                    />
                  ))}
                  {children.length === 0 && (
                    <p className="py-1 pl-8 text-[11px] italic text-ink-3">No lists yet</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {projects
          .filter((project) => project.groupId === null)
          .map((project) => (
            <Row
              key={project.id}
              label={project.name}
              icon={<Folder size={13} />}
              selected={selectedProjectId === project.id}
              onLabelClick={() => selectProject(project.id)}
              onRename={(name) => renameProject(project.id, name)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
      </div>
    </section>
  )
}

