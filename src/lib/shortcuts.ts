// src/lib/shortcuts.ts

export interface Shortcut {
  keys: string[];
  description: string;
}

export const shortcuts: Shortcut[] = [
  {
    keys: ["Ctrl", "K"],
    description: "Abrir a busca rápida",
  },
];
