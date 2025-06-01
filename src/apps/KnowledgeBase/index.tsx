"use client";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import {
  Brain,
  Edit2,
  Edit3,
  Eye,
  Link as LinkIcon,
  PlusCircle,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { BacklinksPanel } from "./components/BacklinksPanel";
import { KnowledgeEntry } from "./types";

const KB_STORAGE_KEY = "knowledge-base-entries";

const findNoteByTitle = (
  title: string,
  entries: KnowledgeEntry[]
): KnowledgeEntry | undefined => {
  const normalizedTitle = title.trim().toLowerCase();
  return entries.find(
    (entry) => entry.title.trim().toLowerCase() === normalizedTitle
  );
};

function KnowledgeBaseComponent() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewingMarkdown, setIsPreviewingMarkdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showLinkNoteDialog, setShowLinkNoteDialog] = useState(false);
  const [linkNoteSearchTerm, setLinkNoteSearchTerm] = useState("");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEntriesRaw = localStorage.getItem(KB_STORAGE_KEY);
      if (savedEntriesRaw) {
        try {
          const savedEntries = JSON.parse(savedEntriesRaw) as KnowledgeEntry[];
          setEntries(savedEntries);
          if (savedEntries.length > 0) {
            const sorted = [...savedEntries].sort(
              (a, b) => b.updatedAt - a.updatedAt
            );
            setSelectedEntryId(sorted[0].id);
            setIsPreviewingMarkdown(true);
          }
        } catch (e) {
          console.error("Erro ao carregar Base de Conhecimento:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  const currentSelectedEntry = useMemo(() => {
    return entries.find((e) => e.id === selectedEntryId);
  }, [entries, selectedEntryId]);

  const resetAndClearForm = useCallback(() => {
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormSourceUrl("");
  }, []);

  const populateForm = useCallback(
    (entry: KnowledgeEntry | null) => {
      if (entry) {
        setFormTitle(entry.title);
        setFormContent(entry.content);
        setFormTags(entry.tags.join(", "));
        setFormSourceUrl(entry.sourceUrl || "");
      } else {
        resetAndClearForm();
      }
    },
    [resetAndClearForm]
  );

  const handleSelectEntry = useCallback(
    (entryId: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (entry) {
        setSelectedEntryId(entry.id);
        populateForm(entry);
        setIsEditing(false);
        setIsPreviewingMarkdown(true);
      }
    },
    [entries, populateForm]
  );

  const handleCreateNew = useCallback(() => {
    resetAndClearForm();
    setSelectedEntryId(null);
    setIsEditing(true);
    setIsPreviewingMarkdown(false);
    requestAnimationFrame(() =>
      document.getElementById("kb-title-input")?.focus()
    );
  }, [resetAndClearForm]);

  const handleEditSelected = () => {
    if (currentSelectedEntry) {
      setIsEditing(true);
      setIsPreviewingMarkdown(false);
    }
  };

  const handleSaveEntry = useCallback(() => {
    if (!formTitle.trim()) {
      toast.error("Título é obrigatório!");
      return;
    }
    const tagsArray = formTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    if (selectedEntryId && entries.some((e) => e.id === selectedEntryId)) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === selectedEntryId
            ? {
                ...e,
                title: formTitle,
                content: formContent,
                tags: tagsArray,
                sourceUrl: formSourceUrl,
                updatedAt: Date.now(),
              }
            : e
        )
      );
      toast.success("Entrada atualizada!");
    } else {
      const newEntryId = nanoid();
      const newEntry: KnowledgeEntry = {
        id: newEntryId,
        title: formTitle,
        content: formContent,
        tags: tagsArray,
        sourceUrl: formSourceUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
      };
      setEntries((prev) => [newEntry, ...prev]);
      setSelectedEntryId(newEntryId);
      toast.success("Entrada criada!");
    }
    setIsEditing(false);
    setIsPreviewingMarkdown(true);
  }, [
    formTitle,
    formContent,
    formTags,
    formSourceUrl,
    selectedEntryId,
    entries,
  ]);

  const handleDeleteEntryPress = useCallback(() => {
    if (currentSelectedEntry) {
      setShowDeleteDialog(true);
    } else {
      toast.error("Nenhuma entrada selecionada para excluir.");
    }
  }, [currentSelectedEntry]);

  const confirmActualDelete = useCallback(() => {
    if (!selectedEntryId) return;
    setEntries((prev) => prev.filter((e) => e.id !== selectedEntryId));
    resetAndClearForm();
    setSelectedEntryId(null);
    setIsEditing(false);
    toast.info("Entrada excluída.");
  }, [selectedEntryId, entries, resetAndClearForm]);

  useEffect(() => {
    if (currentSelectedEntry) {
      populateForm(currentSelectedEntry);
      if (!isEditing) setIsPreviewingMarkdown(true);
    } else if (!isEditing) {
      resetAndClearForm();
      setIsPreviewingMarkdown(false);
    }
  }, [currentSelectedEntry, isEditing, populateForm, resetAndClearForm]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          (entry.sourceUrl &&
            entry.sourceUrl.toLowerCase().includes(searchLower)) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, searchTerm]);

  const preprocessMarkdownContent = useCallback(
    (content: string, allEntriesToLink: KnowledgeEntry[]): string => {
      if (!content) return "";
      const internalLinkRegex = /\[\[(.*?)\]\]/g;
      return content.replace(internalLinkRegex, (match, capturedTitle) => {
        const targetEntry = findNoteByTitle(
          capturedTitle.trim(),
          allEntriesToLink
        );
        if (targetEntry) {
          return `[${capturedTitle.trim()}](#entry-${targetEntry.id})`;
        }
        return match;
      });
    },
    []
  );

  const markdownRenderers: Components = useMemo(
    () => ({
      a: ({ children, ...props }) => {
        const href = props.href;
        if (href && href.startsWith("#entry-")) {
          const entryId = href.substring("#entry-".length);
          return (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSelectEntry(entryId);
              }}
              className="text-primary hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-sm px-0.5 py-0"
            >
              {children}
            </button>
          );
        }
        return (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {children}
          </a>
        );
      },
    }),
    [handleSelectEntry]
  );

  const contentToDisplayOrEdit = useMemo(() => {
    if (isEditing && !isPreviewingMarkdown) {
      return formContent;
    }

    const sourceContent = isEditing
      ? formContent
      : currentSelectedEntry?.content || "";
    return preprocessMarkdownContent(sourceContent, entries);
  }, [
    isEditing,
    isPreviewingMarkdown,
    formContent,
    currentSelectedEntry?.content,
    entries,
    preprocessMarkdownContent,
  ]);

  const notesAvailableToLink = useMemo(() => {
    return entries
      .filter((e) => (selectedEntryId ? e.id !== selectedEntryId : true))
      .filter((entry) =>
        entry.title.toLowerCase().includes(linkNoteSearchTerm.toLowerCase())
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [entries, linkNoteSearchTerm, selectedEntryId]);

  const handleInsertLink = (targetNote: KnowledgeEntry) => {
    const linkText = `[[${targetNote.title}]]`;
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formContent;
      const newText = text.substring(0, start) + linkText + text.substring(end);
      setFormContent(newText);
      textarea.focus();
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + linkText.length;
      });
    }
    setShowLinkNoteDialog(false);
    setLinkNoteSearchTerm("");
  };

  const showRightPanelContent = isEditing || currentSelectedEntry;

  return (
    <div className="flex h-full w-full bg-card text-card-foreground border-t border-border">
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmActualDelete}
        title="Confirmar Exclusão"
        itemName={currentSelectedEntry?.title || "esta entrada"}
        confirmButtonVariant="destructive"
      />

      <Dialog open={showLinkNoteDialog} onOpenChange={setShowLinkNoteDialog}>
        <DialogContent className="sm:max-w-md z-[999999]">
          <DialogHeader>
            <DialogTitle>Linkar com outra entrada</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Buscar entrada pelo título..."
            value={linkNoteSearchTerm}
            onChange={(e) => setLinkNoteSearchTerm(e.target.value)}
            className="my-2"
            autoFocus
          />
          <ScrollArea className="max-h-[300px] border rounded-md">
            {notesAvailableToLink.length > 0 ? (
              notesAvailableToLink.map((note, index) => (
                <div
                  key={note.id}
                  className={cn(
                    "p-2 hover:bg-primary cursor-pointer",
                    notesAvailableToLink.length - 1 !== index && "border-b"
                  )}
                  onClick={() => handleInsertLink(note)}
                >
                  {note.title}
                </div>
              ))
            ) : (
              <p className="p-2 text-sm text-muted-foreground">
                Nenhuma entrada encontrada.
              </p>
            )}
          </ScrollArea>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkNoteDialog(false);
                setLinkNoteSearchTerm("");
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-1/3 min-w-[280px] max-w-[400px] border-r border-border flex flex-col">
        <div className="p-2.5 border-b border-border space-y-2">
          <Button
            onClick={handleCreateNew}
            variant="outline"
            size="sm"
            className="w-full justify-start bg-card"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar entradas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-grow h-full overflow-y-auto">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleSelectEntry(entry.id)}
              className={cn(
                "group p-3 cursor-pointer hover:bg-primary border-b border-border/50",
                selectedEntryId === entry.id &&
                  "bg-primary text-primary-foreground"
              )}
            >
              <h3
                className={cn(
                  "font-semibold text-sm truncate group-hover:text-primary-foreground"
                )}
              >
                {entry.title || "Entrada sem título"}
              </h3>
              <div className="flex gap-1 mt-1 flex-wrap">
                {entry.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      "text-xs group-hover:text-primary-foreground",
                      selectedEntryId === entry.id && "text-primary-foreground"
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && searchTerm && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma entrada encontrada.
            </p>
          )}
          {filteredEntries.length === 0 &&
            !searchTerm &&
            entries.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma entrada criada.
              </p>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {showRightPanelContent ? (
          <>
            <div className="p-3 border-b border-border flex flex-col gap-3">
              {isEditing ? (
                <Input
                  id="kb-title-input"
                  type="text"
                  placeholder="Título da Entrada"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xl font-semibold mb-0"
                />
              ) : (
                <div className="flex justify-between items-center min-h-[44px] mb-0">
                  <h2 className="text-xl font-semibold truncate py-1">
                    {currentSelectedEntry?.title}
                  </h2>
                  {currentSelectedEntry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditSelected}
                      title="Editar Entrada"
                    >
                      <Edit2 className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  )}
                </div>
              )}
              {isEditing && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Tags (separadas por vírgula)"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    type="url"
                    placeholder="URL da Fonte (opcional)"
                    value={formSourceUrl}
                    onChange={(e) => setFormSourceUrl(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              )}
              {!isEditing && currentSelectedEntry?.sourceUrl && (
                <div className="text-xs text-muted-foreground flex items-center">
                  <LinkIcon className="w-3 h-3.5 mr-1.5 flex-shrink-0" />
                  <a
                    href={currentSelectedEntry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline break-all text-blue-500"
                  >
                    {currentSelectedEntry.sourceUrl}
                  </a>
                </div>
              )}
              {!isEditing &&
                currentSelectedEntry &&
                currentSelectedEntry.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {currentSelectedEntry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex-1 grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] overflow-hidden">
              <div className="flex flex-col overflow-hidden md:border-r md:border-border">
                {isEditing && (
                  <div className="p-2 border-b border-border flex justify-end items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLinkNoteDialog(true)}
                      title="Linkar com outra nota"
                      className="mr-2"
                    >
                      <LinkIcon className="mr-1.5 h-4 w-4" /> Linkar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setIsPreviewingMarkdown(!isPreviewingMarkdown)
                      }
                      title={
                        isPreviewingMarkdown
                          ? "Editar Markdown"
                          : "Visualizar Markdown"
                      }
                    >
                      {isPreviewingMarkdown ? (
                        <Edit3 className="mr-1.5 h-4 w-4" />
                      ) : (
                        <Eye className="mr-1.5 h-4 w-4" />
                      )}
                      {isPreviewingMarkdown ? "Editor" : "Preview"}
                    </Button>
                  </div>
                )}
                <div className="flex-grow h-full">
                  {isEditing && !isPreviewingMarkdown ? (
                    <Textarea
                      ref={contentTextareaRef}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Escreva sua entrada em Markdown..."
                      className="p-3 w-full h-[calc(100%-50px)] resize-none border rounded-md focus:ring-primary-foreground text-sm bg-transparent font-mono "
                    />
                  ) : currentSelectedEntry ||
                    (isEditing && isPreviewingMarkdown) ? (
                    <ScrollArea className="absolute inset-1 p-3 prose prose-invert max-w-none bg-muted/50 rounded-md h-[calc(100%-50px)]">
                      <ReactMarkdown
                        components={markdownRenderers}
                        remarkPlugins={[remarkGfm]}
                      >
                        {isEditing ? formContent : contentToDisplayOrEdit}
                      </ReactMarkdown>
                    </ScrollArea>
                  ) : null}
                </div>
              </div>
              <div className="overflow-y-auto md:p-0">
                {currentSelectedEntry && (
                  <BacklinksPanel
                    selectedEntry={currentSelectedEntry}
                    allEntries={entries}
                    onSelectEntry={handleSelectEntry}
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="p-2 border-t border-border flex justify-end items-center">
                <div className="flex gap-2">
                  {selectedEntryId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteEntryPress}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSaveEntry}>
                    <Save className="mr-2 h-4 w-4" />
                    {selectedEntryId
                      ? "Atualizar Entrada"
                      : "Salvar Nova Entrada"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setIsPreviewingMarkdown(true);
                      if (currentSelectedEntry) {
                        populateForm(currentSelectedEntry);
                      } else {
                        resetAndClearForm();
                        setSelectedEntryId(null);
                      }
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Brain className="w-16 h-16 mb-4" />
            <p className="text-center">
              Selecione uma entrada para visualizar ou clique em{" "}
              {'"Nova Entrada"'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const MemoizedKnowledgeBase = React.memo(KnowledgeBaseComponent);
export { MemoizedKnowledgeBase as KnowledgeBase };
