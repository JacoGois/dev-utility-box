# Dev Utility Box

**A production-ready suite of developer tools running in a simulated desktop inside the browser.**  
Pomodoro, Kanban, knowledge base, JSON/SVG editors, encoders, data generation and more — in a single page, with draggable windows, theming and full state persistence.

---

## Overview

**DUB** is a modular web application that replicates a desktop environment in the browser. It consolidates daily dev utilities into one place: a lightweight, type-safe “OS” built for productivity and scalability.

- **Multi-window UX** — Drag, resize, minimize and maximize; focus and z-order are managed automatically.
- **Multi-instance apps** — Each app supports multiple open instances (e.g. several Kanban boards, several task lists) with isolated state.
- **Full persistence** — Window layout, dock configuration and per-app data persist across sessions via `localStorage`.
- **i18n** — Seven locales: English, Portuguese, Spanish, French, German, Japanese, Chinese.
- **Theming** — Ubuntu-, macOS- and Windows XP–inspired themes, plus system-aware light/dark mode.

---

## Included applications

| App                     | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Pomodoro**            | Focus timer with configurable work/break cycles.                                      |
| **Todo List**           | Task list with per-instance persistent state.                                         |
| **Kanban Board**        | Kanban board with columns, cards, subtasks, tags, priority and due dates.             |
| **Knowledge Base**      | Notion-style knowledge base: pages, favorites, icons and Markdown editor (MDXEditor). |
| **JSON Tools**          | Validation, formatting and manipulation of JSON.                                      |
| **Encoders & Decoders** | Base64, JWT, URL and other encode/decode tools.                                       |
| **Data Generator**      | Synthetic data generation (names, emails, etc.) with Faker.                           |
| **Mass Data Generator** | Bulk JSON generation with templates and Faker.                                        |
| **Image Text Lab**      | Image and text tools (OCR with Tesseract, etc.).                                      |
| **Schema Lab**          | JSON Schema validation, type and example generation.                                  |
| **SVG Lab**             | SVG editing and recolor (simple and advanced modes).                                  |
| **Auth**                | Authentication flows and JWT for testing.                                             |

Apps are **fully decoupled**: each runs in its own window with isolated state and can be extended or replaced without affecting the rest of the system.

---

## How it works

### User flow

1. **Desktop** — Wallpaper, icons and theme define the workspace.
2. **Dock** — Pinned and open apps; shortcuts can be added or removed.
3. **Launcher** — Spotlight-style app list; **Ctrl+K** / **Cmd+K** for quick search.
4. **Windows** — Per-app windows with title bar (min/max/close), drag and resize; focus and stacking are handled by the shell.
5. **Persistence** — Layout, dock and per-app state are saved and restored on reload.

### Technical design

- **App registry** (`src/lib/apps.ts`) — Single source of truth: name, icon, component, instance limits, min/max window size. The only coupling point between apps and the desktop core.
- **Window shell** — `useWindowStore` (Zustand + persist) holds open apps, positions, sizes, focus order and min/max state.
- **Rendering** — `Desktop` mounts one `AppWindow` per instance; each receives an `instanceId` and renders the app. **Error Boundaries** isolate failures so one broken app cannot take down the shell.
- **i18n** — `next-intl` drives translations; the registry and each app use namespaced keys for labels and copy.

---

## Architecture & stack

### Tech stack

