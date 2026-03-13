"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import { ScrollArea } from "@/components/ui/ScrollArea";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getEditableElements,
  getEmbeddedImageFromRect,
  getPreviewClone,
  getViewBox,
  isUrlRef,
  parseSvgString,
  recolorEmbeddedImage,
  removeElement,
  replaceAllFill,
  replaceAllStroke,
  serializeSvg,
  setElementFill,
  setElementFillGradient,
  setElementHidden,
  setElementStroke,
} from "./simpleModeUtils";
import type { SvgElementEntry, SvgGlobalOptions } from "./types";

const HIGHLIGHT_FILTER_ID = "svglab-highlight-filter";
const HIGHLIGHT_STROKE = "hsl(var(--primary))";
const HIGHLIGHT_STROKE_WIDTH = "10";
const XLINK_NS = "http://www.w3.org/1999/xlink";

function findElementInClone(
  svg: SVGSVGElement,
  entryId: string,
): SVGElement | null {
  const escaped = CSS.escape(entryId);
  const byId = svg.querySelector(`[id="${escaped}"]`);
  if (byId) return byId as SVGElement;
  const byData = svg.querySelector(`[data-svglab-id="${escaped}"]`);
  return byData as SVGElement | null;
}

const ELEMENTS_DISPLAY_LIMIT = 200;

type SimpleViewProps = {
  svgRoot: SVGSVGElement | null;
  entries: SvgElementEntry[];
  onSvgLoaded: (root: SVGSVGElement | null, entries: SvgElementEntry[]) => void;
  onEntriesChange: (entries: SvgElementEntry[]) => void;
  onRefreshPreview: () => void;
  previewUrl: string | null;
  refreshKey: number;
  uploadKey: number;
  globalOptions: SvgGlobalOptions;
  onGlobalOptionsChange: (opts: SvgGlobalOptions) => void;
  onBeforeChange: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  modalContainerRef: React.RefObject<HTMLDivElement | null>;
  onError?: (code: string, error?: unknown) => void;
  t: (key: string) => string;
};

