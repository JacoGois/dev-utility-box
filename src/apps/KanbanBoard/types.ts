export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface CardLinks {
  pr?: string;
  commit?: string;
  branch?: string;
}

export type KanbanCardPriority = 0 | 1 | 2 | 3;

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: KanbanCardPriority;
  dueDate?: string;
  tagIds: string[];
  subtasks: Subtask[];
  links?: CardLinks;
  createdAt: number;
  updatedAt: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface KanbanBoardState {
  cards: Record<string, KanbanCard>;
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
  tags: Record<string, Tag>;
}
