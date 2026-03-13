"use client";

import { Button } from "@/components/ui/Button";
import type { Config } from "@svgedit/svgcanvas";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SvgCanvasInstance = {
  getSvgString: () => string;
  setSvgString: (xml: string, preventUndo?: boolean) => boolean;
  clearSelection?: (noCall?: boolean) => void;
  undoMgr: {
    getUndoStackSize: () => number;
    getRedoStackSize: () => number;
    undo: () => void;
    redo: () => void;
  };
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

type AdvancedViewProps = {
  t: (key: string) => string;
};

export function AdvancedView({ t }: AdvancedViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<SvgCanvasInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [loadSvgInput, setLoadSvgInput] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas?.undoMgr) return;
    setCanUndo(canvas.undoMgr.getUndoStackSize() > 0);
    setCanRedo(canvas.undoMgr.getRedoStackSize() > 0);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let mounted = true;
    let SvgCanvasClass: new (container: HTMLElement, config?: Partial<Config>) => SvgCanvasInstance;

    (async () => {
      try {
        const mod = await import("@svgedit/svgcanvas");
        SvgCanvasClass = mod.default as unknown as typeof SvgCanvasClass;
        if (!mounted || !el) return;

        const config: Partial<Config> = {
          dimensions: [CANVAS_WIDTH, CANVAS_HEIGHT],
          initTool: "select",
          initFill: {
            color: "000000",
            opacity: 1,
          },
          initStroke: {
            color: "000000",
            opacity: 1,
            width: 1,
          },
          initOpacity: 1,
        };
        const canvas = new SvgCanvasClass(el, config) as SvgCanvasInstance;
        canvasRef.current = canvas;
        setReady(true);
        updateUndoRedo();
      } catch (err) {
        console.error("SvgCanvas init error", err);
        toast.error(t("messages.invalidSvg"));
      }
    })();

    return () => {
      mounted = false;
      canvasRef.current = null;
      setReady(false);
    };
  }, [t, updateUndoRedo]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setSvgString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"></svg>`,
      true,
    );
    updateUndoRedo();
    toast.success(t("messages.cleared"));
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas?.undoMgr) return;
    canvas.undoMgr.undo();
    updateUndoRedo();
  };

  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas?.undoMgr) return;
    canvas.undoMgr.redo();
    updateUndoRedo();
  };

  const handleLoadSvg = () => {
    const canvas = canvasRef.current;
    const str = loadSvgInput.trim();
    if (!canvas || !str) return;
    const ok = canvas.setSvgString(str, false);
    if (ok) {
      setLoadSvgInput("");
      toast.success(t("messages.loadSuccess"));
      updateUndoRedo();
    } else {
      toast.error(t("messages.invalidSvg"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      const str = (reader.result as string)?.trim();
      if (!str) return;
      const ok = canvasRef.current?.setSvgString(str, false);
      if (ok) {
        setLoadSvgInput("");
        toast.success(t("messages.loadSuccess"));
        updateUndoRedo();
      } else {
        toast.error(t("messages.invalidSvg"));
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const str = canvas.getSvgString();
    if (!str || str.length < 50) {
      toast.info(t("advanced.exportEmptyHint"));
      return;
    }
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("messages.exportSuccess"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 @container">
      <p className="shrink-0 text-xs text-muted-foreground">
        {t("advanced.intro")}
      </p>

      <section className="shrink-0 rounded-lg border border-border bg-muted/10 p-3">
        <p className="text-sm font-medium text-foreground">
          {t("advanced.loadSectionTitle")}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("advanced.loadSectionHint")}
        </p>
        <div className="mt-2 flex flex-col gap-2 @sm:flex-row @sm:items-start">
          <textarea
            placeholder={t("advanced.loadSvgPlaceholder")}
            value={loadSvgInput}
            onChange={(e) => setLoadSvgInput(e.target.value)}
            className="border-input bg-background placeholder:text-muted-foreground min-h-[72px] w-full flex-1 rounded-md border px-2 py-1.5 text-sm"
            rows={3}
          />
          <div className="flex shrink-0 flex-wrap gap-2 @sm:flex-col @sm:self-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer"
              disabled={!ready}
              asChild
            >
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={!ready}
                />
                {t("advanced.uploadFile")}
              </label>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSvg}
              disabled={!ready || !loadSvgInput.trim()}
              className="h-8"
            >
              {t("advanced.toolbarLoadSvg")}
            </Button>
          </div>
        </div>
      </section>

      <section className="shrink-0">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t("advanced.actionsLabel")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!ready}
          >
            {t("advanced.toolbarClear")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!ready || !canUndo}
          >
            {t("advanced.toolbarUndo")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!ready || !canRedo}
          >
            {t("advanced.toolbarRedo")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!ready}
          >
            {t("advanced.toolbarExport")}
          </Button>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/20 p-2">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t("advanced.canvasLabel")}
        </p>
        <div
          ref={containerRef}
          className="mx-auto bg-white"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            minWidth: CANVAS_WIDTH,
            minHeight: CANVAS_HEIGHT,
          }}
        />
        {!ready && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("advanced.canvasPlaceholder")}
          </p>
        )}
      </section>
    </div>
  );
}
