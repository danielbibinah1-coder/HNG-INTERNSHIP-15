import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  ChatMessage,
  Group,
  PersistedState,
  Priority,
  Project,
  SortMode,
  Task,
  TaskFilter,
  Theme,
  View,
} from './types'

const STORAGE_KEY = 'taskmaster.state.v1'

export const SUGGESTED_PROMPTS: string[] = [
  'Can you help me with my first task?',
  'Create a template for a product design doc',
  'What is the SQL query for sorting by date?',
]

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function nextPriority(current: Priority): Priority {
  if (current === 'high') return 'medium'
  if (current === 'medium') return 'low'
  return 'high'
}

function seedState(): PersistedState {
  const now = Date.now()
  return {
    tasks: [
      { id: 'task-1', title: 'Create design system', priority: 'high', completed: false, projectId: 'proj-odama', createdAt: now },
      { id: 'task-2', title: 'Create 5 alternative hero section', priority: 'medium', completed: false, projectId: 'proj-odama', createdAt: now + 1 },
      { id: 'task-3', title: 'Upload dribbble shot', priority: 'low', completed: false, projectId: 'proj-dribbble', createdAt: now + 2 },
    ],
    projects: [
      { id: 'proj-odama', name: 'Odama Website', groupId: 'group-projects' },
      { id: 'proj-dribbble', name: 'Dribbble', groupId: 'group-projects' },
      { id: 'proj-personal', name: 'Personal Project', groupId: null },
    ],
    groups: [{ id: 'group-projects', name: 'Projects', collapsed: false }],
    chat: [],
    theme: 'dark',
    selectedProjectId: null,
    sharingEnabled: false,
    premium: false,
    sortMode: 'manual',
  }
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return { ...seedState(), ...parsed }
  } catch {
    return seedState()
  }
}

/** Mocked assistant with light keyword intelligence + real task awareness. */
function craftReply(input: string, tasks: Task[]): string {
  const q = input.toLowerCase()
  const open = tasks.filter((t) => !t.completed)

  if (q.includes('first task')) {
    const first = tasks[0]
    if (!first) return "You don't have any tasks yet — add your first one and I'll help you break it down."
    if (first.completed) return `Your first task, "${first.title}", is already complete. Nice — next up is ${open[0]?.title ?? 'nothing, you are all caught up'}.\n\nWant me to draft a quick plan for it?`
    return `Your first task is "${first.title}" (${first.priority} priority).\n\nA practical way to start:\n1. Define the scope — what's in, what's out.\n2. List the core pieces (colors, type, spacing, components).\n3. Build the smallest working set first, then iterate.\n\nWant me to turn those into sub-tasks in your list?`
  }

  if (q.includes('template') || q.includes('product design doc') || q.includes('design doc')) {
    return 'Here is a clean product design doc template:\n\n1. Problem — what hurts, for whom, and why now.\n2. Goals / non-goals — measurable outcomes.\n3. Users & research — key insights cited.\n4. Proposal — flows, wireframes, key decisions.\n5. Alternatives — considered options and trade-offs.\n6. Risks & open questions.\n7. Launch plan — milestones, owners, metrics.\n\nKeep each section short; link out for detail.'
  }

  if (q.includes('sql') || q.includes('sort by date') || q.includes('order by')) {
    return 'To sort rows by date in SQL:\n\nSELECT *\nFROM tasks\nORDER BY created_at DESC;\n\nUse ASC for oldest-first. For a stable result with equal dates, add a tiebreaker:\n\nORDER BY created_at DESC, id ASC;'
  }

  if (q.includes('hero')) {
    return 'For 5 alternative hero directions, try varying one axis at a time:\n\n1. Editorial — oversized headline, minimal art.\n2. Product-first — large UI screenshot with soft glow.\n3. Split layout — copy left, visual right.\n4. Social proof — headline above logos/testimonials.\n5. Motion-led — subtle gradient shift behind the headline.\n\nKeep the CTA identical across all five so the test stays clean.'
  }

  if (q.includes('dribbble')) {
    return 'Before uploading the Dribbble shot: export at 1600×1200, add a short descriptive title, tag only what is genuinely relevant, and schedule it for Tuesday–Thursday morning — that is when saves peak.'
  }

  if (q.includes('focus')) {
    return 'Turn on Focus Mode from the Today Task card. It dims the sidebar and assistant, promotes one active task, and gives you a "Complete & next" button so you can work in one loop without distractions.'
  }

  if (q.includes('priorit')) {
    if (open.length === 0) return 'You have no open tasks right now — everything is complete.'
    const high = open.filter((t) => t.priority === 'high')
    return `You have ${open.length} open task${open.length === 1 ? '' : 's'}${high.length ? `, ${high.length} marked high` : ''}. I would finish the high-priority items first, then batch the rest by effort — small wins first to keep momentum.`
  }

  return `Good question. Here is how I would approach "${input.trim()}":\n\n1. Clarify the outcome — what does "done" look like?\n2. List constraints — time, tools, people.\n3. Sketch the smallest first step and do it now.\n4. Review, then expand only what worked.\n\nTell me more context and I can get specific.`
}

