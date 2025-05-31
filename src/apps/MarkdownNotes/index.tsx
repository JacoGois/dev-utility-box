"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { Edit3, Eye, PlusCircle, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "./shared";

type MarkdownNotesProps = {
  instanceId: string;
};

const NOTES_STORAGE_KEY_PREFIX = "markdown-notes-app-";

export function MarkdownNotes({ instanceId }: MarkdownNotesProps) {
  const storageKey = useMemo(
    () => `${NOTES_STORAGE_KEY_PREFIX}${instanceId}`,
    [instanceId]
  );

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [editorTitle, setEditorTitle] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const allLoadedNotesMap = new Map<string, Note>();
    const prefix = NOTES_STORAGE_KEY_PREFIX;
    const keysProcessedForLoading: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        keysProcessedForLoading.push(key);

        const savedNotesArrayRaw = localStorage.getItem(key);

        if (savedNotesArrayRaw) {
          const notesInThisKey = JSON.parse(savedNotesArrayRaw) as Note[];
          if (Array.isArray(notesInThisKey)) {
            notesInThisKey.forEach((note) => {
              if (
                note &&
                typeof note.id === "string" &&
                typeof note.title === "string" &&
                typeof note.content === "string" &&
                typeof note.createdAt === "number" &&
                typeof note.updatedAt === "number"
              ) {
                const existingNote = allLoadedNotesMap.get(note.id);
                if (!existingNote || note.updatedAt > existingNote.updatedAt) {
                  allLoadedNotesMap.set(note.id, note);
                }
              }
            });
          }
        }
      }
    }

    const finalNotesArray = Array.from(allLoadedNotesMap.values());

    if (finalNotesArray.length > 0) {
      const sortedNotes = [...finalNotesArray].sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      setNotes(sortedNotes);
      setSelectedNoteId(sortedNotes[0].id);
    } else {
      setNotes([]);
      setSelectedNoteId(null);
    }

    const timeoutId = setTimeout(() => {
      if (typeof window !== "undefined") {
        keysProcessedForLoading.forEach((keyToDelete) => {
          if (keyToDelete !== storageKey) {
            localStorage.removeItem(keyToDelete);
          }
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [instanceId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, storageKey]);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find((n) => n.id === selectedNoteId);
      if (note) {
        setEditorTitle(note.title);
        setEditorContent(note.content);
        setIsPreviewMode(false);
      }
    } else {
      setEditorTitle("");
      setEditorContent("");
    }
  }, [selectedNoteId, notes]);

  const handleCreateNewNote = useCallback(() => {
    const newNote: Note = {
      id: nanoid(),
      title: "Nova Nota",
      content: "# Nova Nota\n\nComece a escrever...",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
  }, []);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleUpdateNote = useCallback(() => {
    if (!selectedNoteId) return;

    setNotes((prevNotes) => {
      const noteToUpdate = prevNotes.find((note) => note.id === selectedNoteId);

      if (!noteToUpdate) {
        return prevNotes;
      }

      const titleHasChanged = editorTitle !== noteToUpdate.title;
      const contentHasChanged = editorContent !== noteToUpdate.content;

      if (titleHasChanged || contentHasChanged) {
        return prevNotes.map((note) =>
          note.id === selectedNoteId
            ? {
                ...note,
                title: editorTitle,
                content: editorContent,
                updatedAt: Date.now(),
              }
            : note
        );
      } else {
        return prevNotes;
      }
    });
  }, [selectedNoteId, editorTitle, editorContent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedNoteId) {
        handleUpdateNote();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [editorContent, editorTitle, handleUpdateNote, selectedNoteId]);

  const handleDeleteNote = useCallback(() => {
    if (!selectedNoteId) return;
    if (
      window.confirm(
        `Tem certeza que deseja excluir a nota "${editorTitle || "esta nota"}"?`
      )
    ) {
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== selectedNoteId)
      );
      setSelectedNoteId(null);
    }
  }, [selectedNoteId, editorTitle]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId),
    [notes, selectedNoteId]
  );

  return (
    <div className="flex h-full w-full bg-card text-card-foreground border-t border-border">
      <div className="w-1/3 min-w-[200px] max-w-[300px] border-r border-border flex flex-col">
        <div className="p-2.5 border-b border-border">
          <Button
            onClick={handleCreateNewNote}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Nota
          </Button>
        </div>
        <ScrollArea className="flex-grow h-[85%]">
          {notes
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={cn(
                  "p-3 cursor-pointer hover:bg-primary border-b border-border/50 hover:text-primary-foreground group",
                  selectedNoteId === note.id &&
                    "bg-primary/80 text-primary-foreground"
                )}
              >
                <h3 className="font-semibold text-sm truncate">
                  {note.title || "Nota sem título"}
                </h3>
                <p
                  className={cn(
                    "text-xs text-muted-foreground truncate group-hover:text-primary-foreground",
                    selectedNoteId === note.id && "text-primary-foreground"
                  )}
                >
                  {new Date(note.updatedAt).toLocaleDateString()} -{" "}
                  {note.content.substring(0, 30).replace(/(\r\n|\n|\r)/gm, " ")}
                  ...
                </p>
              </div>
            ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNoteId && selectedNote ? (
          <>
            <div className="p-2 border-b border-border flex items-center justify-between">
              <Input
                type="text"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                placeholder="Título da Nota"
                className="text-lg font-semibold border-0 focus:ring-0 shadow-none flex-grow"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  variant="ghost"
                  size="sm"
                  title={isPreviewMode ? "Editar" : "Visualizar"}
                >
                  {isPreviewMode ? (
                    <Edit3 className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleDeleteNote}
                  variant="ghost"
                  size="sm"
                  title="Excluir Nota"
                  className="text-destructive hover:text-primary-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isPreviewMode ? (
              <ScrollArea className="p-4 flex-grow prose prose-invert max-w-none bg-background text-foreground overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {editorContent}
                </ReactMarkdown>
              </ScrollArea>
            ) : (
              <Textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Escreva sua nota em Markdown..."
                className="p-4 flex-grow w-full h-full resize-none border-0 focus:ring-0 text-sm bg-background font-mono"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Edit3 className="w-16 h-16 mb-4" />
            <p>Selecione uma nota para editar ou crie uma nova.</p>
          </div>
        )}
      </div>
    </div>
  );
}
