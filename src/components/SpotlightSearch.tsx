"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useCallback, useEffect, useRef } from "react";

export function SpotlightSearch() {
  const {
    isOpen,
    query,
    results,
    selectedIndex,
    closeSpotlight,
    setQuery,
    performSearch,
    selectNext,
    selectPrevious,
    executeSelected,
  } = useSpotlightStore();
  const { openApp } = useWindowStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      performSearch(query, openApp);
    }
  }, [isOpen]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    performSearch(newQuery, openApp);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (results.length === 0 && event.key !== "Escape") return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectNext();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectPrevious();
      } else if (event.key === "Enter") {
        event.preventDefault();
        executeSelected();
      } else if (event.key === "Escape") {
        closeSpotlight();
      }
    },
    [
      results.length,
      selectNext,
      selectPrevious,
      executeSelected,
      closeSpotlight,
    ]
  );

  const selectedItemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSpotlight()}>
      <DialogContent
        noCloseIcon
        className="p-0 max-w-xl top-[20%] translate-y-[-20%] z-[99999] shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pesquisa Rápida de Aplicativos</DialogTitle>{" "}
        </DialogHeader>
        <div className="flex flex-col">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar aplicativos..."
            value={query}
            onChange={handleQueryChange}
            className="w-full p-4 text-lg border-0 focus-visible:ring-0 shadow-none rounded-t-lg"
          />
          {results.length > 0 && (
            <ScrollArea className="max-h-[400px] p-2">
              <div className="flex flex-col gap-1">
                {results.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      ref={index === selectedIndex ? selectedItemRef : null}
                      onClick={item.action}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-primary",
                        index === selectedIndex && "bg-primary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6 text-muted-foreground",
                          index === selectedIndex && "text-foreground"
                        )}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          {query && results.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
