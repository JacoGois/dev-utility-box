"use client";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Input } from "@/components/ui/form/Input";
import { Textarea } from "@/components/ui/form/Textarea";
import {
  ScrollBar as HorizontalScrollBar,
  ScrollArea,
} from "@/components/ui/ScrollArea";
import { useAppTranslations } from "@/hooks/useTranslations";
import { getTagTextColor, hexToRgba } from "@/lib/color";
import { cn } from "@/lib/utils";
import { KanbanStoreProvider, useKanbanStore } from "@/stores/useKanbanStore";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleX,
  Edit2,
  GripVertical,
  PlusCircle,
  Search,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "./components/KanbanColumn";
import {
  defaultKanbanCardValues,
  defaultKanbanColumnValues,
  defaultKanbanTagValues,
  useKanbanCardForm,
  useKanbanColumnForm,
  useKanbanTagForm,
} from "./hooks/useForm";
import {
  KanbanCardPriority,
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
  Subtask,
  Tag,
} from "./types";

type DueFilter = "all" | "overdue" | "today" | "noDue";
const resolvePriority = (priority: unknown): KanbanCardPriority => {
  if (priority === "P0") return 0;
  if (priority === "P1") return 1;
  if (priority === "P2") return 2;
  if (priority === "P3") return 3;
  if (typeof priority === "number" && priority >= 0 && priority <= 3) {
    return priority as KanbanCardPriority;
  }
  return 2;
};