| Layer             | Technology                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Framework**     | [Next.js 15](https://nextjs.org/) (App Router)                                                                    |
| **Language**      | [TypeScript](https://www.typescriptlang.org/) (strict)                                                            |
| **UI**            | [React 19](https://react.dev/)                                                                                    |
| **Styles**        | [Tailwind CSS 4](https://tailwindcss.com/)                                                                        |
| **Components**    | [Radix UI](https://www.radix-ui.com/) primitives, [shadcn/ui](https://ui.shadcn.com/) patterns                    |
| **State**         | [Zustand](https://github.com/pmndrs/zustand) + `persist` (localStorage)                                           |
| **Forms**         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                         |
| **i18n**          | [next-intl](https://next-intl-docs.vercel.app/)                                                                   |
| **Animation**     | [Framer Motion](https://www.framer.com/motion/)                                                                   |
| **Drag and drop** | [react-draggable](https://github.com/react-grid-layout/react-draggable), [@dnd-kit](https://dndkit.com/) (Kanban) |
| **Icons**         | [Lucide React](https://lucide.dev/)                                                                               |

### Design decisions

- **Modular apps** — Each app is a self-contained module under `src/apps/<AppName>/` (component, state, optional store). Only `apps.ts` ties it to the desktop; adding or replacing an app does not touch the shell.
- **Instance isolation** — Windows are keyed by `id`; apps receive `instanceId` and persist state per instance (e.g. Todo, Kanban), enabling multiple independent instances.
- **Fault isolation** — Every app is wrapped in an Error Boundary; a crash in one app does not affect others. The shell remains stable and the user can close the faulty window or reload.
- **Theming & a11y** — Themes (Ubuntu, macOS, Windows XP) use `body` classes and CSS variables; UI uses semantic tokens (`--card`, `--foreground`) for contrast and accessibility.
- **Responsive layout** — `@container` (Tailwind), flex/grid, `min-h-0` and `overflow-y-auto` so apps adapt to small viewports and scroll inside their frame.

### Folder structure (summary)

```
dev-utility-box/
├── src/
│   ├── app/                    # Next.js App Router: [locale], layout, home
│   ├── apps/                   # One directory per application
│   │   ├── Auth/
│   │   ├── KanbanBoard/
│   │   ├── KnowledgeBase/
│   │   ├── Pomodoro/
│   │   ├── SvgLab/
│   │   └── ...
│   ├── components/             # Desktop, AppWindow, Dock, Spotlight, ErrorBoundary, UI
│   │   ├── __tests__/          # Core component tests
│   │   └── ui/
│   │       └── __tests__/      # UI component tests
│   ├── hooks/
│   │   └── __tests__/          # Hook tests
│   ├── i18n/                   # next-intl: routing, config, request
│   ├── lib/
│   │   └── __tests__/          # Utils, apps registry, color, constants, shortcuts
│   ├── stores/
│   │   └── __tests__/          # Zustand store tests
│   └── test/
│       └── setup.ts            # Global test setup (jest-dom, mocks)
├── public/                     # Wallpapers, icons, static assets
├── package.json
└── README.md
```

---

## Testing

The core is covered by **unit and component tests** using **[Vitest](https://vitest.dev/)** and **[React Testing Library](https://testing-library.com/react)**. Tests live in **`__tests__`** folders next to the code they cover, keeping each module and its tests in one place.

### Coverage

| Layer          | Path                           | Scope                                                                                                                                |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Lib**        | `src/lib/__tests__/`           | `utils`, `apps`, `color`, `constants`, `shortcuts`                                                                                   |
| **Stores**     | `src/stores/__tests__/`        | `useWindowStore`, `useDockStore`, `useThemeStore`, `useSpotlightStore`, `useDesktopStore`, `useAppStateStore`, `useWindowShellStore` |
| **Hooks**      | `src/hooks/__tests__/`         | `useResizeObserver`, `useShortcuts`, `useApi`, `usePersistentAppStore`                                                               |
| **Components** | `src/components/__tests__/`    | `ErrorBoundary`, `AppIcon`, `SpotlightSearch`                                                                                        |
| **UI**         | `src/components/ui/__tests__/` | `Button`                                                                                                                             |

Scenarios include **success and failure paths**, store actions, hooks with mocks (`ResizeObserver`, `localStorage`, i18n), and component behavior (render, click, keyboard, context menu).

**Setup:** `src/test/setup.ts` (jest-dom, cleanup, jsdom mocks). **Config:** `vitest.config.ts` (path alias, jsdom, v8 coverage).

```bash
yarn test            # single run
yarn test:watch      # watch
yarn test:coverage   # report in coverage/
```

---

## Getting started

**Requirements:** Node.js 18+ (20+ recommended), Yarn 4 (`packageManager` in `package.json`).

```bash
git clone https://github.com/your-username/dev-utility-box.git
cd dev-utility-box
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) (locale in path, e.g. `/en`, `/pt`).

| Script               | Description            |
| -------------------- | ---------------------- |
| `yarn dev`           | Dev server             |
| `yarn build`         | Production build       |
| `yarn start`         | Serve production build |
| `yarn lint`          | ESLint                 |
| `yarn test`          | Vitest (single run)    |
| `yarn test:watch`    | Vitest watch           |
| `yarn test:coverage` | Coverage report        |

---

## Internationalization

**next-intl** powers locale-based routing and messages. Locales: **en**, **pt**, **es**, **fr**, **de**, **ja**, **zh**. Keys live in `src/i18n/messages/<locale>.json`; the registry and apps use namespaced keys for labels and copy.

---

## Contributing

Contributions are welcome (utilities, accessibility, i18n, bug fixes). Open an issue to discuss, then fork, branch and open a pull request.

---

## License

**MIT** — see `LICENSE`.
