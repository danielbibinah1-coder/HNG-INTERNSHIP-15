import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Crosshair, Plus, RotateCcw, Search, Settings2, Sparkles, X } from 'lucide-react'
import { PRIORITY_ORDER, useApp } from '../../store'
import type { Priority, TaskFilter } from '../../types'
import TaskItem from './TaskItem'
import PriorityBadge from './PriorityBadge'

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'completed', label: 'Completed' },
]

const PRIORITY_LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }

export default function TodayTasks() {
  const {
    tasks,
    projects,
    selectedProjectId,
    selectProject,
    filter,
    setFilter,
    search,
    setSearch,
    sortMode,
    setSortMode,
    focusMode,
    setFocusMode,
    activeTaskId,
    setActiveTaskId,
    addTask,
    completeTasks,
    clearCompleted,
    resetDemo,
    openAi,
  } = useApp()

  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  /* Close the settings popover on outside click. */
  useEffect(() => {
    if (!settingsOpen) return
    const handleMouseDown = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [settingsOpen])

  /* Escape exits focus mode. */
  useEffect(() => {
    if (!focusMode) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusMode(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, setFocusMode])

  const scoped = useMemo(
    () => (selectedProjectId === null ? tasks : tasks.filter((task) => task.projectId === selectedProjectId)),
    [tasks, selectedProjectId],
  )

  const visible = useMemo(() => {
    let list = scoped
    if (filter === 'completed') list = list.filter((task) => task.completed)
    else if (filter === 'high' || filter === 'medium' || filter === 'low') {
      list = list.filter((task) => task.priority === filter)
    }
    const query = search.trim().toLowerCase()
    if (query) list = list.filter((task) => task.title.toLowerCase().includes(query))
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sortMode === 'priority') {
        const doneDelta = Number(a.completed) - Number(b.completed)
        if (doneDelta !== 0) return doneDelta
        const priorityDelta = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (priorityDelta !== 0) return priorityDelta
      }
      return a.createdAt - b.createdAt
    })
    return sorted
  }, [scoped, filter, search, sortMode])

  const openTasks = visible.filter((task) => !task.completed)
  const completedInScope = scoped.filter((task) => task.completed).length
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null
  const activeTask = visible.find((task) => task.id === activeTaskId) ?? null

  const enterFocus = () => {
    const candidate =
      activeTaskId && visible.some((task) => task.id === activeTaskId)
        ? activeTaskId
        : (openTasks[0]?.id ?? visible[0]?.id ?? null)
    setActiveTaskId(candidate)
    setFocusMode(true)
  }

  const completeAndNext = () => {
    if (!activeTask) return
    completeTasks([activeTask.id])
    const remaining = visible.filter((task) => !task.completed && task.id !== activeTask.id)
    setActiveTaskId(remaining[0]?.id ?? null)
  }

  const submitNewTask = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    addTask(trimmed, newPriority)
    setNewTitle('')
  }

  const upNext = visible.filter((task) => task.id !== activeTask?.id && !task.completed)

  return (
    <section
      className={`panel-card anim-fade-up flex-1 ${focusMode ? 'focus-lift' : ''}`}
      aria-label="Today's tasks"
      style={{ animationDelay: '60ms' }}
    >
      {/* ---------- header ---------- */}
      <header className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="flex-none text-[14.5px] font-semibold tracking-tight text-ink">Today Task</h2>
          {!focusMode &&
            (selectedProject ? (
              <button
                type="button"
                className="pill pill--active flex items-center gap-1 !py-1"
                title="Show all projects"
                onClick={() => selectProject(selectedProjectId)}
              >
                {selectedProject.name}
                <X size={10} />
              </button>
            ) : (
              <span className="truncate text-[11px] text-ink-3">All projects</span>
            ))}
          {focusMode && <span className="pill pill--active !py-1">Focus Mode</span>}
        </div>

        <div className="flex flex-none items-center gap-2">
          {focusMode ? (
            <button type="button" className="btn-outline" onClick={() => setFocusMode(false)}>
              <X size={13} />
              Exit Focus Mode
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={enterFocus}
                title="Dim distractions and work on one task"
              >
                <Crosshair size={13} />
                Focus Mode
              </button>
              <button type="button" className="btn-neon" onClick={openAi} title="Ask the AI assistant">
                <Sparkles size={13} />
                AI Assist
              </button>
            </>
          )}
        </div>
      </header>

      {focusMode ? (
        <>
          <div className="scroll-area min-h-0 flex-1 px-5 py-5">
            {activeTask ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--glow)]"
                    aria-hidden="true"
                  />
                  <span className="kicker">Current task</span>
                </div>
                <TaskItem task={activeTask} active large />

                {upNext.length > 0 && (
                  <div className="mt-6">
                    <p className="kicker mb-2">Up next</p>
                    <ul className="space-y-1">
                      {upNext.slice(0, 5).map((task) => (
                        <li key={task.id}>
                          <button type="button" className="nav-item" onClick={() => setActiveTaskId(task.id)}>
                            <span className="min-w-0 flex-1 truncate">{task.title}</span>
                            <PriorityBadge priority={task.priority} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-[14px] font-medium text-ink">All tasks complete</p>
                <p className="mx-auto mt-1.5 max-w-[300px] text-[12px] leading-relaxed text-ink-3">
                  You finished everything in this view. Exit focus mode when you are ready to plan the next batch.
                </p>
              </div>
            )}
          </div>

          <footer className="flex flex-none items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <span className="text-[11px] text-ink-3">Press Esc to exit</span>
            <button
              type="button"
              className="btn-neon"
              disabled={!activeTask || activeTask.completed}
              onClick={completeAndNext}
            >
              <Check size={14} />
              Complete &amp; next
            </button>
          </footer>
        </>
      ) : (
        <>
          <div className="flex flex-none flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill ${filter === option.value ? 'pill--active' : ''}`}
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
                aria-hidden="true"
              />
              <input
                className="field w-44 !py-1.5 !pl-7 text-[12px]"
                placeholder="Search tasks…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tasks"
              />
            </div>
          </div>

          <div className="scroll-area min-h-0 flex-1 px-5">
            {visible.length > 0 ? (
              <ul className="py-1">
                {visible.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    active={task.id === activeTaskId}
                    onActivate={() => setActiveTaskId(task.id)}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-[12.5px] text-ink-3">
                {tasks.length === 0
                  ? 'No tasks yet — add your first one below.'
                  : 'No tasks match your current filters.'}
              </p>
            )}
          </div>

          {adding && (
            <div className="flex flex-none flex-wrap items-center gap-2 border-t border-line bg-panel-2 px-5 py-3">
              <input
                autoFocus
                className="field min-w-[180px] flex-1 py-1.5"
                placeholder="Task title — press Enter to add"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitNewTask()
                  if (event.key === 'Escape') {
                    setNewTitle('')
                    setAdding(false)
                  }
                }}
                aria-label="New task title"
                maxLength={160}
              />
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    className={`pill ${newPriority === priority ? 'pill--active' : ''}`}
                    aria-pressed={newPriority === priority}
                    onClick={() => setNewPriority(priority)}
                  >
                    {PRIORITY_LABELS[priority]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn-neon !px-3 !py-1.5"
                disabled={newTitle.trim().length === 0}
                onClick={submitNewTask}
              >
                <Plus size={13} />
                Add
              </button>
              <button
                type="button"
                className="icon-btn h-7 w-7"
                title="Cancel"
                onClick={() => {
                  setNewTitle('')
                  setAdding(false)
                }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <footer className="flex flex-none items-center gap-2 border-t border-line px-5 py-3.5">
            <button
              type="button"
              className="btn-neon"
              disabled={openTasks.length === 0}
              title="Complete all visible tasks"
              onClick={() => completeTasks(openTasks.map((task) => task.id))}
            >
              Finish
              {openTasks.length > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 text-[10px] leading-4">{openTasks.length}</span>
              )}
            </button>
            <button type="button" className="btn-soft" onClick={() => setAdding((value) => !value)}>
              <Plus size={13} />
              Add Task
            </button>

            <div ref={settingsRef} className="relative ml-auto">
              <button
                type="button"
                className="icon-btn icon-btn--ring h-8 w-8"
                title="Task settings"
                aria-expanded={settingsOpen}
                aria-haspopup="menu"
                onClick={() => setSettingsOpen((value) => !value)}
              >
                <Settings2 size={14} />
              </button>
              {settingsOpen && (
                <div className="dropdown absolute bottom-full right-0 z-30 mb-2 w-52 p-1" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item disabled:opacity-40"
                    disabled={completedInScope === 0}
                    onClick={() => {
                      clearCompleted()
                      setSettingsOpen(false)
                    }}
                  >
                    <Check size={13} />
                    Clear completed
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item"
                    onClick={() => {
                      setSortMode(sortMode === 'manual' ? 'priority' : 'manual')
                      setSettingsOpen(false)
                    }}
                  >
                    <ArrowUpDown size={13} />
                    {sortMode === 'manual' ? 'Sort by priority' : 'Sort manually'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item dropdown-item--danger"
                    onClick={() => {
                      resetDemo()
                      setSettingsOpen(false)
                    }}
                  >
                    <RotateCcw size={13} />
                    Reset demo data
                  </button>
                </div>
              )}
            </div>
          </footer>
        </>
      )}
    </section>
  )
}



