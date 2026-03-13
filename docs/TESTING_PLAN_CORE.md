# Plano de testes – Core do Dev Utility Box

Este documento define o que é considerado **core** da aplicação e o plano de cobertura por testes.

---

## Onde falta cobrir (resumo)

Para ter o **core** (tudo fora dos apps) coberto e seguro, falta:

| Prioridade | Módulo | Arquivo de teste | Notas |
|------------|--------|------------------|--------|
| **Alta** | useWindowStore | `stores/useWindowStore.test.ts` | ✅ openApp, closeApp, focusApp; mock `toast` |
| **Alta** | useContainerSize (useResizeObserver.ts) | `hooks/useResizeObserver.test.tsx` | ✅ Mock `ResizeObserver`; ref + size state |
| **Alta** | AppIcon | `components/AppIcon.test.tsx` | ✅ Render, clique, context menu; mock stores + translations |
| **Alta** | SpotlightSearch | `components/SpotlightSearch.test.tsx` | ✅ Abre/fecha, busca, query, noResults; real stores + mock t() |
| **Média** | useShortcuts | `hooks/useShortcuts.test.tsx` | ✅ Retorno do array; mock `useDesktopTranslations` |
| **Média** | useApi | `hooks/useApi.test.tsx` | ✅ makeRequest success/error, loading; mock requester |
| **Baixa** | useTranslations | `hooks/useTranslations.test.ts` | Opcional: só re-export de next-intl |
| **Baixa** | AppLauncher | `components/AppLauncher.test.tsx` | Render, lista, clique; mocks |
| **Baixa** | Desktop | `components/Desktop.test.tsx` | Render, janelas; mocks |
| **Baixa** | AppWindow | `components/AppWindow.test.tsx` | Render, min/max/close; mocks |
| **Baixa** | Dock | `components/Dock/index.test.tsx` | Render, ícones; mocks |

**Ordem sugerida:** 1) useWindowStore → 2) useResizeObserver → 3) AppIcon → 4) SpotlightSearch → 5) useShortcuts (e useApi se quiser). Componentes AppLauncher, Desktop, AppWindow e Dock são mais integração; podem ficar por último ou em fases seguintes.

---

## Onde colocar os testes (Clean Code e arquitetura)

O projeto adota **testes em pastas `__tests__`** por camada (cada pasta de código tem sua pasta `__tests__` ao lado):

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts
│   │   ├── apps.test.ts
│   │   ├── color.test.ts
│   │   ├── constants.test.ts
│   │   └── shortcuts.test.ts
│   ├── utils.ts
│   └── color.ts
├── stores/
│   ├── __tests__/
│   │   ├── useWindowStore.test.ts
│   │   ├── useDockStore.test.ts
│   │   └── ...
│   └── useDockStore.ts
├── hooks/
│   ├── __tests__/
│   │   ├── useApi.test.tsx
│   │   ├── useShortcuts.test.tsx
│   │   └── ...
│   └── useApi.ts
├── components/
│   ├── __tests__/
│   │   ├── AppIcon.test.tsx
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── SpotlightSearch.test.tsx
│   └── AppIcon.tsx
├── components/ui/
│   ├── __tests__/
│   │   └── Button.test.tsx
│   └── Button.tsx
└── apps/
    └── KanbanBoard/
        ├── index.tsx
        └── __tests__/
            └── index.test.tsx   ← (quando existir)
