/* eslint-disable */
// @ts-nocheck
import {
  KanbanBoardState,
  KanbanCard,
  KanbanColumn,
  Tag,
} from "@/apps/KanbanBoard/types";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const KANBAN_BOARD_STORAGE_KEY = "kanban-board-data-v2";

const initialDefaultColumns = () => {
  const todoColId = nanoid();
  const inProgColId = nanoid();
  const doneColId = nanoid();
  return {
    columns: {
      [todoColId]: { id: todoColId, title: "A Fazer", cardIds: [] },
      [inProgColId]: { id: inProgColId, title: "Em Andamento", cardIds: [] },
      [doneColId]: { id: doneColId, title: "Feito", cardIds: [] },
    },
    columnOrder: [todoColId, inProgColId, doneColId],
  };
};

interface KanbanActions {
  addColumn: (title: string) => void;
  updateColumnTitle: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (oldIndex: number, newIndex: number) => void;

  addCard: (
    columnId: string,
    cardData: Omit<
      KanbanCard,
      | "id"
      | "columnId"
      | "createdAt"
      | "updatedAt"
      | "order"
      | "subtasks"
      | "tagIds"
      | "links"
    > &
      Partial<Pick<KanbanCard, "description" | "subtasks" | "links">>
  ) => KanbanCard;
  updateCard: (updatedCard: KanbanCard) => void;
  deleteCard: (cardId: string) => void;
  moveCardToDifferentColumn: (
    cardId: string,
    oldColumnId: string,
    newColumnId: string,
    newIndexInNewColumn: number
  ) => void;
  moveCardWithinColumn: (
    cardId: string,
    columnId: string,
    newIndexInColumn: number
  ) => void;
  toggleSubtask: (cardId: string, subtaskId: string) => void;

  addTag: (name: string, color?: string) => Tag | undefined;
  updateTag: (tagId: string, newName: string, newColor?: string) => void;
  deleteTag: (tagId: string) => void;

  handleDragEnd: (event: any) => void;

  setBoardState: (newState: KanbanBoardState) => void;
}

