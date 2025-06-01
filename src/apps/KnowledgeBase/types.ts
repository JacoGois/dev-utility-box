export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}
