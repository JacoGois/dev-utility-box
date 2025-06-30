# 🧰 Dev Utility Box

Uma caixa de ferramentas para desenvolvedores que roda em um ambiente de desktop simulado diretamente no seu navegador. Agilize seu fluxo de trabalho com utilitários práticos e eficientes, focando no que realmente importa: codificar e construir.

## ✨ Funcionalidades Principais

-   **Ambiente de Desktop Simulado**: Uma interface de usuário que simula um sistema operacional, com janelas que podem ser arrastadas, redimensionadas, minimizadas e maximizadas.
-   **Gerenciamento de Janelas**: Controle de foco e empilhamento (z-index) de janelas para uma experiência multitarefa fluida.
-   **Dock e Lançador de Aplicativos**: Uma dock persistente para seus apps favoritos e um lançador para descobrir e abrir todos os utilitários disponíveis.
-   **Pesquisa Rápida (Spotlight)**: Pressione `Ctrl+K` ou `Cmd+K` para abrir uma barra de pesquisa rápida e lançar aplicativos instantaneamente.
-   **Estado Persistente**: O estado dos aplicativos, as configurações e a posição das janelas são salvos no `localStorage`, permitindo que você continue de onde parou.
-   **Sistema de Temas**: Suporte a múltiplos temas para customizar a aparência do ambiente.

### Aplicativos Incluídos

Atualmente, o projeto conta com os seguintes utilitários:

-   🍅 **Timer Pomodoro**: Um timer configurável para gerenciar seus ciclos de foco e pausa.
-   📝 **Notas em Markdown**: Um editor de notas simples e rápido com suporte a Markdown.
-   ... (e outros aplicativos que você venha a adicionar, como Ferramentas JSON, Snippets de Código, etc.)

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas e eficientes, focadas na experiência do desenvolvedor e na performance.

-   **Framework**: [Next.js](https://nextjs.org/) (com App Router)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: Construídos sobre os primitivos do [Radix UI](https://www.radix-ui.com/), seguindo uma arquitetura similar à do [shadcn/ui](https://ui.shadcn.com/).
-   **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand) para um estado global simples e poderoso.
-   **Animações**: [Framer Motion](https://www.framer.com/motion/) para interações e transições fluidas.
-   **Ícones**: [Lucide React](https://lucide.dev/)
-   **Drag & Drop**: [React Draggable](https://github.com/react-grid-layout/react-draggable) e [@dnd-kit](https://dndkit.com/)

## 🏁 Como Começar

Para rodar este projeto localmente, siga os passos abaixo.

1.  **Clone o Repositório**
    ```bash
    git clone [https://github.com/seu-usuario/dev-utility-box.git](https://github.com/seu-usuario/dev-utility-box.git)
    cd dev-utility-box
    ```

2.  **Instale as Dependências**
    ```bash
    npm install
    ```

3.  **Rode o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```

4.  **Abra no Navegador**
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o projeto em ação.

## 📂 Estrutura do Projeto

A estrutura de pastas foi organizada para manter a escalabilidade e a separação de responsabilidades.

```
dev-utility-box/
├── src/
│   ├── app/                # Rotas principais, layout e página inicial (App Router)
│   ├── apps/               # Contém a lógica e UI para cada aplicativo individual
│   │   └── Pomodoro/       # Exemplo de um aplicativo
│   ├── components/         # Componentes React reutilizáveis (Desktop, AppWindow, Dock, etc.)
│   │   └── ui/             # Componentes de UI de baixo nível (Button, Card, Dialog, etc.)
│   ├── hooks/              # Hooks customizados, como usePersistentAppStore
│   ├── lib/                # Funções utilitárias e configurações de apps
│   └── stores/             # Stores do Zustand para gerenciamento de estado global
├── public/                 # Arquivos estáticos (imagens, fontes, etc.)
└── package.json            # Dependências e scripts do projeto
```

## 🤝 Como Contribuir

Contribuições são bem-vindas! Se você tem ideias para novos utilitários, melhorias ou correções de bugs, sinta-se à vontade para:

1.  Abrir uma **Issue** para discutir a mudança que você gostaria de fazer.
2.  Fazer um **Fork** do projeto e criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`).
3.  Fazer o **Commit** de suas alterações (`git commit -m 'Add some AmazingFeature'`).
4.  Fazer o **Push** para a branch (`git push origin feature/AmazingFeature`).
5.  Abrir um **Pull Request**.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