export const useKanbanStore = create<KanbanBoardState & KanbanActions>()(
  persist(
    (set, get) => ({
      cards: {},
      columns: initialDefaultColumns().columns,
      columnOrder: initialDefaultColumns().columnOrder,
      tags: {},

      setBoardState: (newState) => set(newState),

      addColumn: (title) => {
        const newColumnId = nanoid();
        const newColumn: KanbanColumn = { id: newColumnId, title, cardIds: [] };
        set((state) => ({
          columns: { ...state.columns, [newColumnId]: newColumn },
          columnOrder: [...state.columnOrder, newColumnId],
        }));
      },
      updateColumnTitle: (columnId, newTitle) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title: newTitle },
          },
        }));
      },
      deleteColumn: (columnId) => {
        set((state) => {
          const columnToDelete = state.columns[columnId];
          if (!columnToDelete) return state;
          const newCards = { ...state.cards };
          columnToDelete.cardIds.forEach((cardId) => delete newCards[cardId]);
          const newColumns = { ...state.columns };
          delete newColumns[columnId];
          const newColumnOrder = state.columnOrder.filter(
            (id) => id !== columnId
          );
          return {
            cards: newCards,
            columns: newColumns,
            columnOrder: newColumnOrder,
          };
        });
      },
      moveColumn: (oldIndex, newIndex) => {
        set((state) => ({
          columnOrder: arrayMove(state.columnOrder, oldIndex, newIndex),
        }));
      },

      addCard: (columnId, cardData) => {
        const newCardId = nanoid();
        const now = Date.now();
        const newCard: KanbanCard = {
          id: newCardId,
          columnId,
          title: cardData.title,
          description: cardData.description || "",
          tags: [],
          tagIds: cardData.tagIds || [],
          subtasks: cardData.subtasks || [],
          links: cardData.links || {},
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const targetColumn = state.columns[columnId];
          if (!targetColumn) return state;
          return {
            cards: { ...state.cards, [newCardId]: newCard },
            columns: {
              ...state.columns,
              [columnId]: {
                ...targetColumn,
                cardIds: [...targetColumn.cardIds, newCardId],
              },
            },
          };
        });
        return newCard;
      },
      updateCard: (updatedCard) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [updatedCard.id]: {
              ...state.cards[updatedCard.id],
              ...updatedCard,
              updatedAt: Date.now(),
            },
          },
        }));
      },
      deleteCard: (cardId) => {
        set((state) => {
          const cardToDelete = state.cards[cardId];
          if (!cardToDelete) return state;
          const newCards = { ...state.cards };
          delete newCards[cardId];
          const sourceColumn = state.columns[cardToDelete.columnId];
          if (!sourceColumn) return state;
          const newSourceColumn = {
            ...sourceColumn,
            cardIds: sourceColumn.cardIds.filter((id) => id !== cardId),
          };
          return {
            cards: newCards,
            columns: {
              ...state.columns,
              [cardToDelete.columnId]: newSourceColumn,
            },
          };
        });
      },
      toggleSubtask: (cardId, subtaskId) => {
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;
          const updatedSubtasks = card.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                subtasks: updatedSubtasks,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      moveCardToDifferentColumn: (
        cardId,
        oldColumnId,
        newColumnId,
        newIndexInNewColumn
      ) => {
        set((state) => {
          const oldCol = state.columns[oldColumnId];
          const newCol = state.columns[newColumnId];
          if (!oldCol || !newCol) return state;

          const newOldColCardIds = oldCol.cardIds.filter((id) => id !== cardId);
          const newNewColCardIds = [...newCol.cardIds];
          newNewColCardIds.splice(newIndexInNewColumn, 0, cardId);

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...state.cards[cardId],
                columnId: newColumnId,
                updatedAt: Date.now(),
              },
            },
            columns: {
              ...state.columns,
              [oldColumnId]: { ...oldCol, cardIds: newOldColCardIds },
              [newColumnId]: { ...newCol, cardIds: newNewColCardIds },
            },
          };
        });
      },
      moveCardWithinColumn: (cardId, columnId, newIndexInColumn) => {
        set((state) => {
          const column = state.columns[columnId];
          if (!column) return state;

          const oldIndex = column.cardIds.indexOf(cardId);
          if (oldIndex === -1) return state;

          const newCardIds = arrayMove(
            column.cardIds,
            oldIndex,
            newIndexInColumn
          );
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...state.cards[cardId], updatedAt: Date.now() },
            },
            columns: {
              ...state.columns,
              [columnId]: { ...column, cardIds: newCardIds },
            },
          };
        });
      },
      handleDragEnd: (event: any) => {
        const { active, over } = event;
        if (!active || !over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const isCard = active.data.current?.type === "Card";
        const isColumn = active.data.current?.type === "Column";

        if (isCard) {
          const card = get().cards[activeId];
          const sourceColumnId = card.columnId;

          const destinationColumnId = get().columns[overId]
            ? overId
            : get().cards[overId]?.columnId;

          if (!destinationColumnId) return;

          const sourceColumnCardIds =
            get().columns[sourceColumnId]?.cardIds || [];
          const destinationColumnCardIds =
            get().columns[destinationColumnId]?.cardIds || [];

          const oldIndexInSource = sourceColumnCardIds.indexOf(activeId);
          let newIndexInDestination;

          if (sourceColumnId === destinationColumnId) {
            if (over.data.current?.type === "Card") {
              newIndexInDestination = destinationColumnCardIds.indexOf(overId);
            } else {
              newIndexInDestination = destinationColumnCardIds.length;
            }
            if (oldIndexInSource !== newIndexInDestination) {
              get().moveCardWithinColumn(
                activeId,
                sourceColumnId,
                newIndexInDestination
              );
            }
          } else {
            if (over.data.current?.type === "Card") {
              newIndexInDestination = destinationColumnCardIds.indexOf(overId);
            } else {
              newIndexInDestination = destinationColumnCardIds.length;
            }
            get().moveCardToDifferentColumn(
              activeId,
              sourceColumnId,
              destinationColumnId,
              newIndexInDestination
            );
          }
        } else if (isColumn) {
          const oldIndex = get().columnOrder.indexOf(activeId);
          const newIndex = get().columnOrder.indexOf(overId);
          if (oldIndex !== newIndex) {
            get().moveColumn(oldIndex, newIndex);
          }
        }
      },

      addTag: (name, color) => {
        const existingTag = Object.values(get().tags).find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
        if (existingTag) {
          toast.info(`Tag "${name}" já existe.`);
          return existingTag;
        }
        const newTagId = nanoid();
        const newTag: Tag = { id: newTagId, name, color };
        set((state) => ({
          tags: { ...state.tags, [newTagId]: newTag },
        }));
        toast.success(`Tag "${name}" criada.`);
        return newTag;
      },
      updateTag: (tagId, newName, newColor) => {
        set((state) => {
          if (!state.tags[tagId]) return state;
          return {
            tags: {
              ...state.tags,
              [tagId]: {
                ...state.tags[tagId],
                name: newName,
                color: newColor || state.tags[tagId].color,
              },
            },
          };
        });
      },
      deleteTag: (tagId) => {
        set((state) => {
          const newTags = { ...state.tags };
          delete newTags[tagId];

          const newCards = { ...state.cards };
          Object.keys(newCards).forEach((cardId) => {
            const card = newCards[cardId];
            if (card.tagIds.includes(tagId)) {
              newCards[cardId] = {
                ...card,
                tagIds: card.tagIds.filter((id) => id !== tagId),
              };
            }
          });
          return { tags: newTags, cards: newCards };
        });
      },
    }),
    {
      name: KANBAN_BOARD_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
