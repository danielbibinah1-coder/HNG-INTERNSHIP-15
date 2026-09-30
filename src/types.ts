export type Priority = 'high' | 'medium' | 'low'

export type TaskFilter = 'all' | 'high' | 'medium' | 'low' | 'completed'

export type Theme = 'dark' | 'light'

export type View =
  | 'todo'
  | 'share'
  | 'analytics'
  | 'leaderboard'
  | 'invites'
  | 'faqs'
  | 'profile'

export interface Task {
  id: string
  title: string
  priority: Priority
  completed: boolean
  /** Project the task belongs to, or null when the workspace has no projects. */
  projectId: string | null
  createdAt: number
}

export interface Project {
  id: string
  name: string
  /** Parent group id, or null when the project sits at the top level. */
  groupId: string | null
}

export interface Group {
  id: string
  name: string
  collapsed: boolean
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export type SortMode = 'manual' | 'priority'

/** Full persisted application state (localStorage + server workspace blob). */
export interface PersistedState {
  tasks: Task[]
  projects: Project[]
  groups: Group[]
  chat: ChatMessage[]
  selectedProjectId: string | null
  sharingEnabled: boolean
  premium: boolean
  sortMode: SortMode
}
