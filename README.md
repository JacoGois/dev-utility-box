# 🧰 Dev Utility Box

**Uma suíte de ferramentas para desenvolvedores que roda em um desktop simulado no navegador.**  
Múltiplos apps em uma única página: timer Pomodoro, Kanban, base de conhecimento, editores JSON/SVG, codificadores, geração de dados e muito mais — com janelas arrastáveis, temas e estado persistente.

---

## ✨ O que é o Dev Utility Box?

O **DUB** é uma aplicação web que simula um ambiente de desktop dentro do navegador. Em vez de abrir dezenas de abas ou apps externos, você concentra utilitários do dia a dia em um só lugar: um “OS” leve, rápido e focado em produtividade.

- **Múltiplas janelas** — Arraste, redimensione, minimize e maximize como em um desktop real.
- **Vários apps ao mesmo tempo** — Abra quantas instâncias cada app permitir (ex.: vários Kanbans, várias listas de tarefas).
- **Estado salvo** — Posição das janelas, itens no dock e dados dos apps (onde aplicável) persistem no `localStorage`.
- **Internacionalizado** — Interface em inglês, português, espanhol, francês, alemão, japonês e chinês.
- **Temas** — Visual inspirado em Ubuntu, macOS e Windows XP, além de temas claro/escuro.

---

## 🖥️ Aplicativos incluídos

| App | Descrição |
|-----|-----------|
| 🍅 **Pomodoro** | Timer de foco com ciclos configuráveis (trabalho / pausa). |
| 📝 **Todo List** | Lista de tarefas com estado persistente por instância. |
| 📋 **Kanban Board** | Quadro Kanban com colunas, cards, subtarefas, tags, prioridade e prazos. |
| 🧠 **Knowledge Base** | Base de conhecimento estilo Notion: páginas, favoritos, ícones e editor Markdown (MDXEditor). |
| 📐 **JSON Tools** | Validação, formatação e manipulação de JSON. |
| 🔐 **Encoders & Decoders** | Base64, JWT, URL e outros codificadores/decodificadores. |
| 🗄️ **Data Generator** | Geração de dados sintéticos (nomes, emails, etc.) com Faker. |
| 📦 **Mass Data Generator** | Geração em massa de JSON com templates e Faker. |
| 🖼️ **Image Text Lab** | Ferramentas com imagem e texto (OCR com Tesseract, etc.). |
| 📋 **Schema Lab** | Validação com JSON Schema, geração de tipos e exemplos. |
| ✏️ **SVG Lab** | Edição e recolorização de SVGs (modo simples e avançado). |
| 👤 **Auth** | Fluxos de autenticação e JWT para testes. |

Cada app é um módulo independente: pode ser aberto em janela própria, ter estado isolado e ser estendido ou trocado sem quebrar o restante do sistema.

---

## 🚀 Como o projeto funciona

### Experiência do usuário

1. **Desktop** — Ao acessar a aplicação, você vê um “desktop” com wallpaper e ícones (ou tema escolhido).
2. **Dock** — Na parte inferior, um dock mostra apps fixos e os que estão abertos; é possível adicionar/remover atalhos.
3. **Lançador** — Um launcher (estilo Spotlight) lista todos os apps; atalho **Ctrl+K** / **Cmd+K** para busca rápida.
4. **Janelas** — Ao abrir um app, uma janela é criada: barra de título com minimizar/maximizar/fechar, arrastar e redimensionar. O foco e o empilhamento (z-index) são controlados automaticamente.
5. **Persistência** — Posições e tamanhos das janelas, itens no dock e estado de cada app (quando implementado) são salvos no `localStorage` e restaurados ao recarregar.

### Fluxo técnico (em alto nível)

- **Registro de apps** (`src/lib/apps.ts`) — Cada app é registrado com nome, ícone, componente React, limites de instâncias e tamanhos máximos/mínimos de janela.
- **Gerenciamento de janelas** — `useWindowStore` (Zustand + persist) guarda quais apps estão abertos, posições, tamanhos, ordem de foco, minimizados e maximizados.
- **Renderização** — O `Desktop` renderiza um `AppWindow` para cada instância aberta; cada janela recebe um `instanceId` e renderiza o componente do app. Um **Error Boundary** envolve cada app para que um erro em um não derrube os outros.
- **Internacionalização** — `next-intl` fornece as traduções; o registro de apps usa uma função `t(key)` para nomes e textos, e cada app pode usar `useAppTranslations("appName")` para suas próprias chaves.

---

## 🏗️ Arquitetura e stack

### Stack principal

