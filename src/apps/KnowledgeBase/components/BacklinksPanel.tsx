"use client";

import { ScrollArea } from "@/components/ui/ScrollArea";
import { useAppTranslations } from "@/hooks/useTranslations";
import { FileText, Link2 } from "lucide-react";
import { useMemo } from "react";
import { KnowledgeEntry } from "../types";

interface BacklinksPanelProps {
  selectedEntry: KnowledgeEntry | null | undefined;
  allEntries: KnowledgeEntry[];
  onSelectEntry: (entryId: string) => void;
}

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
  const t = useAppTranslations("knowledgeBase");
  const backlinks = useMemo(() => {
    if (!selectedEntry) return [];

    const linkingEntries: KnowledgeEntry[] = [];

    allEntries.forEach((entry) => {
      if (entry.id === selectedEntry.id) return;

      const referencedTitles = getReferencedTitlesFromContent(entry.content);
      for (const title of referencedTitles) {
        const linkedToEntry = findNoteByTitle(title, allEntries);
        if (linkedToEntry && linkedToEntry.id === selectedEntry.id) {
          if (!linkingEntries.some((e) => e.id === entry.id)) {
            linkingEntries.push(entry);
          }
          break;
        }
      }
    });
    return linkingEntries.sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedEntry, allEntries]);

  if (!selectedEntry) {
    return (
      <div className="p-3 text-sm text-muted-foreground italic">
        {t("labels.selectBlock")}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center p-3 border-b h-[50px]">
        <Link2 className="w-4 h-4 mr-2 flex-shrink-0" />
        {t("labels.linkedBy")} ({backlinks.length}):
      </h4>
      {backlinks.length === 0 ? (
        <div className="p-3 text-xs text-muted-foreground italic flex-grow flex items-center justify-center">
          {t("labels.noBacklinks")}
        </div>
      ) : (
        <ScrollArea className="flex-grow text-sm">
          <ul className="p-1">
            {backlinks.map((entry) => (
              <li key={entry.id} className="mb-0.5">
                <button
                  onClick={() => onSelectEntry(entry.id)}
                  className="text-primary hover:underline  text-left w-full h-auto py-1 px-2 justify-start text-xs flex items-center gap-1"
                  title={entry.title}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 opacity-70" />
                  <span className="truncate">
                    {entry.title || t("fallbacks.untitledBlock")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
