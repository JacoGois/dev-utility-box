# Status de cobertura de testes

Documento que consolida **o que já está coberto**, **o que falta testar** e como ver o relatório de cobertura.

---

## Como rodar o coverage

```bash
yarn test:coverage
# ou
yarn vitest run --coverage
```

O relatório em texto aparece no terminal. O relatório HTML é gerado em `coverage/index.html` (abrir no navegador).

---

## Resumo geral (última execução)

| Métrica   | Valor   |
|----------|---------|
| **Statements** | ~18% |
| **Branches**   | ~9%  |
| **Functions**  | ~19% |
| **Lines**      | ~18% |

A cobertura geral é baixa porque a maior parte do código está nos **apps** (Kanban, Knowledge Base, SchemaLab, etc.), que ainda não têm testes. O **core** (lib, stores, hooks e componentes de shell) está bem coberto.

---

## O que já está coberto (core)

### Lib (`src/lib`) — 100% statements/lines
| Arquivo      | Status |
|-------------|--------|
| `utils.ts`  | ✅ |
| `apps.ts`   | ✅ |
| `color.ts`  | ✅ |
| `constants.ts` | ✅ |
| `shortcuts.ts` | ✅ |

### Stores (`src/stores`)
| Arquivo | Cobertura | Status |
|---------|-----------|--------|
| `useAppStateStore.ts` | 100% | ✅ |
| `useDesktopStore.ts`  | 100% | ✅ |
| `useDockStore.ts`     | 100% | ✅ |
| `useWindowShellStore.ts` | 100% | ✅ |
| `useWindowStore.ts`   | ~96% | ✅ |
| `useSpotlightStore.ts`| ~90% | ✅ |
| `useThemeStore.ts`    | ~73% | ✅ |
| `useAuthStore.ts`     | ~35% | Parcial (app) |
| `useKanbanStore.ts`   | ~4%  | ❌ (app) |

### Hooks (`src/hooks`)
| Arquivo | Cobertura | Status |
|---------|-----------|--------|
| `useApi.ts`               | 100% | ✅ |
| `usePersistentAppStore.ts`| 100% | ✅ |
| `useShortcuts.ts`         | 100% | ✅ |
| `useResizeObserver.ts`    | ~92% | ✅ |
| `useTranslations.ts`      | 0%   | ❌ (opcional) |
| `useConditionalStorage.ts` | ~2%  | ❌ (app) |
| `usePomodoroStorage.ts`    | ~1%  | ❌ (app) |

### Componentes core (`src/components`)
| Arquivo | Cobertura | Status |
|---------|-----------|--------|
| `AppIcon.tsx`       | 100% | ✅ |
| `Button.tsx` (ui)   | 100% | ✅ |
| `SpotlightSearch.tsx` | ~82% | ✅ |
| `ErrorBoundary.tsx`   | ~69% | ✅ |
| `AppLauncher.tsx`     | 0%   | ❌ (opcional) |
| `AppWindow.tsx`       | 0%   | ❌ (opcional) |
| `Desktop.tsx`         | 0%   | ❌ (opcional) |
| `Dock/*`              | 0%   | ❌ (opcional) |

---

## O que falta testar

### Core (prioridade baixa / opcional)
- [ ] **hooks/useTranslations.ts** — wrappers de next-intl (re-export)
- [ ] **components/AppLauncher.tsx** — render, lista de apps, clique
- [ ] **components/Desktop.tsx** — render, janelas, background
- [ ] **components/AppWindow.tsx** — render, título, min/max/close
- [ ] **components/Dock/** — render, ícones, launcher

### Apps (fora do core)
Código em `src/apps/` não está coberto por testes. Exemplos:

- [ ] **KanbanBoard** — componentes, hooks, store
- [ ] **KnowledgeBase** — editor, sidebar, store
- [ ] **SchemaLab** — validação, tipos, exemplos
- [ ] **ImageTextLab** — fluxos de imagem/texto
- [ ] **Pomodoro** — timer, storage
- [ ] **TodoList** — lista, filtros
- [ ] **Auth** — login, formulário
- [ ] **EncodersDecoders**, **JSONTools**, **DataGenerator**, **MassDataGenerator**, **SvgLab**, etc.

### Outros
- [ ] **src/app/** e **src/app/[locale]/** — layouts e páginas (Next.js)
- [ ] **src/i18n/** — config, request, routing
- [ ] **src/utils/** — httpClient e outros
- [ ] **Componentes UI** usados só em apps (Calendar, Command, Select, etc.) — cobertura indireta ou testes próprios quando fizer sentido

---

## Próximos passos sugeridos

1. **Manter o core estável** — os testes atuais já cobrem lib, stores principais, hooks principais e componentes críticos (AppIcon, SpotlightSearch, ErrorBoundary, Button).
2. **Opcional:** implementar testes dos componentes de shell (AppLauncher, Desktop, AppWindow, Dock) para subir a cobertura do core e evitar regressões na shell.
3. **Por app:** ao mexer em um app (ex.: Kanban), adicionar testes na pasta do app (`apps/KanbanBoard/*.test.tsx`) para as partes mais críticas (store, hooks, componentes principais).

---

## Referência

- Plano detalhado do core: [TESTING_PLAN_CORE.md](./TESTING_PLAN_CORE.md)
- Convenções e onde colocar testes: ver seção “Onde colocar os testes” no plano do core.