| Camada | Tecnologia |
|--------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **UI** | [React 19](https://react.dev/) |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Componentes** | Primitivos [Radix UI](https://www.radix-ui.com/), padrão próximo ao [shadcn/ui](https://ui.shadcn.com/) |
| **Estado global** | [Zustand](https://github.com/pmndrs/zustand) (com middleware `persist` para localStorage) |
| **Formulários / validação** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **i18n** | [next-intl](https://next-intl-docs.vercel.app/) |
| **Animações** | [Framer Motion](https://www.framer.com/motion/) |
| **Drag and drop** | [react-draggable](https://github.com/react-grid-layout/react-draggable), [@dnd-kit](https://dndkit.com/) (Kanban) |
| **Ícones** | [Lucide React](https://lucide.dev/) |

### Decisões de arquitetura

- **Apps como módulos** — Cada app vive em `src/apps/<AppName>/` com seu próprio `index.tsx`, estados e, quando faz sentido, store específica (ex.: Kanban). O registro em `apps.ts` é o único ponto de acoplamento com o “core” do desktop.
- **Estado por instância** — Janelas são identificadas por `id`; o app recebe `instanceId` e pode persistir estado por essa id (ex.: Todo, Kanban), permitindo múltiplas instâncias com dados diferentes.
- **Error Boundaries** — Cada janela envolve o conteúdo do app em um Error Boundary; falhas são contidas e o usuário pode fechar a janela ou recarregar sem perder os outros apps.
- **Temas e acessibilidade** — Temas (Ubuntu, macOS, Windows XP) são aplicados via classes no `body` e variáveis CSS; componentes usam tokens semânticos (e.g. `--card`, `--foreground`) para respeitar contraste e acessibilidade.
- **Container e responsividade** — Uso de `@container` (Tailwind) e layout flex/grid com `min-h-0` e `overflow-y-auto` para que os apps se adaptem bem a janelas pequenas e tenham scroll interno quando necessário.

### Estrutura de pastas (resumida)

```
dev-utility-box/
├── src/
│   ├── app/                    # Next.js App Router: [locale], layout, página inicial
│   ├── apps/                   # Um diretório por aplicativo
│   │   ├── Auth/
│   │   ├── KanbanBoard/
│   │   ├── KnowledgeBase/
│   │   ├── Pomodoro/
│   │   ├── SvgLab/
│   │   └── ...
│   ├── components/             # Desktop, AppWindow, Dock, Spotlight, ErrorBoundary, UI
│   ├── hooks/                  # useTranslations, usePersistentAppStore, etc.
│   ├── i18n/                   # next-intl: routing, config, request
│   ├── lib/                    # apps.ts (registro), utils
│   └── stores/                 # Zustand: useWindowStore, useDockStore, useThemeStore, etc.
├── public/                     # Wallpapers, ícones, assets estáticos
├── package.json
└── README.md
```

---

## 🏁 Como rodar o projeto

### Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **Yarn** (o projeto usa Yarn 4; veja `packageManager` em `package.json`)

### Passos

1. **Clonar e entrar na pasta**
   ```bash
   git clone https://github.com/seu-usuario/dev-utility-box.git
   cd dev-utility-box
   ```

2. **Instalar dependências**
   ```bash
   yarn install
   ```

3. **Subir o servidor de desenvolvimento**
   ```bash
   yarn dev
   ```

4. **Abrir no navegador**  
   Acesse [http://localhost:3000](http://localhost:3000). A rota pode incluir o locale (ex.: `/en`, `/pt`).

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Servidor de desenvolvimento (Next.js) |
| `yarn build` | Build de produção |
| `yarn start` | Servidor para o build de produção |
| `yarn lint` | Executa o ESLint |
| `yarn test` | Roda os testes (Vitest) uma vez |
| `yarn test:watch` | Roda os testes em modo watch |
| `yarn test:coverage` | Gera relatório de cobertura |

---

## 🧪 Testes

O projeto usa **[Vitest](https://vitest.dev/)** com **[React Testing Library](https://testing-library.com/react)** para testes unitários e de componentes.

### Por onde começar a cobrir o sistema

1. **Utilitários e funções puras** (`src/lib/*.test.ts`) — Comece por `cn`, helpers e o registro de apps; são rápidos e estáveis.
2. **Stores Zustand** (`src/stores/*.test.ts`) — Teste a lógica de estado: use `getState()` e `setState()` e, quando houver `persist`, mocke `localStorage` no setup ou no teste.
3. **Componentes UI** (`src/components/ui/*.test.tsx`) — Teste renderização, clique e acessibilidade com `render`, `screen` e `userEvent`.
4. **Hooks** (`src/hooks/*.test.ts`) — Use `renderHook` de `@testing-library/react` para hooks que dependem de contexto ou store.
5. **Apps** — Por último, teste fluxos críticos de cada app (ex.: criar card no Kanban, salvar página na Knowledge Base); prefira testes enxutos e mocks para APIs/`localStorage`.

### Onde colocar os testes

**Testes co-localizados:** cada arquivo de teste fica no **mesmo diretório** que o código testado (ex.: `utils.ts` e `utils.test.ts` em `src/lib/`). Isso mantém o módulo (fonte + teste) como uma única unidade, facilita refatoração e descoberta. Ver **[docs/TESTING_PLAN_CORE.md](docs/TESTING_PLAN_CORE.md)** para o raciocínio completo (clean code e arquitetura).

### Estrutura

- Convenção: `*.test.ts` / `*.test.tsx` ao lado do fonte; opcionalmente `__tests__/` na mesma pasta para agrupar.
- Setup global em `src/test/setup.ts` (jest-dom, cleanup, mocks de `matchMedia`).
- Config em `vitest.config.ts` (alias `@/`, ambiente jsdom, coverage com v8).

### Executar

```bash
yarn test           # uma execução
yarn test:watch     # watch mode
yarn test:coverage  # cobertura (relatório em coverage/)
```

Para um **planejamento detalhado da cobertura do core** (lib, stores, hooks, componentes), veja **[docs/TESTING_PLAN_CORE.md](docs/TESTING_PLAN_CORE.md)**.

---

## 🌐 Internacionalização

O DUB usa **next-intl** com rotas por locale. Locales suportados: **en**, **pt**, **es**, **fr**, **de**, **ja**, **zh**.  
As chaves de tradução ficam em `src/i18n/messages/<locale>.json`. O registro de apps e cada app consomem essas chaves para nomes, botões, mensagens e placeholders.

---

## 🤝 Contribuindo

Contribuições são bem-vindas: novos utilitários, melhorias de acessibilidade, i18n ou correções de bugs.

1. Abra uma **Issue** para discutir a mudança.
2. Faça um **Fork**, crie uma branch (`git checkout -b feature/nome-da-feature`).
3. Commit e push para a branch e abra um **Pull Request**.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.