function KanbanBoardComponent() {
  const t = useAppTranslations("kanbanBoard");
  const {
    cards,
    columns,
    columnOrder,
    tags,
    addColumn,
    updateColumnTitle,
    deleteColumn,

    addCard,
    updateCard,
    deleteCard,
    toggleSubtask,
    addTag,
    updateTag,
    deleteTag,
    handleDragEnd: handleStoreDragEnd,
  } = useKanbanStore();

  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumnType | null>(
    null,
  );
  const columnForm = useKanbanColumnForm(t);

  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCardType | null>(null);
  const [currentColumnIdForNewCard, setCurrentColumnIdForNewCard] = useState<
    string | null
  >(null);
  const cardForm = useKanbanCardForm(t);
  const [formCardTagIds, setFormCardTagIds] = useState<string[]>([]);
  const [formCardTagInput, setFormCardTagInput] = useState("");
  const [formCardSubtasks, setFormCardSubtasks] = useState<Subtask[]>([]);
  const [cardTitleFilter, setCardTitleFilter] = useState("");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [activePriorityFilters, setActivePriorityFilters] = useState<
    KanbanCardPriority[]
  >([]);
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(false);
  const [draggingSubtaskId, setDraggingSubtaskId] = useState<string | null>(
    null,
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "card" | "column" | "tag";
  } | null>(null);

  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const tagForm = useKanbanTagForm(t);
  const allTags = useMemo(() => Object.values(tags), [tags]);
  const appRootRef = useRef<HTMLDivElement | null>(null);
  const [cardModalContentEl, setCardModalContentEl] =
    useState<HTMLElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const activeType = args.active.data.current?.type;

      if (activeType === "Column") {
        const columnContainers = args.droppableContainers.filter((container) =>
          columnOrder.includes(String(container.id)),
        );

        return closestCenter({
          ...args,
          droppableContainers: columnContainers,
        });
      }

      return closestCorners(args);
    },
    [columnOrder],
  );

  const activeDraggableItem = useMemo(() => {
    if (!activeId) return null;
    if (columns[activeId]) return { type: "Column", data: columns[activeId] };
    if (cards[activeId]) return { type: "Card", data: cards[activeId] };
    return null;
  }, [activeId, columns, cards]);

  const filteredCardsByColumn = useMemo(() => {
    const normalizedFilter = cardTitleFilter.trim().toLowerCase();
    const result: Record<string, KanbanCardType[]> = {};
    const todayIso = new Date().toISOString().slice(0, 10);

    columnOrder.forEach((columnId) => {
      const column = columns[columnId];
      if (!column) {
        result[columnId] = [];
        return;
      }

      result[columnId] = column.cardIds
        .map((cardId) => cards[cardId])
        .filter(Boolean)
        .filter((card) => {
          const matchesText =
            !normalizedFilter ||
            card.title.toLowerCase().includes(normalizedFilter) ||
            (card.description || "").toLowerCase().includes(normalizedFilter);
          const matchesTags =
            activeTagFilters.length === 0 ||
            activeTagFilters.some((tagId) => card.tagIds.includes(tagId));
          const isOverdue = Boolean(card.dueDate && card.dueDate < todayIso);
          const cardPriority = resolvePriority(card.priority);
          const matchesDueFilter =
            dueFilter === "all" ||
            (dueFilter === "overdue" && isOverdue) ||
            (dueFilter === "today" && card.dueDate === todayIso) ||
            (dueFilter === "noDue" && !card.dueDate);
          const matchesPriorityFilter =
            activePriorityFilters.length === 0 ||
            activePriorityFilters.includes(cardPriority);

          return (
            matchesText &&
            matchesTags &&
            matchesDueFilter &&
            matchesPriorityFilter
          );
        }) as KanbanCardType[];
    });

    return result;
  }, [
    activeTagFilters,
    cardTitleFilter,
    cards,
    columnOrder,
    columns,
    dueFilter,
    activePriorityFilters,
  ]);
  const togglePriorityFilter = useCallback((priority: KanbanCardPriority) => {
    setActivePriorityFilters((prev) =>
      prev.includes(priority)
        ? prev.filter((current) => current !== priority)
        : [...prev, priority],
    );
  }, []);

  const priorityOptions: { value: KanbanCardPriority; label: string }[] = [
    { value: 0, label: t("priorities.critical") },
    { value: 1, label: t("priorities.high") },
    { value: 2, label: t("priorities.medium") },
    { value: 3, label: t("priorities.low") },
  ];
  const hasActiveFilters =
    !!cardTitleFilter ||
    activeTagFilters.length > 0 ||
    dueFilter !== "all" ||
    activePriorityFilters.length > 0;

  const handleOpenNewColumnForm = () => {
    setEditingColumn(null);
    columnForm.reset(defaultKanbanColumnValues);
    setIsColumnFormOpen(true);
  };
  const handleOpenEditColumnForm = (column: KanbanColumnType) => {
    setEditingColumn(column);
    columnForm.reset({ title: column.title });
    setIsColumnFormOpen(true);
  };

  const resetCardForm = useCallback(() => {
    cardForm.reset(defaultKanbanCardValues);
    setFormCardTagIds([]);
    setFormCardTagInput("");
    setFormCardSubtasks([]);
    setEditingCard(null);
  }, [cardForm]);

  const handleOpenNewCardForm = (columnId: string) => {
    resetCardForm();
    setCurrentColumnIdForNewCard(columnId);
    setIsCardFormOpen(true);
  };
  const handleOpenEditCardForm = (card: KanbanCardType) => {
    setEditingCard(card);
    setCurrentColumnIdForNewCard(card.columnId);
    cardForm.reset({
      title: card.title,
      description: card.description || "",
      priority: resolvePriority(card.priority),
      dueDate: card.dueDate || "",
      linkPR: card.links?.pr || "",
      linkCommit: card.links?.commit || "",
      linkBranch: card.links?.branch || "",
    });
    setFormCardTagIds(card.tagIds.filter((tagId) => !!tags[tagId]));
    setFormCardTagInput("");
    setFormCardSubtasks(card.subtasks.map((st) => ({ ...st })));
    setIsCardFormOpen(true);
  };

  const cardTagSuggestions = useMemo(() => {
    const search = formCardTagInput.trim().toLowerCase();
    return allTags
      .filter((tag) => !formCardTagIds.includes(tag.id))
      .filter((tag) => !search || tag.name.toLowerCase().includes(search))
      .slice(0, 8);
  }, [allTags, formCardTagIds, formCardTagInput]);

  const selectedCardTags = useMemo(
    () =>
      formCardTagIds
        .map((tagId) => tags[tagId])
        .filter((tag): tag is Tag => Boolean(tag)),
    [formCardTagIds, tags],
  );

  const addTagToCardForm = useCallback((tagId: string) => {
    setFormCardTagIds((prev) =>
      prev.includes(tagId) ? prev : [...prev, tagId],
    );
  }, []);

  const removeTagFromCardForm = useCallback((tagId: string) => {
    setFormCardTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  const addOrCreateTagFromInput = useCallback(() => {
    const tagName = formCardTagInput.trim();
    if (!tagName) return;

    const existingTag = allTags.find(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
    );
    if (existingTag) {
      addTagToCardForm(existingTag.id);
      setFormCardTagInput("");
      return;
    }

    const createdTag = addTag(tagName, "");
    if (createdTag) {
      addTagToCardForm(createdTag.id);
      setFormCardTagInput("");
    }
  }, [addTag, addTagToCardForm, allTags, formCardTagInput]);

  const toggleTagFilter = useCallback((tagId: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tagId)
        ? prev.filter((currentId) => currentId !== tagId)
        : [...prev, tagId],
    );
  }, []);

  const reorderSubtasks = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      setFormCardSubtasks((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === fromId);
        const toIndex = prev.findIndex((item) => item.id === toId);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [setFormCardSubtasks],
  );

  const markAllSubtasksCompleted = useCallback(() => {
    setFormCardSubtasks((prev) =>
      prev.map((st) => ({ ...st, isCompleted: true })),
    );
  }, []);

  const clearCompletedSubtasks = useCallback(() => {
    setFormCardSubtasks((prev) => prev.filter((st) => !st.isCompleted));
  }, []);

  const handleSaveColumn = columnForm.handleSubmit(({ title }) => {
    if (editingColumn) {
      updateColumnTitle(editingColumn.id, title);
    } else {
      addColumn(title);
    }
    setIsColumnFormOpen(false);
  });

  const handleSaveCard = cardForm.handleSubmit((values) => {
    const tagIdsToSave = [...formCardTagIds];
    const pendingTagName = formCardTagInput.trim();
    if (pendingTagName) {
      const existingTag = allTags.find(
        (tag) => tag.name.toLowerCase() === pendingTagName.toLowerCase(),
      );
      const resolvedTag = existingTag || addTag(pendingTagName, "");
      if (resolvedTag && !tagIdsToSave.includes(resolvedTag.id)) {
        tagIdsToSave.push(resolvedTag.id);
      }
    }

    const cardDetails = {
      title: values.title,
      description: values.description || "",
      priority: resolvePriority(values.priority),
      dueDate: values.dueDate || undefined,
      tagIds: tagIdsToSave,
      subtasks: formCardSubtasks,
      links: {
        pr: values.linkPR?.trim() || undefined,
        commit: values.linkCommit?.trim() || undefined,
        branch: values.linkBranch?.trim() || undefined,
      },
    };

    if (editingCard) {
      updateCard({ ...editingCard, ...cardDetails, updatedAt: Date.now() });
    } else if (currentColumnIdForNewCard) {
      addCard(currentColumnIdForNewCard, cardDetails);
    }
    setIsCardFormOpen(false);
  });

  const handleDeletePress = (item: {
    id: string;
    name: string;
    type: "card" | "column" | "tag";
  }) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmActualDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "card") {
      deleteCard(itemToDelete.id);
    } else if (itemToDelete.type === "column") {
      deleteColumn(itemToDelete.id);
    } else if (itemToDelete.type === "tag") {
      deleteTag(itemToDelete.id);
    }
    toast.info(
      t("messages.itemDeleted", {
        itemType: t(`itemTypes.${itemToDelete.type}`),
        itemName: itemToDelete.name,
      }),
    );
    setItemToDelete(null);
  };

  const handleOpenTagManager = () => {
    setEditingTag(null);
    tagForm.reset(defaultKanbanTagValues);
    setIsTagManagerOpen(true);
  };
  const handleOpenEditTagForm = (tag: Tag) => {
    setEditingTag(tag);
    tagForm.reset({
      name: tag.name,
      color: tag.color || "",
    });
    setIsTagManagerOpen(true);
  };
  const handleSaveTag = tagForm.handleSubmit(({ name, color }) => {
    if (editingTag) {
      updateTag(editingTag.id, name, color);
    } else {
      addTag(name, color);
    }
    setIsTagManagerOpen(false);
  });

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }
  function onDragEnd(event: DragEndEvent) {
    handleStoreDragEnd(event);
    setActiveId(null);
  }
  function onDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      collisionDetection={collisionDetectionStrategy}
    >
      <div
        ref={appRootRef}
        className="relative flex min-h-0 h-full w-full flex-col gap-3 overflow-hidden bg-background p-3 text-card-foreground @container"
      >
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmActualDelete}
          title={t("deleteDialog.title", {
            itemType: itemToDelete?.type
              ? t(`itemTypes.${itemToDelete.type}`)
              : "",
          })}
          itemName={itemToDelete?.name || t("deleteDialog.defaultItemName")}
          description={
            itemToDelete?.type === "column"
              ? t("deleteDialog.columnDescription")
              : undefined
          }
          confirmButtonVariant="destructive"
        />

        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span></span>
          <div className="flex gap-2">
            <Button onClick={handleOpenTagManager} variant="outline" size="sm">
              <TagIcon className="mr-2 h-4 w-4" /> {t("buttons.manageTags")}
            </Button>
            <Button onClick={handleOpenNewColumnForm} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> {t("buttons.newColumn")}
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div
            className={cn("flex flex-col", isFilterPanelExpanded && "gap-3")}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("filters.title")}
              </p>
              <div className="flex items-center gap-1">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCardTitleFilter("");
                      setActiveTagFilters([]);
                      setDueFilter("all");
                      setActivePriorityFilters([]);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    {t("filters.clear")}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setIsFilterPanelExpanded(
                      (prevIsExpanded) => !prevIsExpanded,
                    )
                  }
                  className="h-7 px-2 text-xs"
                >
                  {isFilterPanelExpanded
                    ? t("filters.collapse")
                    : t("filters.expand")}
                  <ChevronDown
                    className={cn(
                      "ml-1 h-3.5 w-3.5 transition-transform duration-300",
                      isFilterPanelExpanded ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isFilterPanelExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="max-h-[min(42vh,18rem)] space-y-3 overflow-y-auto pr-1 pt-1">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {t("filters.search")}
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={cardTitleFilter}
                        onChange={(e) => setCardTitleFilter(e.target.value)}
                        placeholder={t("filters.searchPlaceholder")}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {t("filters.tagsSelected", {
                        count: activeTagFilters.length,
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {allTags.length > 0 ? (
                        allTags.map((tag) => {
                          const isActive = activeTagFilters.includes(tag.id);
                          const tagBg = tag.color
                            ? isActive
                              ? tag.color
                              : hexToRgba(tag.color, 0.16)
                            : undefined;
                          const tagBorder = tag.color
                            ? hexToRgba(tag.color, isActive ? 0.85 : 0.5)
                            : undefined;
                          const tagText = tag.color
                            ? isActive
                              ? getTagTextColor(tag.color)
                              : tag.color
                            : undefined;
                          return (
                            <Button
                              key={tag.id}
                              type="button"
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => toggleTagFilter(tag.id)}
                              className="h-7 px-2 text-xs rounded-full border"
                              style={{
                                backgroundColor: tagBg,
                                borderColor: tagBorder,
                                color: tagText,
                              }}
                            >
                              {tag.name}
                            </Button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {t("filters.tagsEmpty")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {t("filters.prioritySelected", {
                        count: activePriorityFilters.length,
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {priorityOptions.map((priority) => (
                        <Button
                          key={priority.value}
                          type="button"
                          size="sm"
                          variant={
                            activePriorityFilters.includes(priority.value)
                              ? "default"
                              : "outline"
                          }
                          className="h-7 text-xs"
                          onClick={() => togglePriorityFilter(priority.value)}
                        >
                          {priority.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {t("filters.sla")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          dueFilter === "overdue" ? "default" : "outline"
                        }
                        className="h-7 gap-1 text-xs"
                        onClick={() =>
                          setDueFilter((prev) =>
                            prev === "overdue" ? "all" : "overdue",
                          )
                        }
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />{" "}
                        {t("filters.overdue")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={dueFilter === "today" ? "default" : "outline"}
                        className="h-7 gap-1 text-xs"
                        onClick={() =>
                          setDueFilter((prev) =>
                            prev === "today" ? "all" : "today",
                          )
                        }
                      >
                        <CalendarDays className="h-3.5 w-3.5" />{" "}
                        {t("filters.dueToday")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={dueFilter === "noDue" ? "default" : "outline"}
                        className="h-7 gap-1 text-xs"
                        onClick={() =>
                          setDueFilter((prev) =>
                            prev === "noDue" ? "all" : "noDue",
                          )
                        }
                      >
                        <CircleX className="h-3.5 w-3.5" />{" "}
                        {t("filters.noDueDate")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 w-full whitespace-nowrap rounded-md">
          <div className="flex h-full gap-4 p-1 pb-4">
            <SortableContext
              id="kanban-columns"
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                if (!column) return null;
                const columnCards = filteredCardsByColumn[columnId] || [];
                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    cards={columnCards}
                    onAddCard={handleOpenNewCardForm}
                    onEditCard={handleOpenEditCardForm}
                    onDeleteCard={(cardId, cardTitle) =>
                      handleDeletePress({
                        id: cardId,
                        name: cardTitle,
                        type: "card",
                      })
                    }
                    onToggleSubtask={toggleSubtask}
                    onEditColumn={handleOpenEditColumnForm}
                    onDeleteColumn={(colId, colTitle) =>
                      handleDeletePress({
                        id: colId,
                        name: colTitle,
                        type: "column",
                      })
                    }
                  />
                );
              })}
            </SortableContext>
          </div>
          <HorizontalScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay dropAnimation={null}>
          {activeDraggableItem?.type === "Card" && activeDraggableItem.data ? (
            <div className="w-72 rounded-md border bg-card p-3 shadow-xl">
              <h4 className="text-sm font-semibold break-words">
                {(activeDraggableItem.data as KanbanCardType).title}
              </h4>
            </div>
          ) : activeDraggableItem?.type === "Column" &&
            activeDraggableItem.data ? (
            <div className="w-72 md:w-80 bg-primary/20 rounded-lg flex flex-col h-auto flex-shrink-0 shadow-xl p-3 border-2 border-primary opacity-90">
              <h3 className="font-semibold text-sm text-primary-foreground">
                {(activeDraggableItem.data as KanbanColumnType).title}
              </h3>
            </div>
          ) : null}
        </DragOverlay>

        <Dialog
          open={isColumnFormOpen}
          onOpenChange={(open) => {
            setIsColumnFormOpen(open);
            if (!open) setEditingColumn(null);
          }}
        >
          <DialogContent
            portalContainer={appRootRef.current ?? undefined}
            overlayClassName="absolute inset-0 z-[120] bg-black/35"
            className="!absolute top-1/2 left-1/2 z-[121] sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>
                {editingColumn
                  ? t("columnForm.editTitle")
                  : t("columnForm.newTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="columnTitleInput"
                placeholder={t("columnForm.titlePlaceholder")}
                {...columnForm.register("title")}
                autoFocus
                error={!!columnForm.formState.errors.title}
              />
              {columnForm.formState.errors.title?.message && (
                <p className="text-xs text-destructive">
                  {columnForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common.cancel")}
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveColumn}>
                {editingColumn ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCardFormOpen}
          onOpenChange={(open) => {
            setIsCardFormOpen(open);
            if (!open) resetCardForm();
          }}
        >
          <DialogContent
            portalContainer={appRootRef.current ?? undefined}
            overlayClassName="absolute inset-0 z-[130] bg-black/40"
            className="!absolute top-1/2 left-1/2 z-[131] w-[min(96vw,680px)] max-w-[calc(100%-1rem)] p-4 sm:p-6"
            contentRef={(node) => setCardModalContentEl(node)}
          >
            <DialogHeader>
              <DialogTitle>
                {editingCard ? t("cardForm.editTitle") : t("cardForm.newTitle")}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-1 -mx-1">
              <div className="grid gap-4 py-4 px-4">
                <div className="space-y-1">
                  <label
                    htmlFor="cardFormTitle"
                    className="text-sm font-medium"
                  >
                    {t("cardForm.fields.title")}
                  </label>
                  <Input
                    id="cardFormTitle"
                    {...cardForm.register("title")}
                    autoFocus
                    error={!!cardForm.formState.errors.title}
                  />
                  {cardForm.formState.errors.title?.message && (
                    <p className="text-xs text-destructive">
                      {cardForm.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="cardFormDescription"
                    className="text-sm font-medium"
                  >
                    {t("cardForm.fields.description")}
                  </label>
                  <Textarea
                    id="cardFormDescription"
                    {...cardForm.register("description")}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t("cardForm.fields.priority")}
                    </label>
                    <select
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      value={String(cardForm.watch("priority"))}
                      onChange={(e) =>
                        cardForm.setValue(
                          "priority",
                          Number(e.target.value) as KanbanCardPriority,
                        )
                      }
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="cardFormDueDate"
                      className="text-sm font-medium"
                    >
                      {t("cardForm.fields.dueDate")}
                    </label>
                    <Input
                      id="cardFormDueDate"
                      type="date"
                      {...cardForm.register("dueDate")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="cardFormTags"
                      className="text-sm font-medium"
                    >
                      {t("cardForm.fields.tags")}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("cardForm.tagsSelected", {
                          count: selectedCardTags.length,
                        })}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setIsTagManagerOpen(true)}
                      >
                        {t("buttons.manageTags")}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      id="cardFormTags"
                      value={formCardTagInput}
                      placeholder={t("cardForm.tagInputPlaceholder")}
                      onChange={(e) => setFormCardTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOrCreateTagFromInput();
                        }
                      }}
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOrCreateTagFromInput}
                      className="w-full sm:w-auto"
                    >
                      {t("common.add")}
                    </Button>
                  </div>
                  {cardTagSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cardTagSuggestions.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTagToCardForm(tag.id)}
                          className="h-7 px-2 text-xs rounded-full border transition-colors hover:brightness-95"
                          style={
                            tag.color
                              ? {
                                  backgroundColor: hexToRgba(tag.color, 0.16),
                                  borderColor: hexToRgba(tag.color, 0.5),
                                  color: tag.color,
                                }
                              : undefined
                          }
                        >
                          + {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCardTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedCardTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => removeTagFromCardForm(tag.id)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition",
                            "border border-border hover:brightness-95",
                          )}
                          style={
                            tag.color
                              ? {
                                  backgroundColor: hexToRgba(tag.color, 0.2),
                                  borderColor: hexToRgba(tag.color, 0.55),
                                  color: tag.color,
                                }
                              : undefined
                          }
                          title={t("cardForm.removeTag")}
                        >
                          <span>{tag.name}</span>
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("cardForm.noTagsSelected")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-medium">
                      {t("cardForm.fields.subtasks")}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={markAllSubtasksCompleted}
                        disabled={formCardSubtasks.length === 0}
                      >
                        <CheckCheck className="mr-1 h-3.5 w-3.5" />
                        {t("cardForm.completeAllSubtasks")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={clearCompletedSubtasks}
                        disabled={
                          !formCardSubtasks.some((item) => item.isCompleted)
                        }
                      >
                        <CircleX className="mr-1 h-3.5 w-3.5" />
                        {t("cardForm.clearCompletedSubtasks")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormCardSubtasks((prev) => [
                            ...prev,
                            { id: nanoid(), text: "", isCompleted: false },
                          ])
                        }
                      >
                        <PlusCircle className="w-3.5 h-3.5 mr-1" />{" "}
                        {t("cardForm.addSubtask")}
                      </Button>
                    </div>
                  </div>
                  {formCardSubtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md border border-transparent px-1 py-1 transition",
                        draggingSubtaskId === subtask.id &&
                          "border-primary/50 bg-primary/5",
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingSubtaskId) {
                          reorderSubtasks(draggingSubtaskId, subtask.id);
                        }
                      }}
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDraggingSubtaskId(subtask.id)}
                        onDragEnd={() => setDraggingSubtaskId(null)}
                        className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title={t("cardForm.reorderSubtask")}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </button>
                      <Checkbox
                        id={`form-subtask-check-${subtask.id}`}
                        checked={subtask.isCompleted}
                        onCheckedChange={(checked) => {
                          const newSubtasks = formCardSubtasks.map((st) =>
                            st.id === subtask.id
                              ? { ...st, isCompleted: !!checked }
                              : st,
                          );
                          setFormCardSubtasks(newSubtasks);
                        }}
                      />
                      <Input
                        value={subtask.text}
                        onChange={(e) => {
                          const newSubtasks = formCardSubtasks.map((st) =>
                            st.id === subtask.id
                              ? { ...st, text: e.target.value }
                              : st,
                          );
                          setFormCardSubtasks(newSubtasks);
                        }}
                        className="h-8 min-w-0 flex-1 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/15 hover:text-black"
                        onClick={() => {
                          setFormCardSubtasks((prev) =>
                            prev.filter((st) => st.id !== subtask.id),
                          );
                        }}
                        title={t("cardForm.removeSubtask")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("cardForm.fields.devLinks")}
                  </label>
                  <Input
                    id="cardFormLinkBranch"
                    placeholder={t("cardForm.placeholders.gitBranch")}
                    {...cardForm.register("linkBranch")}
                    className="h-8 text-sm"
                  />
                  <Input
                    id="cardFormLinkCommit"
                    placeholder={t("cardForm.placeholders.commitUrl")}
                    {...cardForm.register("linkCommit")}
                    className="h-8 text-sm"
                  />
                  <Input
                    id="cardFormLinkPR"
                    placeholder={t("cardForm.placeholders.pullRequestUrl")}
                    {...cardForm.register("linkPR")}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common.cancel")}
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveCard}>
                {editingCard
                  ? t("cardForm.saveChanges")
                  : t("cardForm.createCard")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
          <DialogContent
            portalContainer={
              cardModalContentEl ?? appRootRef.current ?? undefined
            }
            overlayClassName="absolute inset-0 z-[140] bg-black/35"
            className="!absolute top-1/2 left-1/2 z-[141] sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>
                {editingTag ? t("tagForm.editTitle") : t("tagForm.newTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder={t("tagForm.namePlaceholder")}
                {...tagForm.register("name")}
                autoFocus
                error={!!tagForm.formState.errors.name}
              />
              {tagForm.formState.errors.name?.message && (
                <p className="text-xs text-destructive">
                  {tagForm.formState.errors.name.message}
                </p>
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="tagColor" className="text-sm">
                  {t("tagForm.color")}
                </label>
                <Input
                  id="tagColor"
                  type="color"
                  {...tagForm.register("color")}
                  className="h-8 w-16 p-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTagManagerOpen(false);
                  setEditingTag(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button type="button" onClick={handleSaveTag}>
                {editingTag ? t("tagForm.saveTag") : t("tagForm.createTag")}
              </Button>
            </DialogFooter>
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">
                {t("tagForm.existingTags")}
              </h4>
              <ScrollArea className="max-h-[200px]">
                {Object.values(tags).length > 0 ? (
                  Object.values(tags).map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center justify-between rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <Badge
                        style={{
                          backgroundColor: tag.color
                            ? hexToRgba(tag.color, 0.18)
                            : undefined,
                          borderColor: tag.color
                            ? hexToRgba(tag.color, 0.55)
                            : undefined,
                          color: tag.color || undefined,
                        }}
                        variant={tag.color ? "default" : "secondary"}
                        className={cn(
                          "border",
                          !tag.color && "text-foreground",
                        )}
                      >
                        {tag.name}
                      </Badge>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleOpenEditTagForm(tag)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/15 hover:text-black"
                          onClick={() =>
                            handleDeletePress({
                              id: tag.id,
                              name: tag.name,
                              type: "tag",
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("tagForm.empty")}
                  </p>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
}

const MemoizedKanbanBoard = React.memo(KanbanBoardComponent);
export function KanbanBoard({ instanceId }: { instanceId: string }) {
  const t = useAppTranslations("kanbanBoard");
  return (
    <KanbanStoreProvider
      instanceId={instanceId}
      defaultColumnTitles={{
        todo: t("defaultColumns.todo"),
        inProgress: t("defaultColumns.inProgress"),
        done: t("defaultColumns.done"),
      }}
    >
      <MemoizedKanbanBoard />
    </KanbanStoreProvider>
  );
}
