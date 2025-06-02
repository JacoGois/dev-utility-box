"use client";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import {
  ScrollBar as HorizontalScrollBar,
  ScrollArea,
} from "@/components/ui/ScrollArea";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { useKanbanStore } from "@/stores/useKanbanStore";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Edit2,
  Kanban as KanbanIcon,
  PlusCircle,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { KanbanCard } from "./components/KanbanCard";
import { KanbanColumn } from "./components/KanbanColumn";
import {
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
  Subtask,
  Tag,
} from "./types";

function KanbanBoardComponent() {
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
    handleDragEnd,
  } = useKanbanStore();

  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumnType | null>(
    null
  );
  const [formColumnTitle, setFormColumnTitle] = useState("");

  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCardType | null>(null);
  const [currentColumnIdForNewCard, setCurrentColumnIdForNewCard] = useState<
    string | null
  >(null);

  const [formCardTitle, setFormCardTitle] = useState("");
  const [formCardDescription, setFormCardDescription] = useState("");
  const [formCardTags, setFormCardTags] = useState("");
  const [formCardSubtasks, setFormCardSubtasks] = useState<Subtask[]>([]);
  const [formCardLinkPR, setFormCardLinkPR] = useState("");
  const [formCardLinkCommit, setFormCardLinkCommit] = useState("");
  const [formCardLinkBranch, setFormCardLinkBranch] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "card" | "column" | "tag";
  } | null>(null);

  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formTagName, setFormTagName] = useState("");
  const [formTagColor, setFormTagColor] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDraggableItem = useMemo(() => {
    if (!activeId) return null;
    if (columns[activeId]) return { type: "Column", data: columns[activeId] };
    if (cards[activeId]) return { type: "Card", data: cards[activeId] };
    return null;
  }, [activeId, columns, cards]);

  const handleOpenNewColumnForm = () => {
    setEditingColumn(null);
    setFormColumnTitle("");
    setIsColumnFormOpen(true);
  };
  const handleOpenEditColumnForm = (column: KanbanColumnType) => {
    setEditingColumn(column);
    setFormColumnTitle(column.title);
    setIsColumnFormOpen(true);
  };

  const resetCardForm = useCallback(() => {
    setFormCardTitle("");
    setFormCardDescription("");
    setFormCardTags("");
    setFormCardSubtasks([]);
    setFormCardLinkPR("");
    setFormCardLinkCommit("");
    setFormCardLinkBranch("");
    setEditingCard(null);
  }, []);

  const handleOpenNewCardForm = (columnId: string) => {
    resetCardForm();
    setCurrentColumnIdForNewCard(columnId);
    setIsCardFormOpen(true);
  };
  const handleOpenEditCardForm = (card: KanbanCardType) => {
    setEditingCard(card);
    setCurrentColumnIdForNewCard(card.columnId);
    setFormCardTitle(card.title);
    setFormCardDescription(card.description || "");
    setFormCardTags(
      card.tagIds
        .map((tagId) => tags[tagId]?.name)
        .filter(Boolean)
        .join(", ")
    );
    setFormCardSubtasks(card.subtasks.map((st) => ({ ...st })));
    setFormCardLinkPR(card.links?.pr || "");
    setFormCardLinkCommit(card.links?.commit || "");
    setFormCardLinkBranch(card.links?.branch || "");
    setIsCardFormOpen(true);
  };

  const handleSaveColumn = () => {
    if (!formColumnTitle.trim()) {
      toast.error("Título da coluna é obrigatório.");
      return;
    }
    if (editingColumn) {
      updateColumnTitle(editingColumn.id, formColumnTitle);
    } else {
      addColumn(formColumnTitle);
    }
    setIsColumnFormOpen(false);
  };

  const handleSaveCard = () => {
    if (!formCardTitle.trim()) {
      toast.error("Título do cartão é obrigatório.");
      return;
    }
    const inputTagNames = formCardTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tagIdsToSave: string[] = [];

    inputTagNames.forEach((tagName) => {
      let tag = Object.values(tags).find(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      );
      if (!tag) {
        const newTag = addTag(tagName, "");
        if (newTag) tag = newTag;
      }
      if (tag) tagIdsToSave.push(tag.id);
    });

    const cardDetails = {
      title: formCardTitle,
      description: formCardDescription,
      tagIds: tagIdsToSave,
      subtasks: formCardSubtasks,
      links: {
        pr: formCardLinkPR.trim() || undefined,
        commit: formCardLinkCommit.trim() || undefined,
        branch: formCardLinkBranch.trim() || undefined,
      },
    };

    if (editingCard) {
      updateCard({ ...editingCard, ...cardDetails, updatedAt: Date.now() });
    } else if (currentColumnIdForNewCard) {
      addCard(currentColumnIdForNewCard, cardDetails);
    }
    setIsCardFormOpen(false);
  };

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
      `${
        itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)
      } "${itemToDelete.name}" excluído(a).`
    );
    setItemToDelete(null);
  };

  const handleOpenTagManager = () => {
    setEditingTag(null);
    setFormTagName("");
    setFormTagColor("");
    setIsTagManagerOpen(true);
  };
  const handleOpenEditTagForm = (tag: Tag) => {
    setEditingTag(tag);
    setFormTagName(tag.name);
    setFormTagColor(tag.color || "");
    setIsTagManagerOpen(true);
  };
  const handleSaveTag = () => {
    if (!formTagName.trim()) {
      toast.error("Nome da tag é obrigatório.");
      return;
    }
    if (editingTag) {
      updateTag(editingTag.id, formTagName, formTagColor);
    } else {
      addTag(formTagName, formTagColor);
    }
    setIsTagManagerOpen(false);
  };

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      /* onDragOver={onDragOver} */ onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="flex flex-col h-full w-full p-3 gap-3 bg-background text-card-foreground">
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmActualDelete}
          title={`Confirmar Exclusão de ${
            itemToDelete?.type === "tag"
              ? "Tag"
              : itemToDelete?.type === "column"
              ? "Coluna"
              : "Cartão"
          }`}
          itemName={itemToDelete?.name || `este item`}
          description={
            itemToDelete?.type === "column"
              ? "Todos os cartões nesta coluna também serão excluídos."
              : undefined
          }
          confirmButtonVariant="destructive"
        />

        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h1 className="text-xl font-semibold flex items-center text-foreground">
            <KanbanIcon className="w-5 h-5 mr-2" /> Quadro Kanban Pessoal
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleOpenTagManager} variant="outline" size="sm">
              <TagIcon className="mr-2 h-4 w-4" /> Gerenciar Tags
            </Button>
            <Button onClick={handleOpenNewColumnForm} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Coluna
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-md">
          <div className="flex h-full gap-4 p-1 pb-4">
            <SortableContext
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                if (!column) return null;
                const columnCards = column.cardIds
                  .map((cardId) => cards[cardId])
                  .filter(Boolean) as KanbanCardType[];
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
            <KanbanCard
              card={activeDraggableItem.data as KanbanCardType}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleSubtask={() => {}}
            />
          ) : activeDraggableItem?.type === "Column" &&
            activeDraggableItem.data ? (
            <div className="w-72 md:w-80 bg-primary/20 rounded-lg flex flex-col h-auto flex-shrink-0 shadow-xl p-3 border-2 border-primary opacity-90">
              <h3 className="font-semibold text-sm text-primary-foreground">
                {(activeDraggableItem.data as KanbanColumnType).title}
              </h3>
            </div>
          ) : null}
        </DragOverlay>

        {/* Modal para Formulário de Coluna */}
        <Dialog
          open={isColumnFormOpen}
          onOpenChange={(open) => {
            setIsColumnFormOpen(open);
            if (!open) setEditingColumn(null);
          }}
        >
          <DialogContent className="sm:max-w-md z-[999999999]">
            <DialogHeader>
              <DialogTitle>
                {editingColumn ? "Editar Coluna" : "Nova Coluna"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="columnTitleInput"
                placeholder="Título da Coluna"
                value={formColumnTitle}
                onChange={(e) => setFormColumnTitle(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveColumn}>
                {editingColumn ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para Formulário de Cartão */}
        <Dialog
          open={isCardFormOpen}
          onOpenChange={(open) => {
            setIsCardFormOpen(open);
            if (!open) resetCardForm();
          }}
        >
          <DialogContent className="sm:max-w-lg z-[999999999]">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Editar Cartão" : "Novo Cartão"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-1 -mx-1">
              <div className="grid gap-4 py-4 px-4">
                <div className="space-y-1">
                  <label
                    htmlFor="cardFormTitle"
                    className="text-sm font-medium"
                  >
                    Título
                  </label>
                  <Input
                    id="cardFormTitle"
                    value={formCardTitle}
                    onChange={(e) => setFormCardTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="cardFormDescription"
                    className="text-sm font-medium"
                  >
                    Descrição
                  </label>
                  <Textarea
                    id="cardFormDescription"
                    value={formCardDescription}
                    onChange={(e) => setFormCardDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="cardFormTags" className="text-sm font-medium">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    id="cardFormTags"
                    value={formCardTags}
                    onChange={(e) => setFormCardTags(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sub-tarefas</label>
                  {formCardSubtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`form-subtask-check-${subtask.id}`}
                        checked={subtask.isCompleted}
                        onCheckedChange={(checked) => {
                          const newSubtasks = formCardSubtasks.map((st) =>
                            st.id === subtask.id
                              ? { ...st, isCompleted: !!checked }
                              : st
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
                              : st
                          );
                          setFormCardSubtasks(newSubtasks);
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormCardSubtasks((prev) =>
                            prev.filter((st) => st.id !== subtask.id)
                          );
                        }}
                        title="Remover sub-tarefa"
                      >
                        {" "}
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />{" "}
                      </Button>
                    </div>
                  ))}
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
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Adicionar
                    Sub-tarefa
                  </Button>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Links Dev</label>
                  <Input
                    id="cardFormLinkBranch"
                    placeholder="Branch Git"
                    value={formCardLinkBranch}
                    onChange={(e) => setFormCardLinkBranch(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    id="cardFormLinkCommit"
                    placeholder="URL do Commit"
                    value={formCardLinkCommit}
                    onChange={(e) => setFormCardLinkCommit(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    id="cardFormLinkPR"
                    placeholder="URL do Pull Request"
                    value={formCardLinkPR}
                    onChange={(e) => setFormCardLinkPR(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveCard}>
                {editingCard ? "Salvar Alterações" : "Criar Cartão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para Gerenciamento de Tags */}
        <Dialog open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
          <DialogContent className="sm:max-w-md z-[999999999]">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? "Editar Tag" : "Nova Tag"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nome da Tag"
                value={formTagName}
                onChange={(e) => setFormTagName(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <label htmlFor="tagColor" className="text-sm">
                  Cor:
                </label>
                <Input
                  id="tagColor"
                  type="color"
                  value={formTagColor}
                  onChange={(e) => setFormTagColor(e.target.value)}
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
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveTag}>
                {editingTag ? "Salvar Tag" : "Criar Tag"}
              </Button>
            </DialogFooter>
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Tags Existentes</h4>
              <ScrollArea className="max-h-[200px]">
                {Object.values(tags).length > 0 ? (
                  Object.values(tags).map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md group"
                    >
                      <Badge
                        style={{ backgroundColor: tag.color || undefined }}
                        variant={tag.color ? "default" : "secondary"}
                        className={cn(tag.color && "text-white")}
                      >
                        {tag.name}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditTagForm(tag)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
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
                    Nenhuma tag criada.
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
export { MemoizedKanbanBoard as KanbanBoard };
