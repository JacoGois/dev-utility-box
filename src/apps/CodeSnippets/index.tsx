"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import {
  Code2,
  Copy,
  Edit2,
  PlusCircle,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Language, Snippet } from "./shared";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const SNIPPETS_STORAGE_KEY = "code-snippets-all";

const supportedLanguages: Language[] = [
  "Javascript",
  "Typescript",
  "Python",
  "HTML",
  "CSS",
  "JSON",
  "Markdown",
  "Bash",
  "SQL",
  "Outro",
];

const CodeSnippetsComponent = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLanguage, setFormLanguage] = useState<Language>("Javascript");
  const [formTags, setFormTags] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSnippetsRaw = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      if (savedSnippetsRaw) {
        const savedSnippets = JSON.parse(savedSnippetsRaw) as Snippet[];
        setSnippets(savedSnippets);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
    }
  }, [snippets]);

  const currentSelectedSnippetObject = useMemo(() => {
    return snippets.find((s) => s.id === selectedSnippetId);
  }, [snippets, selectedSnippetId]);

  const resetAndClearForm = useCallback(() => {
    setFormTitle("");
    setFormCode("");
    setFormLanguage("Javascript");
    setFormTags("");
    setFormDescription("");
    setSelectedSnippetId(null);
    setIsEditing(false);
  }, []);

  const populateForm = useCallback(
    (snippet: Snippet | null) => {
      if (snippet) {
        setFormTitle(snippet.title);
        setFormCode(snippet.code);
        setFormLanguage(snippet.language);
        setFormTags(snippet.tags.join(", "));
        setFormDescription(snippet.description || "");
      } else {
        resetAndClearForm();
      }
    },
    [resetAndClearForm]
  );

  const handleSelectSnippet = useCallback(
    (snippet: Snippet) => {
      setSelectedSnippetId(snippet.id);
      populateForm(snippet);
      setIsEditing(false);
    },
    [populateForm]
  );

  const handleCreateNew = useCallback(() => {
    resetAndClearForm();
    setSelectedSnippetId(null);
    setIsEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("snippet-title-input")?.focus();
    });
  }, [resetAndClearForm]);

  const handleEditSelected = () => {
    if (currentSelectedSnippetObject) {
      populateForm(currentSelectedSnippetObject);
      setIsEditing(true);
    }
  };

  const handleSaveSnippet = useCallback(() => {
    if (!formTitle.trim() || !formCode.trim()) {
      toast.error("Título e Código são obrigatórios!");
      return;
    }
    const tagsArray = formTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    let savedSnippetId = selectedSnippetId;

    if (selectedSnippetId && snippets.some((s) => s.id === selectedSnippetId)) {
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === selectedSnippetId
            ? {
                ...s,
                title: formTitle,
                code: formCode,
                language: formLanguage,
                tags: tagsArray,
                description: formDescription,
                updatedAt: Date.now(),
              }
            : s
        )
      );
      toast.success("Snippet atualizado!");
    } else {
      const newSnippetId = nanoid();
      savedSnippetId = newSnippetId;
      const newSnippet: Snippet = {
        id: newSnippetId,
        title: formTitle,
        code: formCode,
        language: formLanguage,
        tags: tagsArray,
        description: formDescription,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
      };
      setSnippets((prev) => [newSnippet, ...prev]);
      setSelectedSnippetId(newSnippetId);
      toast.success("Snippet criado!");
    }
    setIsEditing(false);

    const justSavedSnippet =
      snippets.find((s) => s.id === savedSnippetId) ||
      (selectedSnippetId === null &&
        snippets.find((s) => s.id === savedSnippetId));
    if (justSavedSnippet) populateForm(justSavedSnippet);
  }, [
    formTitle,
    formCode,
    formLanguage,
    formTags,
    formDescription,
    selectedSnippetId,
    snippets,
    populateForm,
  ]);

  const handleDeleteSnippetPress = useCallback(() => {
    if (currentSelectedSnippetObject) {
      setShowDeleteDialog(true);
    } else {
      toast.error("Nenhum snippet selecionado para excluir.");
    }
  }, [currentSelectedSnippetObject]);

  const confirmActualDelete = useCallback(() => {
    if (!selectedSnippetId) return;
    setSnippets((prev) => prev.filter((s) => s.id !== selectedSnippetId));
    resetAndClearForm();
    setSelectedSnippetId(null);
    setIsEditing(false);
    toast.info("Snippet excluído.");
  }, [selectedSnippetId, snippets, resetAndClearForm]);

  const handleCopyToClipboard = useCallback((code: string | undefined) => {
    if (typeof code !== "string") {
      toast.error("Nenhum código para copiar.");
      return;
    }
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Código copiado!"))
      .catch(() => toast.error("Falha ao copiar o código."));
  }, []);

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter((snippet) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          snippet.title.toLowerCase().includes(searchLower) ||
          (snippet.description &&
            snippet.description.toLowerCase().includes(searchLower)) ||
          snippet.language.toLowerCase().includes(searchLower) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [snippets, searchTerm]);

  useEffect(() => {
    if (currentSelectedSnippetObject) {
      populateForm(currentSelectedSnippetObject);
    } else if (!isEditing) {
      resetAndClearForm();
    }
  }, [
    currentSelectedSnippetObject,
    isEditing,
    populateForm,
    resetAndClearForm,
  ]);

  const showRightPanelContent = isEditing || currentSelectedSnippetObject;

  return (
    <div className="flex h-full w-full bg-card text-card-foreground border-t border-border">
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmActualDelete}
        title="Confirmar Exclusão de Snippet"
        itemName={currentSelectedSnippetObject?.title || "este snippet"}
        confirmButtonVariant="destructive"
      />
      <div className="w-1/3 min-w-[250px] max-w-[350px] border-r border-border flex flex-col">
        <div className="p-2.5 border-b border-border space-y-2">
          <Button
            onClick={handleCreateNew}
            variant="outline"
            size="sm"
            className="w-full justify-start bg-card"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Snippet
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => handleSelectSnippet(snippet)}
              className={cn(
                "group p-3 cursor-pointer hover:bg-primary hover:text-primary-foreground border-b border-border/50",
                selectedSnippetId === snippet.id && "bg-primary"
              )}
            >
              <h3
                className={cn(
                  "font-semibold text-sm truncate group-hover:text-primary-foreground",
                  selectedSnippetId === snippet.id && "text-primary-foreground"
                )}
              >
                {snippet.title}
              </h3>
              <div className="flex gap-1 mt-1 flex-wrap group-hover:text-primary-foreground">
                <Badge variant="secondary" className="text-xs">
                  {snippet.language}
                </Badge>
                {snippet.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      "text-xs group-hover:text-primary-foreground",
                      selectedSnippetId === snippet.id &&
                        "text-primary-foreground"
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {filteredSnippets.length === 0 && searchTerm && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum snippet encontrado.
            </p>
          )}
          {filteredSnippets.length === 0 &&
            !searchTerm &&
            snippets.length === 0 && (
              <p className="p-4 text-center text-sm w-full text-muted-foreground">
                Nenhum snippet criado ainda. Clique em {'"Novo Snippet"'}.
              </p>
            )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {showRightPanelContent ? (
          <>
            <div className="p-2 border-b border-border flex flex-col gap-2">
              {isEditing ? (
                <Input
                  id="snippet-title-input"
                  type="text"
                  placeholder="Título do Snippet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              ) : (
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold px-1">
                    {currentSelectedSnippetObject?.title}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditSelected}
                    title="Editar Snippet"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {isEditing && (
                <>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={formLanguage}
                      onValueChange={(value) =>
                        setFormLanguage(value as Language)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Linguagem" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999999999]">
                        {supportedLanguages.map((lang) => (
                          <SelectItem
                            key={lang}
                            value={lang}
                            className="text-xs"
                          >
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Tags (separadas por vírgula)"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="h-8 text-xs flex-grow"
                    />
                  </div>
                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="h-20 text-xs resize-none"
                  />
                </>
              )}
              {!isEditing && currentSelectedSnippetObject?.description && (
                <p className="px-1 text-sm text-muted-foreground">
                  {currentSelectedSnippetObject.description}
                </p>
              )}
              {!isEditing && currentSelectedSnippetObject && (
                <div className="px-1 flex gap-2 mt-1 flex-wrap items-center">
                  <Badge variant="secondary" className="text-xs">
                    {currentSelectedSnippetObject.language}
                  </Badge>
                  {currentSelectedSnippetObject.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-grow relative overflow-hidden">
              {isEditing ? (
                <Textarea
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Seu código aqui..."
                  className="p-4 w-full h-full resize-none border-0 focus:ring-0 text-sm bg-background font-mono absolute inset-0"
                />
              ) : currentSelectedSnippetObject ? (
                <ScrollArea className="absolute inset-0 p-0 bg-muted h-full">
                  <SyntaxHighlighter
                    language={currentSelectedSnippetObject.language.toLowerCase()}
                    style={atomOneDark}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      height: "100%",
                      overflow: "auto",
                      background: "var(--muted)",
                    }}
                    showLineNumbers
                    wrapLines
                    lineNumberStyle={{ opacity: 0.5 }}
                  >
                    {currentSelectedSnippetObject.code}
                  </SyntaxHighlighter>
                </ScrollArea>
              ) : null}
            </div>

            <div className="p-2 border-t border-border flex justify-between items-center">
              <div>
                {currentSelectedSnippetObject && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(currentSelectedSnippetObject.code)
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copiar Código
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing && selectedSnippetId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSnippetPress}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                )}
                {isEditing && (
                  <Button size="sm" onClick={handleSaveSnippet}>
                    <Save className="mr-2 h-4 w-4" />
                    {selectedSnippetId ? "Atualizar" : "Salvar Novo"}
                  </Button>
                )}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);

                      if (!selectedSnippetId && currentSelectedSnippetObject) {
                        populateForm(currentSelectedSnippetObject);
                      } else if (!selectedSnippetId) {
                        resetAndClearForm();
                        setSelectedSnippetId(null);
                      }
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Code2 className="w-16 h-16 mb-4" />
            <p className="text-center w-9/10">
              Selecione um snippet para visualizar ou clique em{" "}
              {'"Novo Snippet"'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const CodeSnippets = React.memo(CodeSnippetsComponent);
