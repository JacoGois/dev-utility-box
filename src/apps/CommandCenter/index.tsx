"use client";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
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
  Copy,
  Edit2,
  PlusCircle,
  Save,
  Search,
  TerminalSquare,
  Trash2,
  XCircle,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CliCommand } from "./types";

const COMMANDS_STORAGE_KEY = "cli-center-commands";

const commandPlatforms: Array<CliCommand["platform"]> = [
  "bash",
  "powershell",
  "docker",
  "git",
  "npm",
  "yarn",
  "kubectl",
  "other",
];

function CommandCenterComponent() {
  const [commands, setCommands] = useState<CliCommand[]>([]);
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null
  );

  const [formName, setFormName] = useState("");
  const [formCommand, setFormCommand] = useState("");
  const [formPlatform, setFormPlatform] =
    useState<CliCommand["platform"]>("bash");
  const [formTags, setFormTags] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCommandsRaw = localStorage.getItem(COMMANDS_STORAGE_KEY);
      if (savedCommandsRaw) {
        try {
          const savedCommands = JSON.parse(savedCommandsRaw) as CliCommand[];
          setCommands(savedCommands);
        } catch (e) {
          console.error("Erro ao carregar comandos da Central:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(commands));
    }
  }, [commands]);

  const currentSelectedCommandObject = useMemo(() => {
    return commands.find((c) => c.id === selectedCommandId);
  }, [commands, selectedCommandId]);

  const resetAndClearForm = useCallback(() => {
    setFormName("");
    setFormCommand("");
    setFormPlatform("bash");
    setFormTags("");
    setFormDescription("");
  }, []);

  const populateForm = useCallback(
    (command: CliCommand | null) => {
      if (command) {
        setFormName(command.name);
        setFormCommand(command.command);
        setFormPlatform(command.platform || "bash");
        setFormTags(command.tags.join(", "));
        setFormDescription(command.description || "");
      } else {
        resetAndClearForm();
      }
    },
    [resetAndClearForm]
  );

  const handleSelectCommand = useCallback(
    (command: CliCommand) => {
      setSelectedCommandId(command.id);
      populateForm(command);
      setIsEditing(false);
    },
    [populateForm]
  );

  const handleCreateNew = useCallback(() => {
    resetAndClearForm();
    setSelectedCommandId(null);
    setIsEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("command-center-name-input")?.focus();
    });
  }, [resetAndClearForm]);

  const handleEditSelected = () => {
    if (currentSelectedCommandObject) {
      setIsEditing(true);
    }
  };

  const handleSaveCommand = useCallback(() => {
    if (!formName.trim() || !formCommand.trim()) {
      toast.error("Nome e Comando são obrigatórios!");
      return;
    }
    const tagsArray = formTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    if (selectedCommandId && commands.some((c) => c.id === selectedCommandId)) {
      setCommands((prev) =>
        prev.map((c) =>
          c.id === selectedCommandId
            ? {
                ...c,
                name: formName,
                command: formCommand,
                platform: formPlatform,
                tags: tagsArray,
                description: formDescription,
                updatedAt: Date.now(),
              }
            : c
        )
      );
      toast.success("Comando atualizado!");
    } else {
      const newCommandId = nanoid();
      const newCommand: CliCommand = {
        id: newCommandId,
        name: formName,
        command: formCommand,
        platform: formPlatform,
        tags: tagsArray,
        description: formDescription,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCommands((prev) => [newCommand, ...prev]);
      setSelectedCommandId(newCommandId);
      toast.success("Comando criado!");
    }
    setIsEditing(false);
  }, [
    formName,
    formCommand,
    formPlatform,
    formTags,
    formDescription,
    selectedCommandId,
    commands,
  ]);

  const handleDeleteCommandPress = useCallback(() => {
    if (currentSelectedCommandObject) {
      setShowDeleteDialog(true);
    } else {
      toast.error("Nenhum comando selecionado para excluir.");
    }
  }, [currentSelectedCommandObject]);

  const confirmActualDelete = useCallback(() => {
    if (!selectedCommandId) return;
    setCommands((prev) => prev.filter((c) => c.id !== selectedCommandId));
    resetAndClearForm();
    setSelectedCommandId(null);
    setIsEditing(false);
    toast.info("Comando excluído.");
  }, [selectedCommandId, commands, resetAndClearForm]);

  const handleCopyToClipboard = useCallback(
    (text: string | undefined, type: string = "Comando") => {
      if (typeof text !== "string" || !text.trim()) {
        toast.error(`Nenhum ${type} para copiar.`);
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(`${type} copiado!`))
        .catch(() => toast.error(`Falha ao copiar ${type}.`));
    },
    []
  );

  const filteredCommands = useMemo(() => {
    return commands
      .filter((cmd) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          cmd.name.toLowerCase().includes(searchLower) ||
          cmd.command.toLowerCase().includes(searchLower) ||
          (cmd.description &&
            cmd.description.toLowerCase().includes(searchLower)) ||
          (cmd.platform && cmd.platform.toLowerCase().includes(searchLower)) ||
          cmd.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [commands, searchTerm]);

  useEffect(() => {
    if (currentSelectedCommandObject && !isEditing) {
      populateForm(currentSelectedCommandObject);
    } else if (!selectedCommandId && !isEditing) {
      resetAndClearForm();
    }
  }, [
    currentSelectedCommandObject,
    isEditing,
    populateForm,
    resetAndClearForm,
    selectedCommandId,
  ]);

  const showRightPanelContent = isEditing || currentSelectedCommandObject;

  return (
    <div className="flex h-full w-full bg-card text-card-foreground border-t border-border">
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmActualDelete}
        title="Confirmar Exclusão de Comando"
        itemName={currentSelectedCommandObject?.name || "este comando"}
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
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Comando
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar comandos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {filteredCommands.map((cmd) => (
            <div
              key={cmd.id}
              onClick={() => handleSelectCommand(cmd)}
              className={cn(
                "group p-3 cursor-pointer hover:bg-primary hover:text-primary-foreground border-b border-border/50",
                selectedCommandId === cmd.id &&
                  "bg-primary text-primary-foreground"
              )}
            >
              <h3
                className={cn(
                  "font-semibold text-sm truncate group-hover:text-primary-foreground",
                  selectedCommandId === cmd.id && "text-primary-foreground"
                )}
              >
                {cmd.name}
              </h3>
              <p
                className={cn(
                  "text-sm -mt-0.5 text-foreground truncate font-mono group-hover:text-primary-foreground/80",
                  selectedCommandId === cmd.id && "text-primary-foreground/80"
                )}
              >
                {cmd?.description?.substring(0, 42)}
                {(cmd?.description?.length || 0) > 40 ? "..." : ""}
              </p>
              <p
                className={cn(
                  "text-xs text-muted-foreground truncate font-mono group-hover:text-primary-foreground/80",
                  selectedCommandId === cmd.id && "text-primary-foreground/80"
                )}
              >
                {cmd.command.substring(0, 50)}
                {cmd.command.length > 45 ? "..." : ""}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {cmd.platform && (
                  <Badge variant="secondary" className="text-xs">
                    {cmd.platform}
                  </Badge>
                )}
                {cmd.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      "text-xs group-hover:text-primary-foreground group-hover:border-primary-foreground/50",
                      selectedCommandId === cmd.id &&
                        "text-primary-foreground border-primary-foreground/50 bg-primary/80"
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {filteredCommands.length === 0 && searchTerm && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum comando encontrado.
            </p>
          )}
          {filteredCommands.length === 0 &&
            !searchTerm &&
            commands.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nenhum comando salvo. Clique em {'"Novo Comando"'}.
              </p>
            )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {showRightPanelContent ? (
          <>
            <div className="p-3 border-b border-border flex flex-col gap-3">
              {isEditing ? (
                <Input
                  id="command-center-name-input"
                  type="text"
                  placeholder="Nome Amigável do Comando"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-lg font-semibold"
                />
              ) : (
                <div className="flex justify-between items-center min-h-[40px]">
                  <h2 className="text-lg font-semibold truncate">
                    {currentSelectedCommandObject?.name}
                  </h2>
                  {currentSelectedCommandObject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditSelected}
                      title="Editar Comando"
                    >
                      <Edit2 className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  )}
                </div>
              )}
              {isEditing && (
                <>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formPlatform || "other"}
                      onValueChange={(value) =>
                        setFormPlatform(value as CliCommand["platform"])
                      }
                    >
                      <SelectTrigger className="w-full md:w-[200px] h-9 text-xs">
                        <SelectValue placeholder="Plataforma/Tipo" />
                      </SelectTrigger>
                      <SelectContent className="z-[999999999]">
                        {commandPlatforms.map((p) => (
                          <SelectItem
                            key={p}
                            value={p || "other"}
                            className="text-xs"
                          >
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Tags (ex: git, docker, backup)"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Textarea
                    placeholder="Descrição (útil para explicar o comando)"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="h-24 text-xs resize-none"
                  />
                </>
              )}
              {!isEditing && currentSelectedCommandObject?.description && (
                <p className="text-sm text-muted-foreground">
                  {currentSelectedCommandObject.description}
                </p>
              )}
              {!isEditing && currentSelectedCommandObject && (
                <div className="flex gap-2 mt-1 flex-wrap items-center">
                  {currentSelectedCommandObject.platform && (
                    <Badge variant="secondary" className="text-xs">
                      {currentSelectedCommandObject.platform}
                    </Badge>
                  )}
                  {currentSelectedCommandObject.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-grow relative overflow-hidden p-3">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Comando:
              </label>
              {isEditing ? (
                <Textarea
                  value={formCommand}
                  onChange={(e) => setFormCommand(e.target.value)}
                  placeholder="$ Seu comando aqui..."
                  className="p-3 w-full h-[calc(100%-28px)] resize-none border bg-transparent rounded-md focus:ring-primary-foreground text-sm font-mono "
                />
              ) : currentSelectedCommandObject ? (
                <ScrollArea className="h-[calc(100%-28px)] w-full bg-muted rounded-md">
                  <pre className="p-3 text-sm font-mono whitespace-pre-wrap break-all">
                    <code>{currentSelectedCommandObject.command}</code>
                  </pre>
                </ScrollArea>
              ) : null}
            </div>

            <div className="p-2 border-t border-border flex justify-between items-center">
              <div>
                {currentSelectedCommandObject && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        currentSelectedCommandObject.command,
                        "Comando"
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copiar Comando
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing && selectedCommandId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteCommandPress}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                )}
                {isEditing && (
                  <Button size="sm" onClick={handleSaveCommand}>
                    <Save className="mr-2 h-4 w-4" />
                    {selectedCommandId ? "Atualizar" : "Salvar"}
                  </Button>
                )}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      if (currentSelectedCommandObject) {
                        populateForm(currentSelectedCommandObject);
                      } else {
                        resetAndClearForm();
                        setSelectedCommandId(null);
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
            <TerminalSquare className="w-16 h-16 mb-4" />
            <p className="text-center">
              Selecione um comando para visualizar ou clique em{" "}
              {'"Novo Comando"'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const MemoizedCommandCenter = React.memo(CommandCenterComponent);

export { MemoizedCommandCenter as CommandCenter };
