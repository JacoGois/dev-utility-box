// src/apps/KnowledgeBase/components/BacklinksPanel.tsx
"use client";

import { Button } from "@/components/ui/Button"; // Para os links
import { ScrollArea } from "@/components/ui/ScrollArea";
import { FileText, Link2 } from "lucide-react";
import { useMemo } from "react";
import { KnowledgeEntry } from "../types";

interface BacklinksPanelProps {
  selectedEntry: KnowledgeEntry | null | undefined;
  allEntries: KnowledgeEntry[];
  onSelectEntry: (entryId: string) => void;
}

// Função helper para encontrar títulos de notas linkados no conteúdo via [[Título]]
const getReferencedTitlesFromContent = (content: string): string[] => {
  if (!content) return [];
  const internalLinkRegex = /\[\[(.*?)\]\]/g;
  const matches: string[] = [];
  let match;
  while ((match = internalLinkRegex.exec(content)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};

// Função helper para encontrar uma nota pelo título (case-insensitive)
const findNoteByTitle = (
  title: string,
  entries: KnowledgeEntry[]
): KnowledgeEntry | undefined => {
  const normalizedTitle = title.trim().toLowerCase();
  return entries.find(
    (entry) => entry.title.trim().toLowerCase() === normalizedTitle
  );
};

export function BacklinksPanel({
  selectedEntry,
  allEntries,
  onSelectEntry,
}: BacklinksPanelProps) {
  const backlinks = useMemo(() => {
    if (!selectedEntry) return [];

    const linkingEntries: KnowledgeEntry[] = [];
    // Não precisamos do título da nota selecionada se os links internos usam IDs.
    // Se usarmos [[Título]], precisaremos do selectedEntry.title.
    // Assumindo que os links gerados por preprocessMarkdownContent são [TextoVisivel](#entry-ID_ALVO)
    // e que getReferencedTitlesFromContent extrai o "Título" de [[Título]].

    allEntries.forEach((entry) => {
      if (entry.id === selectedEntry.id) return;

      const referencedTitles = getReferencedTitlesFromContent(entry.content);
      for (const title of referencedTitles) {
        const linkedToEntry = findNoteByTitle(title, allEntries);
        if (linkedToEntry && linkedToEntry.id === selectedEntry.id) {
          if (!linkingEntries.some((e) => e.id === entry.id)) {
            // Evitar duplicados se linkar múltiplas vezes
            linkingEntries.push(entry);
          }
          break; // Encontrou um link para a nota selecionada nesta entrada, pode parar de checar os outros links dela
        }
      }
    });
    return linkingEntries.sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedEntry, allEntries]);

  if (!selectedEntry) {
    return (
      <div className="p-3 text-sm text-muted-foreground italic">
        Selecione uma entrada para ver os backlinks.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center p-3 border-b">
        <Link2 className="w-4 h-4 mr-2 flex-shrink-0" />
        Linkado por ({backlinks.length}):
      </h4>
      {backlinks.length === 0 ? (
        <div className="p-3 text-xs text-muted-foreground italic flex-grow flex items-center justify-center">
          Nenhuma outra nota linka para esta.
        </div>
      ) : (
        <ScrollArea className="flex-grow text-sm">
          <ul className="p-1">
            {backlinks.map((entry) => (
              <li key={entry.id} className="mb-0.5">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onSelectEntry(entry.id)}
                  className="text-primary hover:underline text-left w-full h-auto py-1 px-2 justify-start text-xs"
                  title={entry.title}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 opacity-70" />
                  <span className="truncate">
                    {entry.title || "Entrada sem título"}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
