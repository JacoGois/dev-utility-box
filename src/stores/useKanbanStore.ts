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
import React, { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const KANBAN_BOARD_STORAGE_KEY = "kanban-board-data-v2";
type KanbanStoreState = KanbanBoardState & KanbanActions;

interface KanbanDefaultColumnTitles {
  todo: string;
  inProgress: string;
  done: string;
}

const initialDefaultColumns = (titles: KanbanDefaultColumnTitles) => {
  const todoColId = nanoid();
  const inProgColId = nanoid();
  const doneColId = nanoid();
  return {
    columns: {
      [todoColId]: {
        id: todoColId,
        title: titles.todo,
        cardIds: [],
      },
      [inProgColId]: {
        id: inProgColId,
        title: titles.inProgress,
        cardIds: [],
      },
      [doneColId]: {
        id: doneColId,
        title: titles.done,
        cardIds: [],
      },
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
      Partial<
        Pick<
          KanbanCard,
          "description" | "subtasks" | "links" | "priority" | "dueDate"
        >
      >
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

const createKanbanState = (
  set: any,
  get: any,
  defaultColumnTitles: KanbanDefaultColumnTitles
) => {
      const defaults = initialDefaultColumns(defaultColumnTitles);
      return {
      cards: {},
      columns: defaults.columns,
      columnOrder: defaults.columnOrder,
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
          priority: cardData.priority ?? 2,
          dueDate: cardData.dueDate || undefined,
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
          if (!card) return;
          const sourceColumnId =
            active.data.current?.sortable?.containerId || card.columnId;

          const destinationColumnId =
            over.data.current?.type === "Card"
              ? over.data.current?.sortable?.containerId ||
                get().cards[overId]?.columnId
              : get().columns[overId]
              ? overId
              : over.data.current?.sortable?.containerId;

          if (!destinationColumnId || !get().columns[destinationColumnId]) return;

          const sourceColumnCardIds =
            get().columns[sourceColumnId]?.cardIds || [];
          const destinationColumnCardIds =
            get().columns[destinationColumnId]?.cardIds || [];

          const oldIndexInSource = sourceColumnCardIds.indexOf(activeId);
          if (oldIndexInSource === -1) return;
          let newIndexInDestination;

          if (sourceColumnId === destinationColumnId) {
            if (over.data.current?.type === "Card") {
              newIndexInDestination = destinationColumnCardIds.indexOf(overId);
            } else {
              newIndexInDestination = destinationColumnCardIds.length;
            }
            if (newIndexInDestination < 0) return;
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
            if (newIndexInDestination < 0) return;
            get().moveCardToDifferentColumn(
              activeId,
              sourceColumnId,
              destinationColumnId,
              newIndexInDestination
            );
          }
        } else if (isColumn) {
          const oldIndex = get().columnOrder.indexOf(activeId);
          const overColumnId = get().columns[overId]
            ? overId
            : get().cards[overId]?.columnId ||
              over.data.current?.sortable?.containerId;
          const newIndex = overColumnId
            ? get().columnOrder.indexOf(overColumnId)
            : -1;
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            get().moveColumn(oldIndex, newIndex);
          }
        }
      },

      addTag: (name, color) => {
        const existingTag = Object.values(get().tags).find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
        if (existingTag) {
          return existingTag;
        }
        const newTagId = nanoid();
        const newTag: Tag = { id: newTagId, name, color };
        set((state) => ({
          tags: { ...state.tags, [newTagId]: newTag },
        }));
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
};
};

const createKanbanStore = (
  instanceId: string,
  defaultColumnTitles: KanbanDefaultColumnTitles
) =>
  createStore<KanbanStoreState>()(
    persist(
      (set, get) => createKanbanState(set, get, defaultColumnTitles),
      {
        name: `${KANBAN_BOARD_STORAGE_KEY}:${instanceId}`,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

const kanbanStoreRegistry = new Map<
  string,
  ReturnType<typeof createKanbanStore>
>();

const getKanbanStore = (
  instanceId: string,
  defaultColumnTitles: KanbanDefaultColumnTitles
) => {
  if (!kanbanStoreRegistry.has(instanceId)) {
    kanbanStoreRegistry.set(
      instanceId,
      createKanbanStore(instanceId, defaultColumnTitles)
    );
  }
  return kanbanStoreRegistry.get(instanceId)!;
};

const KanbanStoreContext = createContext<ReturnType<typeof createKanbanStore> | null>(
  null
);

export function KanbanStoreProvider({
  instanceId,
  defaultColumnTitles,
  children,
}: {
  instanceId: string;
  defaultColumnTitles: KanbanDefaultColumnTitles;
  children: React.ReactNode;
}) {
  const storeRef = useRef<ReturnType<typeof createKanbanStore> | null>(null);
  const instanceRef = useRef<string>("");

  if (!storeRef.current || instanceRef.current !== instanceId) {
    instanceRef.current = instanceId;
    storeRef.current = getKanbanStore(instanceId, defaultColumnTitles);
  }

  return React.createElement(
    KanbanStoreContext.Provider,
    { value: storeRef.current },
    children
  );
}

export function useKanbanStore(): KanbanStoreState;
export function useKanbanStore<T>(selector: (state: KanbanStoreState) => T): T;
export function useKanbanStore<T>(selector?: (state: KanbanStoreState) => T) {
  const store = useContext(KanbanStoreContext);
  if (!store) {
    throw new Error("useKanbanStore must be used within KanbanStoreProvider");
  }
  return selector ? useStore(store, selector) : useStore(store);
}
