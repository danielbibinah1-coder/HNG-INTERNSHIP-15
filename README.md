# TaskMaster

A premium three-column productivity workspace — dark charcoal UI, neon red accents, built with **React 19 + TypeScript + Tailwind CSS v4 + Vite + Lucide icons**.

## Layout

- **Left** — navigation, project lists, upgrade card, theme switcher, account menu
- **Center** — greeting, workspace info, **Today Task** dashboard
- **Right** — **AI Assist** chat panel with suggested prompts

## Features

- Full task management: create, inline edit (✎ / double-click), delete, complete, priority cycling (High/Medium/Low)
- Filters `All · High · Medium · Low · Completed`, live search, sort by priority, clear completed, reset demo data
- Projects/lists: create (`+`), rename, delete (with confirm), expand/collapse groups, scope the dashboard by selecting a list
- **Focus Mode** — dims secondary UI, promotes one active task, “Complete & next” loop, Esc to exit
- **AI Assist** — suggested prompt pills, typing indicator, mocked context-aware replies, conversation history
- Light/Dark theme switcher (dark default), collapsible sidebar, working navigation views (Share, Analytics, Leaderboard, Invites, FAQs, Profile)
- Everything persists to `localStorage`
- Responsive: 3-column desktop → narrowed tablet → mobile drawers (sidebar + AI modal)

## Getting started

```bash
npm install     # install dependencies
npm run dev     # dev server → http://localhost:5173
```

## Production build

```bash
npm run build   # tsc type-check + vite build → dist/
npm run preview # serve the build → http://localhost:4173
```

## Structure

```
src/
├── main.tsx                 # React root (AppProvider)
├── App.tsx                  # shell: mobile bar + 3-column grid + overlays
├── store.tsx                # state, actions, persistence, mocked AI
├── types.ts                 # shared types
├── index.css                # design tokens, theme, components, animations
└── components/
    ├── Sidebar.tsx          # composes sidebar sections
    ├── sidebar/             # Logo, MainMenu, ProjectLists, UpgradeCard,
    │                        # ThemeSwitcher, UserProfile
    ├── Dashboard.tsx        # composes center column
    ├── dashboard/           # GreetingCard, ProfileCard, TodayTasks,
    │                        # TaskItem, PriorityBadge
    ├── AIAssistant.tsx      # right panel
    ├── ai/                  # ChatInput, ChatMessages
    ├── SimpleView.tsx       # secondary navigation views
    └── UpgradeModal.tsx     # premium upgrade dialog
```
