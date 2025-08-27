export interface Shortcut {
  keys?: string[];
  description: string;
}

export const shortcuts: Shortcut[] = [
  {
    keys: ["Ctrl", "K"],
    description: "Abrir a busca rápida",
  },
  {
    keys: ["Ctrl", "M"],
    description: "Abrir a buscador de aplicativos",
  },
  {
    description:
      "Redimensionar a janela clicando e arrastando o meio da borda direita, o meio da borda inferior ou o canto inferior direito.",
  },
];
