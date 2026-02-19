"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import { Textarea } from "@/components/ui/form/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { useAppTranslations } from "@/hooks/useTranslations";
import {
  Download,
  Eraser,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

const OCR_LANG_OPTIONS = [
  { value: "eng", labelKey: "ocr.languages.english" },
  { value: "por", labelKey: "ocr.languages.portuguese" },
  { value: "spa", labelKey: "ocr.languages.spanish" },
  { value: "deu", labelKey: "ocr.languages.german" },
  { value: "fra", labelKey: "ocr.languages.french" },
  { value: "jpn", labelKey: "ocr.languages.japanese" },
  { value: "chi_sim", labelKey: "ocr.languages.chineseSimplified" },
];

export const defaultState = {
  activeTab: "imageToText" as
    | "imageToText"
    | "removeBackground"
    | "textToImage",
  ocrLanguage: "eng",
  bgRemovalThreshold: 25,
  textToImageContent: "Dev Utility Box\nImage & Text Lab",
  textToImageWidth: 1200,
  textToImageHeight: 630,
  textToImageFontSize: 56,
  textToImageTextColor: "#ffffff",
  textToImageBackgroundColor: "#111827",
};

type ImageTextLabProps = {
  instanceId: string;
};

function ImageTextLabComponent({ instanceId }: ImageTextLabProps) {
  const t = useAppTranslations("imageTextLab");
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null,
  );
  const [ocrOutput, setOcrOutput] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedLanguageLabel = useMemo(() => {
    const option = OCR_LANG_OPTIONS.find(
      (langOption) => langOption.value === state.ocrLanguage,
    );
    return option ? t(option.labelKey) : state.ocrLanguage;
  }, [state.ocrLanguage, t]);

  useEffect(() => {
    if (!selectedImageFile) return;
    const objectUrl = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(objectUrl);
    setProcessedImageUrl(null);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  useEffect(() => {
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [processedImageUrl]);

  const updateTextImageState = useCallback(
    (
      field:
        | "textToImageContent"
        | "textToImageWidth"
        | "textToImageHeight"
        | "textToImageFontSize"
        | "textToImageTextColor"
        | "textToImageBackgroundColor",
      value: string | number,
    ) => {
      setState({ [field]: value } as Partial<typeof defaultState>);
    },
    [setState],
  );

  const downloadTextFile = () => {
    if (!ocrOutput.trim()) {
      toast.info(t("messages.emptyOcrResult"));
      return;
    }
    const blob = new Blob([ocrOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ocr-result.txt";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success(t("messages.downloadedTxt"));
  };

  const copyOcrText = async () => {
    if (!ocrOutput.trim()) {
      toast.info(t("messages.emptyOcrResult"));
      return;
    }
    try {
      await navigator.clipboard.writeText(ocrOutput);
      toast.success(t("messages.copiedText"));
    } catch {
      toast.error(t("messages.copyFailed"));
    }
  };

  const runOcr = async () => {
    if (!selectedImageFile) {
      toast.info(t("messages.selectImageFirst"));
      return;
    }

    setIsRecognizing(true);
    setOcrProgress(0);
    setOcrOutput("");

    try {
      const sourceForOcr: File | string =
        processedImageUrl || selectedImageFile;
      const result = await Tesseract.recognize(
        sourceForOcr,
        state.ocrLanguage,
        {
          logger: (message) => {
            if (message.status === "recognizing text") {
              const progressValue = Math.round((message.progress || 0) * 100);
              setOcrProgress(progressValue);
            }
          },
        },
      );
      setOcrOutput(result.data.text.trim());
      toast.success(t("messages.ocrSuccess"));
    } catch {
      toast.error(t("messages.ocrFailed"));
    } finally {
      setIsRecognizing(false);
    }
  };

  const drawTextToImagePreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = Math.max(320, Number(state.textToImageWidth) || 1200);
    const height = Math.max(180, Number(state.textToImageHeight) || 630);
    const fontSize = Math.max(14, Number(state.textToImageFontSize) || 56);
    const content = state.textToImageContent || "";

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = state.textToImageBackgroundColor;
    context.fillRect(0, 0, width, height);

    context.fillStyle = state.textToImageTextColor;
    context.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    context.textAlign = "left";
    context.textBaseline = "top";

    const padding = Math.max(16, Math.floor(fontSize * 0.8));
    const maxTextWidth = width - padding * 2;
    const lineHeight = Math.round(fontSize * 1.3);

    const wrappedLines: string[] = [];
    for (const paragraph of content.split("\n")) {
      if (!paragraph.trim()) {
        wrappedLines.push("");
        continue;
      }

      const words = paragraph.split(" ");
      let currentLine = "";
      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (
          context.measureText(candidate).width > maxTextWidth &&
          currentLine
        ) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = candidate;
        }
      }
      wrappedLines.push(currentLine);
    }

    const totalTextHeight = wrappedLines.length * lineHeight;
    let y = Math.max(padding, Math.round((height - totalTextHeight) / 2));

    for (const line of wrappedLines) {
      context.fillText(line, padding, y, maxTextWidth);
      y += lineHeight;
      if (y > height - padding) break;
    }
  }, [
    state.textToImageBackgroundColor,
    state.textToImageContent,
    state.textToImageFontSize,
    state.textToImageHeight,
    state.textToImageTextColor,
    state.textToImageWidth,
  ]);

  useEffect(() => {
    drawTextToImagePreview();
  }, [drawTextToImagePreview]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = "text-image.png";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success(t("messages.downloadedPng"));
  };

  const downloadProcessedPng = () => {
    if (!processedImageUrl) {
      toast.info(t("messages.noProcessedImage"));
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = processedImageUrl;
    anchor.download = "image-no-background.png";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success(t("messages.downloadedProcessedPng"));
  };

  const removeBackgroundSimple = async () => {
    if (!selectedImageFile) {
      toast.info(t("messages.selectImageFirst"));
      return;
    }

    setIsRemovingBg(true);
    try {
      const bitmap = await createImageBitmap(selectedImageFile);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");

      if (!context) {
        toast.error(t("messages.bgRemovalFailed"));
        return;
      }

      context.drawImage(bitmap, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      const cornerIndexes = [
        0,
        width - 1,
        (height - 1) * width,
        height * width - 1,
      ];

      const sum = cornerIndexes.reduce(
        (acc, pixelIndex) => {
          const base = pixelIndex * 4;
          acc.r += data[base];
          acc.g += data[base + 1];
          acc.b += data[base + 2];
          return acc;
        },
        { r: 0, g: 0, b: 0 },
      );

      const sampleCount = cornerIndexes.length;
      const bgColor = {
        r: sum.r / sampleCount,
        g: sum.g / sampleCount,
        b: sum.b / sampleCount,
      };

      const threshold = Math.max(8, Number(state.bgRemovalThreshold) || 46);
      const featherRange = threshold * 0.35;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - bgColor.r;
        const dg = data[i + 1] - bgColor.g;
        const db = data[i + 2] - bgColor.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);

        if (distance <= threshold) {
          data[i + 3] = 0;
        } else if (distance <= threshold + featherRange) {
          const factor = (distance - threshold) / featherRange;
          data[i + 3] = Math.round(data[i + 3] * factor);
        }
      }

      context.putImageData(imageData, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((value) => resolve(value), "image/png"),
      );

      if (!blob) {
        toast.error(t("messages.bgRemovalFailed"));
        return;
      }

      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setProcessedImageUrl(objectUrl);
      toast.success(t("messages.bgRemovalSuccess"));
    } catch {
      toast.error(t("messages.bgRemovalFailed"));
    } finally {
      setIsRemovingBg(false);
    }
  };

  return (
    <div className="@container flex h-full w-full flex-col gap-2 @sm:gap-3 overflow-hidden border-t bg-card p-2 @sm:p-3 text-card-foreground">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] || null;
          setSelectedImageFile(nextFile);
          setOcrOutput("");
          setOcrProgress(0);
        }}
      />

      <Tabs
        value={state.activeTab}
        onValueChange={(value) =>
          setState({
            activeTab: value as
              | "imageToText"
              | "removeBackground"
              | "textToImage",
          })
        }
        className="min-h-0 flex-1 gap-2 @sm:gap-3"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="imageToText">
            <FileText className="mr-1 h-4 w-4" />
            {t("tabs.imageToText")}
          </TabsTrigger>
          <TabsTrigger value="textToImage">
            <FileImage className="mr-1 h-4 w-4" />
            {t("tabs.textToImage")}
          </TabsTrigger>
          <TabsTrigger value="removeBackground">
            <Eraser className="mr-1 h-4 w-4" />
            {t("tabs.removeBackground")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="imageToText"
          className="min-h-0 overflow-y-auto @4xl:overflow-hidden"
        >
          <div className="grid min-h-0 grid-cols-1 gap-3 @4xl:h-full @4xl:grid-cols-[360px_1fr]">
            <div className="flex min-h-0 flex-col gap-3 rounded-md border border-border p-3">
              <div className="space-y-1">
                <Label>{t("ocr.languageLabel")}</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={state.ocrLanguage}
                  onChange={(event) =>
                    setState({ ocrLanguage: event.target.value })
                  }
                >
                  {OCR_LANG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                className="justify-start truncate"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedImageFile
                  ? selectedImageFile.name
                  : t("ocr.selectImage")}
              </Button>

              {previewUrl ? (
                <Image
                  src={processedImageUrl || previewUrl}
                  alt={t("ocr.previewAlt")}
                  width={720}
                  height={320}
                  unoptimized
                  className="max-h-44 @sm:max-h-56 w-full rounded-md border border-border object-contain bg-muted/30"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground">
                  {t("ocr.noImageSelected")}
                </div>
              )}

              <Button type="button" onClick={runOcr} disabled={isRecognizing}>
                {isRecognizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("ocr.processing")}
                  </>
                ) : (
                  t("ocr.extractButton")
                )}
              </Button>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("ocr.progress")}</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {t("ocr.currentLanguage", { language: selectedLanguageLabel })}
              </Badge>
            </div>

            <div className="flex min-h-0 flex-col rounded-md border border-border p-3">
              <div className="mb-2 flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-2">
                <p className="text-sm font-medium">{t("ocr.outputTitle")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={copyOcrText}>
                    {t("ocr.copyText")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadTextFile}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    {t("ocr.downloadTxt")}
                  </Button>
                </div>
              </div>
              <ScrollArea className="min-h-0 flex-1 rounded border border-border bg-muted/20 p-2">
                <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground">
                  {ocrOutput || t("ocr.emptyOutput")}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="removeBackground"
          className="min-h-0 overflow-y-auto @4xl:overflow-hidden"
        >
          <div className="grid min-h-0 grid-cols-1 gap-3 @4xl:h-full @4xl:grid-cols-[360px_1fr]">
            <div className="flex min-h-0 flex-col gap-3 rounded-md border border-border p-3">
              <Button
                type="button"
                variant="outline"
                className="justify-start truncate"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedImageFile
                  ? selectedImageFile.name
                  : t("ocr.selectImage")}
              </Button>

              <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="bgThreshold" className="text-xs">
                    {t("ocr.bgRemovalSensitivity")}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {state.bgRemovalThreshold}
                  </span>
                </div>
                <Input
                  id="bgThreshold"
                  type="range"
                  min={8}
                  max={120}
                  step={1}
                  value={state.bgRemovalThreshold}
                  onChange={(event) =>
                    setState({
                      bgRemovalThreshold: Number(event.target.value) || 46,
                    })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={removeBackgroundSimple}
                    disabled={!selectedImageFile || isRemovingBg}
                  >
                    {isRemovingBg ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Eraser className="mr-2 h-4 w-4" />
                    )}
                    {t("ocr.removeBackground")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (processedImageUrl) {
                        URL.revokeObjectURL(processedImageUrl);
                        setProcessedImageUrl(null);
                      }
                    }}
                    disabled={!processedImageUrl}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("ocr.resetImage")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadProcessedPng}
                    disabled={!processedImageUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("ocr.downloadNoBgPng")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid min-h-[300px] @4xl:min-h-0 grid-cols-1 @md:grid-cols-2 gap-3 rounded-md border border-border p-3">
              <div className="flex min-h-0 flex-col gap-2">
                <p className="text-sm font-medium">{t("ocr.originalImage")}</p>
                <div className="flex min-h-[220px] @4xl:min-h-0 flex-1 items-center justify-center rounded-md border border-border bg-muted/20 p-2">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt={t("ocr.previewAlt")}
                      width={640}
                      height={360}
                      unoptimized
                      className="max-h-full w-full rounded-md object-contain"
                    />
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">
                      {t("ocr.noImageSelected")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col gap-2">
                <p className="text-sm font-medium">{t("ocr.processedImage")}</p>
                <div className="flex min-h-[220px] @4xl:min-h-0 flex-1 items-center justify-center rounded-md border border-border bg-muted/20 p-2">
                  {processedImageUrl ? (
                    <Image
                      src={processedImageUrl}
                      alt={t("ocr.processedImage")}
                      width={640}
                      height={360}
                      unoptimized
                      className="max-h-full w-full rounded-md object-contain"
                    />
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">
                      {t("ocr.noProcessedPreview")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="textToImage"
          className="min-h-0 overflow-y-auto @4xl:overflow-hidden"
        >
          <div className="grid min-h-0 grid-cols-1 gap-3 @4xl:h-full @4xl:grid-cols-[360px_1fr]">
            <div className="flex min-h-0 flex-col gap-3 rounded-md border border-border p-3">
              <div className="space-y-1">
                <Label htmlFor="textToImageContent">
                  {t("textToImage.contentLabel")}
                </Label>
                <Textarea
                  id="textToImageContent"
                  value={state.textToImageContent}
                  onChange={(event) =>
                    updateTextImageState(
                      "textToImageContent",
                      event.target.value,
                    )
                  }
                  className="min-h-32 max-h-96"
                  placeholder={t("textToImage.contentPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="textToImageWidth">
                    {t("textToImage.width")}
                  </Label>
                  <Input
                    id="textToImageWidth"
                    type="number"
                    min={320}
                    value={state.textToImageWidth}
                    onChange={(event) =>
                      updateTextImageState(
                        "textToImageWidth",
                        Number(event.target.value) || 320,
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="textToImageHeight">
                    {t("textToImage.height")}
                  </Label>
                  <Input
                    id="textToImageHeight"
                    type="number"
                    min={180}
                    value={state.textToImageHeight}
                    onChange={(event) =>
                      updateTextImageState(
                        "textToImageHeight",
                        Number(event.target.value) || 180,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="textToImageFontSize">
                  {t("textToImage.fontSize")}
                </Label>
                <Input
                  id="textToImageFontSize"
                  type="number"
                  min={14}
                  value={state.textToImageFontSize}
                  onChange={(event) =>
                    updateTextImageState(
                      "textToImageFontSize",
                      Number(event.target.value) || 14,
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="textColor">
                    {t("textToImage.textColor")}
                  </Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={state.textToImageTextColor}
                    onChange={(event) =>
                      updateTextImageState(
                        "textToImageTextColor",
                        event.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bgColor">
                    {t("textToImage.backgroundColor")}
                  </Label>
                  <Input
                    id="bgColor"
                    type="color"
                    value={state.textToImageBackgroundColor}
                    onChange={(event) =>
                      updateTextImageState(
                        "textToImageBackgroundColor",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <Button type="button" onClick={downloadPng}>
                <Download className="mr-2 h-4 w-4" />
                {t("textToImage.downloadPng")}
              </Button>
            </div>

            <div className="flex min-h-[260px] @4xl:min-h-0 flex-col rounded-md border border-border p-3">
              <p className="mb-2 text-sm font-medium">
                {t("textToImage.preview")}
              </p>
              <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <canvas
                  ref={canvasRef}
                  className="h-auto max-w-full rounded border border-border bg-background shadow-sm"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MemoizedImageTextLab = React.memo(ImageTextLabComponent);
export function ImageTextLab({ instanceId }: ImageTextLabProps) {
  return <MemoizedImageTextLab instanceId={instanceId} />;
}