```

### Por que `__tests__` por camada?

| Critério | Co-localizado (recomendado) | Pasta `tests/` separada (espelhada) |
|----------|----------------------------|--------------------------------------|
| **Módulo como unidade** | Teste e fonte formam uma única unidade de design; a pasta é o “módulo”. | Código de produção e teste ficam em árvores diferentes. |
| **Refatoração** | Mover/renomear um arquivo leva o teste junto; menos risco de teste órfão. | Estrutura duplicada; fácil esquecer de mover o teste. |
| **Descoberta** | Quem abre o arquivo vê o teste ao lado (documentação viva). | Precisa saber que existe `tests/...` e repetir o caminho. |
| **Boundary da arquitetura** | Cada camada (lib, stores, components, apps) mantém seus testes na mesma boundary. | Separação rígida “só produção em src”; útil se a equipe quiser build sem testes. |

Recomendação: **manter testes dentro de `__tests__`** em cada pasta (lib, stores, hooks, components, components/ui). A configuração do Vitest cobre `src/**/*.{test,spec}.{ts,tsx}` e inclui arquivos em `__tests__`.

### Resumo

- **Regra:** testes ficam na pasta **`__tests__`** do mesmo diretório do código que testam (ex.: `lib/__tests__/utils.test.ts` para `lib/utils.ts`).
- **Imports:** no arquivo de teste use `../nomeDoModulo` para importar o código da pasta pai.
- **Nome:** `NomeDoArquivo.test.ts` ou `NomeDoArquivo.test.tsx` (ou `.spec`).

---

## Escopo do core

O **core** reúne código que não é específico de um app: infraestrutura de janelas, dock, spotlight, estado global, utilitários e componentes base usados por vários apps.

| Área | Módulos | Prioridade |
|------|---------|------------|
| **lib/** | `utils.ts`, `apps.ts`, `color.ts`, `constants.ts`, `shortcuts.ts` | Alta |
| **stores/** | useWindowStore, useDockStore, useThemeStore, useAppStateStore, useSpotlightStore, useDesktopStore, useWindowShellStore | Alta |
| **hooks/** | useTranslations, usePersistentAppStore, useShortcuts, useResizeObserver | Média |
| **components (core)** | ErrorBoundary, AppIcon, SpotlightSearch, AppLauncher, Desktop, AppWindow, Dock | Média |

Stores/hooks de app (useKanbanStore, useAuthStore, usePomodoroStorage, etc.) ficam fora do core e podem ser cobertos depois.

---

## Checklist de cobertura do core

### Lib
- [x] `lib/utils.test.ts` – `cn()`
- [x] `lib/apps.test.ts` – `createApps()`
- [x] `lib/color.test.ts` – `normalizeHexColor`, `hexToRgba`, `getTagTextColor`
- [x] `lib/constants.test.ts` – export e valor de constantes
- [x] `lib/shortcuts.test.ts` – estrutura do array `shortcuts`

### Stores
- [x] `stores/useThemeStore.test.ts` – `setTheme`, estado
- [x] `stores/useDockStore.test.ts` – add/remove dock e desktop, toggle launcher
- [x] `stores/useAppStateStore.test.ts` – setAppState, removeAppState
- [x] `stores/useSpotlightStore.test.ts` – open/close, setQuery, performSearch, selectNext/Previous, executeSelected
- [x] `stores/useDesktopStore.test.ts` – setBackground
- [x] `stores/useWindowShellStore.test.ts` – setShellRef
- [x] `stores/useWindowStore.test.ts` – openApp, closeApp, focusApp (com mocks de toast e outros stores)

### Hooks
- [x] `hooks/usePersistentAppStore.test.ts` – merge com appStates, setState (função e objeto)
- [x] `hooks/useResizeObserver.test.tsx` – `useContainerSize`: callback ao redimensionar (mock `ResizeObserver`)
- [x] `hooks/useShortcuts.test.tsx` – retorno do array de atalhos (mock `useDesktopTranslations`)
- [x] `hooks/useApi.test.tsx` – makeRequest success/error, loading; mock requester
- [ ] `hooks/useTranslations.test.ts` – wrappers de next-intl; opcional (apenas se quiser garantir re-export)

### Componentes core
- [x] `components/ui/Button.test.tsx` – render, onClick, disabled, variants
- [x] `components/ErrorBoundary.test.tsx` – sem erro (children), com erro (fallback/default UI)
- [x] `components/AppIcon.test.tsx` – render, clique abre app (mock `useWindowStore`, `useDockStore`, `useDesktopTranslations`, `useGlobalErrorTranslations`)
- [x] `components/SpotlightSearch.test.tsx` – abre/fecha, busca, seleção (mock stores e `createApps`)
- [ ] `components/AppLauncher.test.tsx` – render, lista de apps, clique abre (mock stores + `createApps`) — opcional
- [ ] `components/Desktop.test.tsx` – render, janelas, background (mock `useWindowStore`, `useDesktopStore`) — opcional
- [ ] `components/AppWindow.test.tsx` – render, título, min/max/close (mock store + children) — opcional
- [ ] `components/Dock/index.test.tsx` – render, ícones, launcher (mock stores) — opcional

---

## Convenções

- **Stores com `persist`:** mockar `localStorage` no `beforeEach` (ou em setup) e limpar entre testes.
- **Stores que chamam outros stores:** preferir testar com stores reais (resetando estado no `beforeEach`) ou mockar as dependências.
- **Componentes que dependem de contexto/store:** usar wrappers com provider ou mockar o store.
- **Posição:** co-localizado (arquivo de teste ao lado do fonte); ver seção “Onde colocar os testes” acima.
- **Nomenclatura:** `*.test.ts` / `*.test.tsx` (ou `*.spec.ts` / `*.spec.tsx`).

---

## Execução

```bash
yarn test                 # todos os testes
yarn test src/lib         # apenas lib
yarn test src/stores      # apenas stores
yarn test:coverage        # cobertura
```