export function SimpleView({
  svgRoot,
  entries,
  onSvgLoaded,
  onEntriesChange,
  onRefreshPreview,
  previewUrl,
  refreshKey,
  uploadKey,
  globalOptions,
  onGlobalOptionsChange,
  onBeforeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  modalContainerRef,
  onError,
  t,
}: SimpleViewProps) {
  void modalContainerRef;
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  const [replaceFillColor, setReplaceFillColor] = useState("#000000");
  const [replaceStrokeColor, setReplaceStrokeColor] = useState("#000000");
  const [recolorFrom, setRecolorFrom] = useState("#ffffff");
  const [recolorTo, setRecolorTo] = useState("#000000");
  const [recoloring, setRecoloring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewCloneRef = useRef<SVGSVGElement | null>(null);
  const highlightedElRef = useRef<SVGElement | null>(null);
  const lastResetUploadKeyRef = useRef(0);

  void previewUrl;

  useEffect(() => {
    if (uploadKey > lastResetUploadKeyRef.current) {
      lastResetUploadKeyRef.current = uploadKey;
      setRecolorFrom("#ffffff");
      setRecolorTo("#000000");
    }
  }, [uploadKey]);

  useEffect(() => {
    if (!svgRoot) setLoadedFileName(null);
  }, [svgRoot]);

  useLayoutEffect(() => {
    const container = previewContainerRef.current;
    if (!svgRoot || !container) return;
    const clone = getPreviewClone(svgRoot, globalOptions);
    const doc = clone.ownerDocument;
    let defs = clone.querySelector("defs");
    if (!defs) {
      defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
      clone.insertBefore(defs, clone.firstChild);
    }
    const filter = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", HIGHLIGHT_FILTER_ID);
    filter.setAttribute("x", "-80%");
    filter.setAttribute("y", "-80%");
    filter.setAttribute("width", "260%");
    filter.setAttribute("height", "260%");
    const feDropShadowWhite = doc.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow",
    );
    feDropShadowWhite.setAttribute("dx", "0");
    feDropShadowWhite.setAttribute("dy", "0");
    feDropShadowWhite.setAttribute("stdDeviation", "20");
    feDropShadowWhite.setAttribute("flood-color", "#fff");
    feDropShadowWhite.setAttribute("flood-opacity", "1");
    filter.appendChild(feDropShadowWhite);
    const feDropShadow1 = doc.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow",
    );
    feDropShadow1.setAttribute("dx", "0");
    feDropShadow1.setAttribute("dy", "0");
    feDropShadow1.setAttribute("stdDeviation", "6");
    feDropShadow1.setAttribute("flood-color", "hsl(var(--primary))");
    feDropShadow1.setAttribute("flood-opacity", "1");
    filter.appendChild(feDropShadow1);
    const feDropShadow2 = doc.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow",
    );
    feDropShadow2.setAttribute("dx", "0");
    feDropShadow2.setAttribute("dy", "0");
    feDropShadow2.setAttribute("stdDeviation", "18");
    feDropShadow2.setAttribute("flood-color", "hsl(var(--primary))");
    feDropShadow2.setAttribute("flood-opacity", "0.95");
    filter.appendChild(feDropShadow2);
    defs.appendChild(filter);
    if (!clone.hasAttribute("viewBox")) {
      const { x, y, w, h } = getViewBox(clone);
      clone.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
    }
    clone.setAttribute("width", "100%");
    clone.setAttribute("height", "100%");
    clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
    clone.setAttribute("class", "block");
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.maxWidth = "100%";
    clone.style.maxHeight = "100%";
    clone.style.objectFit = "contain";
    previewCloneRef.current = clone;

    container.innerHTML = "";
    container.appendChild(clone);

    return () => {
      container.innerHTML = "";
      previewCloneRef.current = null;
      highlightedElRef.current = null;
    };
  }, [svgRoot, globalOptions, refreshKey]);

  useEffect(() => {
    if (highlightedElRef.current) {
      const el = highlightedElRef.current;
      const origFilter = el.getAttribute("data-svglab-original-filter");
      const origStroke = el.getAttribute("data-svglab-original-stroke");
      const origStrokeWidth = el.getAttribute(
        "data-svglab-original-stroke-width",
      );
      if (origFilter != null && origFilter !== "")
        el.setAttribute("filter", origFilter);
      else el.removeAttribute("filter");
      if (origStroke != null && origStroke !== "")
        el.setAttribute("stroke", origStroke);
      else el.removeAttribute("stroke");
      if (origStrokeWidth != null && origStrokeWidth !== "")
        el.setAttribute("stroke-width", origStrokeWidth);
      else el.removeAttribute("stroke-width");
      el.removeAttribute("data-svglab-original-filter");
      el.removeAttribute("data-svglab-original-stroke");
      el.removeAttribute("data-svglab-original-stroke-width");
      highlightedElRef.current = null;
    }
    if (!hoveredEntryId || !previewCloneRef.current) return;
    const el = findElementInClone(previewCloneRef.current, hoveredEntryId);
    if (el) {
      el.setAttribute(
        "data-svglab-original-filter",
        el.getAttribute("filter") ?? "",
      );
      el.setAttribute(
        "data-svglab-original-stroke",
        el.getAttribute("stroke") ?? "",
      );
      el.setAttribute(
        "data-svglab-original-stroke-width",
        el.getAttribute("stroke-width") ?? "",
      );
      el.setAttribute("filter", `url(#${HIGHLIGHT_FILTER_ID})`);
      el.setAttribute("stroke", HIGHLIGHT_STROKE);
      el.setAttribute("stroke-width", HIGHLIGHT_STROKE_WIDTH);
      highlightedElRef.current = el;
    }
    return () => {
      if (highlightedElRef.current) {
        const e = highlightedElRef.current;
        const origFilter = e.getAttribute("data-svglab-original-filter");
        const origStroke = e.getAttribute("data-svglab-original-stroke");
        const origStrokeWidth = e.getAttribute(
          "data-svglab-original-stroke-width",
        );
        if (origFilter != null && origFilter !== "")
          e.setAttribute("filter", origFilter);
        else e.removeAttribute("filter");
        if (origStroke != null && origStroke !== "")
          e.setAttribute("stroke", origStroke);
        else e.removeAttribute("stroke");
        if (origStrokeWidth != null && origStrokeWidth !== "")
          e.setAttribute("stroke-width", origStrokeWidth);
        else e.removeAttribute("stroke-width");
        e.removeAttribute("data-svglab-original-filter");
        e.removeAttribute("data-svglab-original-stroke");
        e.removeAttribute("data-svglab-original-stroke-width");
        highlightedElRef.current = null;
      }
    };
  }, [hoveredEntryId]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t("messages.fileTooLarge"));
      e.target.value = "";
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (!mountedRef.current) {
        setUploading(false);
        return;
      }
      const text = reader.result as string;
      const root = parseSvgString(text);
      if (!root) {
        onError?.("invalid_svg");
        toast.error(t("messages.invalidSvg"));
        setUploading(false);
        e.target.value = "";
        return;
      }
      const baseName = file.name.includes("/")
        ? file.name.split("/").pop()!
        : file.name;
      setLoadedFileName(baseName || null);
      const newEntries = getEditableElements(root);
      onSvgLoaded(root, newEntries);
      toast.success(t("messages.loadSuccess"));
      setUploading(false);
      e.target.value = "";
    };
    reader.onerror = (err) => {
      onError?.("load_error", err);
      if (mountedRef.current) {
        toast.error(t("messages.loadError"));
      }
      setUploading(false);
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!svgRoot) return;
    try {
      const str = serializeSvg(svgRoot, globalOptions);
      const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const exportName =
        loadedFileName && /\.svg$/i.test(loadedFileName)
          ? loadedFileName
          : loadedFileName
            ? `${loadedFileName.replace(/\.[^.]+$/i, "")}.svg`
            : "icon.svg";
      a.download = exportName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("messages.exportSuccess"));
    } catch (err) {
      onError?.("export_error", err);
      toast.error(t("messages.invalidSvg"));
    }
  };

  const updateEntry = (id: string, patch: Partial<SvgElementEntry>) => {
    onEntriesChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const syncEntryToNode = (entry: SvgElementEntry) => {
    const el = entry.node as SVGElement;
    if (entry.fillType === "gradient" && svgRoot) {
      setElementFillGradient(
        svgRoot,
        el,
        entry.gradientAngle,
        entry.gradientColor1,
        entry.gradientColor2,
      );
    } else if (entry.fill != null) {
      setElementFill(el, entry.fill);
    }
    if (entry.stroke != null) setElementStroke(el, entry.stroke);
    setElementHidden(el, entry.hidden);
  };

  const handleRemove = (entry: SvgElementEntry) => {
    onBeforeChange();
    removeElement(entry.node);
    onEntriesChange(entries.filter((e) => e.id !== entry.id));
    onRefreshPreview();
  };

  const handleHideShow = (entry: SvgElementEntry) => {
    onBeforeChange();
    const next = !entry.hidden;
    setElementHidden(entry.node as SVGElement, next);
    updateEntry(entry.id, { hidden: next });
    onRefreshPreview();
  };

  const handleReplaceAllFill = () => {
    if (entries.length === 0) return;
    onBeforeChange();
    replaceAllFill(entries, replaceFillColor);
    entries.forEach((e) =>
      updateEntry(e.id, { fill: replaceFillColor, fillType: "solid" }),
    );
    onRefreshPreview();
  };

  const handleReplaceAllStroke = () => {
    if (entries.length === 0) return;
    onBeforeChange();
    replaceAllStroke(entries, replaceStrokeColor);
    entries.forEach((e) => updateEntry(e.id, { stroke: replaceStrokeColor }));
    onRefreshPreview();
  };

  const handleRecolorImage = async (entry: SvgElementEntry) => {
    if (!svgRoot) return;
    const imgEl = getEmbeddedImageFromRect(svgRoot, entry.node);
    if (!imgEl) return;
    const href =
      imgEl.getAttributeNS(XLINK_NS, "href") ??
      imgEl.getAttribute("href") ??
      "";
    if (!href.startsWith("data:")) return;
    setRecoloring(true);
    try {
      onBeforeChange();
      const newDataUrl = await recolorEmbeddedImage(
        href,
        recolorFrom,
        recolorTo,
      );
      if (!mountedRef.current || !svgRoot.contains(imgEl)) return;
      imgEl.setAttributeNS(XLINK_NS, "href", newDataUrl);
      imgEl.setAttribute("href", newDataUrl);
      setRecolorFrom(recolorTo);
      onRefreshPreview();
      toast.success(t("simple.recolorSuccess"));
    } catch {
      toast.error(t("simple.recolorError"));
    } finally {
      setRecoloring(false);
    }
  };

  if (!svgRoot) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto stable-scrollbar-container p-2 @sm:p-3">
        <div className="flex flex-col gap-4">
          <section>
            <p className="text-sm font-medium text-foreground">
              {t("simple.step1Title")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("simple.step1Hint")}
            </p>
            <div className="mt-2">
              <Label htmlFor="svglab-upload" className="sr-only">
                {t("simple.uploadLabel")}
              </Label>
              <input
                id="svglab-upload"
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                aria-busy={uploading}
                onClick={() =>
                  document.getElementById("svglab-upload")?.click()
                }
              >
                {uploading ? t("simple.uploading") : t("simple.uploadLabel")}
              </Button>
            </div>
          </section>
          <p className="text-sm text-muted-foreground py-4">
            {t("simple.noSvgYet")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-3 p-2 @sm:p-3">
      <section className="flex shrink-0 flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">
          {t("simple.step1Title")}
        </p>
        <p className="text-xs text-muted-foreground">{t("simple.step1Hint")}</p>
        <div className="flex items-center gap-2">
          <input
            id="svglab-upload"
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            aria-busy={uploading}
            aria-label={t("simple.uploadLabel")}
            onClick={() => document.getElementById("svglab-upload")?.click()}
          >
            {uploading ? t("simple.uploading") : t("simple.uploadLabel")}
          </Button>
        </div>
      </section>

      <section
        className="shrink-0 rounded-lg border border-border bg-muted/20 p-3 space-y-2"
        aria-label={t("simple.globalOptionsTitle")}
      >
        <p className="text-xs font-medium text-muted-foreground">
          {t("simple.globalOptionsTitle")}
        </p>
        <div className="grid gap-2 @sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("simple.background")}</Label>
            <div className="flex gap-1.5">
              <input
                type="color"
                value={globalOptions.background ?? "#ffffff"}
                onChange={(e) =>
                  onGlobalOptionsChange({
                    ...globalOptions,
                    background: e.target.value || null,
                  })
                }
                className="h-6 w-8 cursor-pointer rounded border border-border"
                title={t("simple.background")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  onGlobalOptionsChange({ ...globalOptions, background: null })
                }
              >
                {t("simple.backgroundNone")}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("simple.padding")}</Label>
            <Input
              type="number"
              min={0}
              value={globalOptions.padding}
              onChange={(e) =>
                onGlobalOptionsChange({
                  ...globalOptions,
                  padding: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("simple.rotation")}</Label>
            <Input
              type="number"
              value={globalOptions.rotation}
              onChange={(e) =>
                onGlobalOptionsChange({
                  ...globalOptions,
                  rotation: Number(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={replaceFillColor}
              onChange={(e) => setReplaceFillColor(e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border border-border"
              title={t("simple.replaceAllFill")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleReplaceAllFill}
            >
              {t("simple.replaceAllFill")}
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={replaceStrokeColor}
              onChange={(e) => setReplaceStrokeColor(e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border border-border"
              title={t("simple.replaceAllStroke")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleReplaceAllStroke}
            >
              {t("simple.replaceAllStroke")}
            </Button>
          </div>
        </div>
      </section>

      <section
        className="flex min-h-[320px] flex-1 flex-col gap-2 overflow-hidden"
        aria-label={t("simple.step2Title")}
      >
        <p className="text-sm font-medium text-foreground shrink-0">
          {t("simple.step2Title")}
        </p>
        <p className="text-xs text-muted-foreground shrink-0">
          {t("simple.step2Hint")}
        </p>
        <div
          className="grid min-h-[260px] flex-1 gap-3 @md:grid-cols-2 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/20 p-3 min-w-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground shrink-0">
              {t("simple.previewTitle")}
            </p>
            <div
              className="h-full min-w-0 flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-background p-2"
              role="img"
              aria-label={t("simple.previewTitle")}
            >
              <div
                ref={previewContainerRef}
                className="h-full w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
              />
            </div>
          </div>
          <div
            className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/20 p-3 min-w-0"
            aria-label={t("simple.elementsTitle")}
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground shrink-0">
              {t("simple.elementsTitle")}
            </p>
            {entries.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("simple.noElements")}
              </p>
            ) : (
              <>
                {entries.length > ELEMENTS_DISPLAY_LIMIT && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {t("simple.showingFirstElements")
                      .replace("{limit}", String(ELEMENTS_DISPLAY_LIMIT))
                      .replace("{total}", String(entries.length))}
                  </p>
                )}
                <ScrollArea className="min-h-0 flex-1" style={{ minHeight: 0 }}>
                  <ul className="space-y-1.5 pr-2 pb-2">
                    {entries.slice(0, ELEMENTS_DISPLAY_LIMIT).map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                        onMouseEnter={() => setHoveredEntryId(entry.id)}
                        onMouseLeave={() => setHoveredEntryId(null)}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground truncate">
                              {entry.tagName}
                            </span>
                            {entry.hidden && (
                              <span className="text-[10px] text-muted-foreground">
                                ({t("simple.hidden")})
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={
                                  isUrlRef(entry.fill)
                                    ? "#808080"
                                    : (entry.fill ?? "#000000")
                                }
                                onChange={(e) => {
                                  onBeforeChange();
                                  const v = e.target.value;
                                  setElementFill(entry.node as SVGElement, v);
                                  updateEntry(entry.id, {
                                    fill: v,
                                    fillType: "solid",
                                  });
                                  onRefreshPreview();
                                }}
                                className="h-5 w-6 cursor-pointer rounded border border-border"
                                title={
                                  isUrlRef(entry.fill)
                                    ? t("simple.fillReplacePattern")
                                    : t("simple.elementFill")
                                }
                              />
                              <Label className="sr-only">
                                {t("simple.elementFill")}
                              </Label>
                              {isUrlRef(entry.fill) && (
                                <span
                                  className="text-[10px] text-muted-foreground"
                                  title={t("simple.fillReplacePattern")}
                                >
                                  {t("simple.patternOrRef")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={
                                  isUrlRef(entry.stroke)
                                    ? "#808080"
                                    : (entry.stroke ?? "#000000")
                                }
                                onChange={(e) => {
                                  onBeforeChange();
                                  const v = e.target.value;
                                  setElementStroke(entry.node as SVGElement, v);
                                  updateEntry(entry.id, { stroke: v });
                                  onRefreshPreview();
                                }}
                                className="h-5 w-6 cursor-pointer rounded border border-border"
                                title={
                                  isUrlRef(entry.stroke)
                                    ? t("simple.strokeReplacePattern")
                                    : t("simple.elementStroke")
                                }
                              />
                              {isUrlRef(entry.stroke) && (
                                <span
                                  className="text-[10px] text-muted-foreground"
                                  title={t("simple.strokeReplacePattern")}
                                >
                                  {t("simple.patternOrRef")}
                                </span>
                              )}
                            </div>
                            <select
                              value={entry.fillType}
                              onChange={(e) => {
                                onBeforeChange();
                                const v = e.target.value as
                                  | "solid"
                                  | "gradient";
                                updateEntry(entry.id, { fillType: v });
                                syncEntryToNode({ ...entry, fillType: v });
                                onRefreshPreview();
                              }}
                              className="h-6 rounded border border-border bg-background px-1.5 text-xs"
                            >
                              <option value="solid">
                                {t("simple.fillTypeSolid")}
                              </option>
                              <option value="gradient">
                                {t("simple.fillTypeGradient")}
                              </option>
                            </select>
                            {entry.fillType === "gradient" && (
                              <>
                                <Input
                                  type="number"
                                  min={0}
                                  max={360}
                                  value={entry.gradientAngle}
                                  onChange={(e) => {
                                    onBeforeChange();
                                    const angle = Number(e.target.value) || 0;
                                    updateEntry(entry.id, {
                                      gradientAngle: angle,
                                    });
                                    setElementFillGradient(
                                      svgRoot,
                                      entry.node as SVGElement,
                                      angle,
                                      entry.gradientColor1,
                                      entry.gradientColor2,
                                    );
                                    onRefreshPreview();
                                  }}
                                  className="h-6 w-12 text-xs"
                                  title={t("simple.gradientAngle")}
                                />
                                <input
                                  type="color"
                                  value={entry.gradientColor1}
                                  onChange={(e) => {
                                    onBeforeChange();
                                    const v = e.target.value;
                                    updateEntry(entry.id, {
                                      gradientColor1: v,
                                    });
                                    setElementFillGradient(
                                      svgRoot,
                                      entry.node as SVGElement,
                                      entry.gradientAngle,
                                      v,
                                      entry.gradientColor2,
                                    );
                                    onRefreshPreview();
                                  }}
                                  className="h-5 w-6 cursor-pointer rounded border border-border"
                                />
                                <input
                                  type="color"
                                  value={entry.gradientColor2}
                                  onChange={(e) => {
                                    onBeforeChange();
                                    const v = e.target.value;
                                    updateEntry(entry.id, {
                                      gradientColor2: v,
                                    });
                                    setElementFillGradient(
                                      svgRoot,
                                      entry.node as SVGElement,
                                      entry.gradientAngle,
                                      entry.gradientColor1,
                                      v,
                                    );
                                    onRefreshPreview();
                                  }}
                                  className="h-5 w-6 cursor-pointer rounded border border-border"
                                />
                              </>
                            )}
                          </div>
                          {svgRoot &&
                            getEmbeddedImageFromRect(svgRoot, entry.node) && (
                              <div className="mt-2 flex flex-wrap items-center gap-2 rounded border border-dashed border-border bg-muted/30 p-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {t("simple.recolorImage")}
                                </span>
                                <input
                                  type="color"
                                  value={recolorFrom}
                                  onChange={(e) =>
                                    setRecolorFrom(e.target.value)
                                  }
                                  className="h-5 w-6 cursor-pointer rounded border border-border"
                                  title={t("simple.recolorFrom")}
                                />
                                <span className="text-[10px] text-muted-foreground">
                                  →
                                </span>
                                <input
                                  type="color"
                                  value={recolorTo}
                                  onChange={(e) => setRecolorTo(e.target.value)}
                                  className="h-5 w-6 cursor-pointer rounded border border-border"
                                  title={t("simple.recolorTo")}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={recoloring}
                                  onClick={() => handleRecolorImage(entry)}
                                >
                                  {recoloring
                                    ? t("simple.recolorApplying")
                                    : t("simple.recolorApply")}
                                </Button>
                              </div>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => handleHideShow(entry)}
                          >
                            {entry.hidden
                              ? t("simple.showElement")
                              : t("simple.hideElement")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-transparent"
                            onClick={() => handleRemove(entry)}
                          >
                            {t("simple.removeElement")}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          {t("simple.undo")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          {t("simple.redo")}
        </Button>
        <Button type="button" size="sm" onClick={handleExport}>
          {t("simple.exportSvg")}
        </Button>
      </footer>
    </div>
  );
}
