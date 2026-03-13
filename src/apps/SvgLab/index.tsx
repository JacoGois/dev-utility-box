"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { useAppTranslations } from "@/hooks/useTranslations";
import { useWindowShellStore } from "@/stores/useWindowShellStore";
import { CircleHelp, PenTool, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdvancedView } from "./AdvancedView";
import {
  getEditableElements,
  parseSvgString,
  serializeSvg,
} from "./simpleModeUtils";
import { SimpleView } from "./SimpleView";
import type { SvgElementEntry, SvgGlobalOptions } from "./types";

const UNDO_MAX = 50;

type HistoryEntry = { svgString: string; globalOptions: SvgGlobalOptions };

const defaultState = {
  activeTab: "simple" as "simple" | "advanced",
};

const defaultGlobalOptions: SvgGlobalOptions = {
  background: null,
  padding: 0,
  rotation: 0,
};

type SvgLabProps = {
  instanceId: string;
};

export function SvgLab({ instanceId }: SvgLabProps) {
  const t = useAppTranslations("svgLab");
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const modalContainerRef = useWindowShellStore((s) => s.refs[instanceId]);
  const appRootRef = useRef<HTMLDivElement | null>(null);

  const [svgRoot, setSvgRoot] = useState<SVGSVGElement | null>(null);
  const [entries, setEntries] = useState<SvgElementEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [globalOptions, setGlobalOptions] =
    useState<SvgGlobalOptions>(defaultGlobalOptions);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [uploadKey, setUploadKey] = useState(0);

  const previewUrl = useMemo(() => {
    if (!svgRoot) return null;
    try {
      const str = serializeSvg(svgRoot, globalOptions);
      const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, [svgRoot, refreshKey, globalOptions]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSvgLoaded = useCallback(
    (root: SVGSVGElement | null, newEntries: SvgElementEntry[]) => {
      setSvgRoot(root);
      setEntries(newEntries);
      setRefreshKey((k) => k + 1);
      setUndoStack([]);
      setRedoStack([]);
      setUploadKey((k) => k + 1);
    },
    [],
  );

  const handleRefreshPreview = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const pushUndo = useCallback(() => {
    if (!svgRoot) return;
    const entry: HistoryEntry = {
      svgString: serializeSvg(svgRoot),
      globalOptions: { ...globalOptions },
    };
    setUndoStack((s) => {
      const next = [...s, entry];
      return next.slice(-UNDO_MAX);
    });
    setRedoStack([]);
  }, [svgRoot, globalOptions]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !svgRoot) return;
    const prev = undoStack[undoStack.length - 1];
    const redoEntry: HistoryEntry = {
      svgString: serializeSvg(svgRoot),
      globalOptions: { ...globalOptions },
    };
    setRedoStack((r) => [...r, redoEntry]);
    setUndoStack((s) => s.slice(0, -1));
    const newRoot = parseSvgString(prev.svgString);
    if (!newRoot) return;
    setSvgRoot(newRoot);
    setEntries(getEditableElements(newRoot));
    setGlobalOptions(prev.globalOptions);
    setRefreshKey((k) => k + 1);
  }, [undoStack, svgRoot, globalOptions]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const undoEntry: HistoryEntry = {
      svgString: svgRoot ? serializeSvg(svgRoot) : "",
      globalOptions: { ...globalOptions },
    };
    setUndoStack((s) => [...s, undoEntry]);
    setRedoStack((r) => r.slice(0, -1));
    const newRoot = parseSvgString(next.svgString);
    if (!newRoot) return;
    setSvgRoot(newRoot);
    setEntries(getEditableElements(newRoot));
    setGlobalOptions(next.globalOptions);
    setRefreshKey((k) => k + 1);
  }, [redoStack, svgRoot, globalOptions]);

  return (
    <div
      ref={appRootRef}
      className="@container flex h-full w-full min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden border-t bg-card p-2.5 text-card-foreground @sm:gap-3 @sm:p-3 stable-scrollbar-container"
    >
      <div className="rounded-md border border-border bg-muted/20 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t("description")}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                title={t("description")}
              >
                <CircleHelp className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              portalContainer={modalContainerRef?.current ?? undefined}
              className="max-w-md max-h-[80vh] overflow-y-auto z-[9999999]"
            >
              <DialogHeader>
                <DialogTitle>{t("title")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("description")}</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>{t("tabs.simple")}</strong>:{" "}
                    {t("simple.uploadHint")}
                  </li>
                  <li>
                    <strong>{t("tabs.advanced")}</strong>:{" "}
                    {t("advanced.helpHint")}
                  </li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        value={state.activeTab}
        onValueChange={(value) =>
          setState({ activeTab: value as "simple" | "advanced" })
        }
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden @sm:gap-3"
      >
        <TabsList className="max-w-full shrink-0 justify-start overflow-x-auto overflow-y-hidden">
          <TabsTrigger
            value="simple"
            className="flex-none px-2 @sm:px-3"
            title={t("tabs.simple")}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden @sm:inline @sm:ml-1">
              {t("tabs.simple")}
            </span>
          </TabsTrigger>
          <span
            className="inline-flex flex-none"
            title={t("advanced.underConstruction")}
          >
            <TabsTrigger
              value="advanced"
              disabled
              className="cursor-not-allowed px-2 @sm:px-3"
            >
              <PenTool className="h-4 w-4" />
              <span className="hidden @sm:inline @sm:ml-1">
                {t("tabs.advanced")}
              </span>
            </TabsTrigger>
          </span>
        </TabsList>
        <TabsContent
          value="simple"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-1 stable-scrollbar-container"
        >
          <SimpleView
            svgRoot={svgRoot}
            entries={entries}
            onSvgLoaded={handleSvgLoaded}
            uploadKey={uploadKey}
            onEntriesChange={setEntries}
            onRefreshPreview={handleRefreshPreview}
            previewUrl={previewUrl}
            refreshKey={refreshKey}
            globalOptions={globalOptions}
            modalContainerRef={
              modalContainerRef ??
              (undefined as unknown as React.RefObject<HTMLDivElement | null>)
            }
            onGlobalOptionsChange={setGlobalOptions}
            onBeforeChange={pushUndo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onError={(code, err) => {
              if (process.env.NODE_ENV === "development") {
                console.error("[SvgLab]", code, err);
              }
            }}
            t={t}
          />
        </TabsContent>
        <TabsContent
          value="advanced"
          className="min-h-0 flex-1 overflow-y-auto pb-1"
        >
          <AdvancedView t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
