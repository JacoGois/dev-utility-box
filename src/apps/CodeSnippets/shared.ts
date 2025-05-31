export type Language =
  | "Javascript"
  | "Typescript"
  | "Python"
  | "HTML"
  | "CSS"
  | "JSON"
  | "Markdown"
  | "Bash"
  | "SQL"
  | "Outro";

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: Language;
  tags: string[];
  description?: string;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}