interface AppContextValue {
  /* persisted */
  tasks: Task[]
  projects: Project[]
  groups: Group[]
  chat: ChatMessage[]
  theme: Theme
  selectedProjectId: string | null
  sharingEnabled: boolean
  premium: boolean
  sortMode: SortMode
  /* session UI */
  view: View
  filter: TaskFilter
  search: string
  focusMode: boolean
  activeTaskId: string | null
  sidebarCollapsed: boolean
  sidebarDrawerOpen: boolean
  aiOpen: boolean
  aiDrawerOpen: boolean
  aiFocusTick: number
  upgradeOpen: boolean
  signedOut: boolean
  typing: boolean
  /* actions */
  setView: (v: View) => void
  setFilter: (f: TaskFilter) => void
  setSearch: (s: string) => void
  setFocusMode: (b: boolean) => void
  setActiveTaskId: (id: string | null) => void
  setSidebarCollapsed: (b: boolean) => void
  setSidebarDrawerOpen: (b: boolean) => void
  setAiOpen: (b: boolean) => void
  setAiDrawerOpen: (b: boolean) => void
  openAi: () => void
  setUpgradeOpen: (b: boolean) => void
  setSignedOut: (b: boolean) => void
  setTheme: (t: Theme) => void
  setSortMode: (s: SortMode) => void
  addTask: (title: string, priority: Priority) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, title: string) => void
  deleteTask: (id: string) => void
  setTaskPriority: (id: string, priority: Priority) => void
  completeTasks: (ids: string[]) => void
  clearCompleted: () => void
  resetDemo: () => void
  addProject: (name: string) => void
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  toggleGroup: (id: string) => void
  renameGroup: (id: string, name: string) => void
  deleteGroup: (id: string) => void
  selectProject: (id: string | null) => void
  toggleSharing: () => void
  upgrade: () => void
  sendChat: (text: string) => void
  clearChat: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(loadState)
  const [view, setView] = useState<View>('todo')
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [search, setSearch] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [aiFocusTick, setAiFocusTick] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [typing, setTyping] = useState(false)

  const { tasks, projects, groups, chat, theme, selectedProjectId, sharingEnabled, premium, sortMode } = persisted
  const set = <K extends keyof PersistedState>(key: K, value: PersistedState[K]) => {
    setPersisted((prev) => ({ ...prev, [key]: value }))
  }

  /* Keep latest tasks available to the mocked assistant. */
  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  /* Persist to localStorage. */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch {
      /* storage unavailable */
    }
  }, [persisted])

  /* Apply theme to <html>. */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* Chat typing timer cleanup. */
  const chatTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (chatTimer.current !== null) window.clearTimeout(chatTimer.current)
    },
    [],
  )

  /* ---- task actions ---- */
  const addTask = (title: string, priority: Priority) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const projectId = selectedProjectId ?? projects[0]?.id ?? null
    const task: Task = {
      id: uid(),
      title: trimmed,
      priority,
      completed: false,
      projectId,
      createdAt: Date.now(),
    }
    setPersisted((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
  }

  const toggleTask = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }))
  }

  const updateTask = (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
    }))
  }

  const deleteTask = (id: string) => {
    setPersisted((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
    setActiveTaskId((current) => (current === id ? null : current))
  }

  const setTaskPriority = (id: string, priority: Priority) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, priority } : t)),
    }))
  }

  const completeTasks = (ids: string[]) => {
    const idSet = new Set(ids)
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (idSet.has(t.id) ? { ...t, completed: true } : t)),
    }))
  }

  const clearCompleted = () => {
    setPersisted((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => !t.completed) }))
  }

  const resetDemo = () => {
    setPersisted(seedState())
    setActiveTaskId(null)
    setFilter('all')
    setSearch('')
  }

  /* ---- project / group actions ---- */
  const addProject = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const targetGroup = groups[0]?.id ?? null
    const project: Project = { id: uid(), name: trimmed, groupId: targetGroup }
    setPersisted((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
      groups: prev.groups.map((g) => (g.id === targetGroup ? { ...g, collapsed: false } : g)),
    }))
  }

  const renameProject = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setPersisted((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
    }))
  }

  const deleteProject = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      tasks: prev.tasks.filter((t) => t.projectId !== id),
      selectedProjectId: prev.selectedProjectId === id ? null : prev.selectedProjectId,
    }))
  }

  const toggleGroup = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g)),
    }))
  }

  const renameGroup = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setPersisted((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, name: trimmed } : g)),
    }))
  }

  const deleteGroup = (id: string) => {
    setPersisted((prev) => {
      const childIds = new Set(prev.projects.filter((p) => p.groupId === id).map((p) => p.id))
      return {
        ...prev,
        groups: prev.groups.filter((g) => g.id !== id),
        projects: prev.projects.filter((p) => p.groupId !== id),
        tasks: prev.tasks.filter((t) => !t.projectId || !childIds.has(t.projectId)),
        selectedProjectId: childIds.has(prev.selectedProjectId ?? '') ? null : prev.selectedProjectId,
      }
    })
  }

  const selectProject = (id: string | null) => {
    set('selectedProjectId', selectedProjectId === id ? null : id)
  }

  /* ---- misc persisted actions ---- */
  const toggleSharing = () => set('sharingEnabled', !sharingEnabled)
  const upgrade = () => set('premium', true)

  /* ---- AI chat ---- */
  const sendChat = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    const userMessage: ChatMessage = { id: uid(), role: 'user', content: trimmed }
    setPersisted((prev) => ({ ...prev, chat: [...prev.chat, userMessage] }))
    setTyping(true)
    const reply = craftReply(trimmed, tasksRef.current)
    const delay = 900 + Math.random() * 700
    chatTimer.current = window.setTimeout(() => {
      setPersisted((prev) => ({
        ...prev,
        chat: [...prev.chat, { id: uid(), role: 'assistant', content: reply }],
      }))
      setTyping(false)
      chatTimer.current = null
    }, delay)
  }

  const clearChat = () => set('chat', [])

  const openAi = () => {
    setAiOpen(true)
    setAiDrawerOpen(true)
    setAiFocusTick((n) => n + 1)
  }

  const value: AppContextValue = {
    tasks,
    projects,
    groups,
    chat,
    theme,
    selectedProjectId,
    sharingEnabled,
    premium,
    sortMode,
    view,
    filter,
    search,
    focusMode,
    activeTaskId,
    sidebarCollapsed,
    sidebarDrawerOpen,
    aiOpen,
    aiDrawerOpen,
    aiFocusTick,
    upgradeOpen,
    signedOut,
    typing,
    setView,
    setFilter,
    setSearch,
    setFocusMode,
    setActiveTaskId,
    setSidebarCollapsed,
    setSidebarDrawerOpen,
    setAiOpen,
    setAiDrawerOpen,
    openAi,
    setUpgradeOpen,
    setSignedOut,
    setTheme: (t) => set('theme', t),
    setSortMode: (s) => set('sortMode', s),
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    setTaskPriority,
    completeTasks,
    clearCompleted,
    resetDemo,
    addProject,
    renameProject,
    deleteProject,
    toggleGroup,
    renameGroup,
    deleteGroup,
    selectProject,
    toggleSharing,
    upgrade,
    sendChat,
    clearChat,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}



