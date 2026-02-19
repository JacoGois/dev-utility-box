"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/form/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { useAppTranslations } from "@/hooks/useTranslations";
import Ajv from "ajv";
import {
  CircleHelp,
  Copy,
  Eraser,
  FileJson2,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type JsonSchema = Record<string, unknown>;
type ValidationIssue = { path: string; message: string };
const UNKNOWN_PARSE_ERROR = "UNKNOWN_PARSE_ERROR";

const defaultSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "email", "roles"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "name": { "type": "string", "minLength": 2 },
    "email": { "type": "string", "format": "email" },
    "isActive": { "type": "boolean", "default": true },
    "roles": {
      "type": "array",
      "items": { "type": "string", "enum": ["admin", "editor", "viewer"] },
      "minItems": 1
    },
    "profile": {
      "type": "object",
      "properties": {
        "age": { "type": "integer", "minimum": 18 },
        "website": { "type": "string", "format": "uri" }
      }
    }
  }
}`;

const defaultData = `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nicolas",
  "email": "nicolas@example.com",
  "roles": ["admin"]
}`;

const defaultState = {
  schemaInput: defaultSchema,
  dataInput: defaultData,
  tsOutput: "",
  sampleOutput: "",
  activeResultTab: "validation" as "validation" | "typescript" | "sample",
};

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false,
  allowUnionTypes: true,
});

const safeParseJson = (
  value: string,
): { ok: true; value: unknown } | { ok: false; error: string } => {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : UNKNOWN_PARSE_ERROR,
    };
  }
};

const inferSchemaType = (schema: JsonSchema): string | undefined => {
  const directType = schema.type;
  if (typeof directType === "string") return directType;
  if (Array.isArray(directType) && typeof directType[0] === "string") {
    return directType[0];
  }
  if (schema.properties && typeof schema.properties === "object")
    return "object";
  if (schema.items) return "array";
  return undefined;
};

const toTsType = (schema: JsonSchema, depth = 0): string => {
  if (depth > 8) return "unknown";

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum.map((item) => JSON.stringify(item)).join(" | ");
  }

  const oneOf = schema.oneOf;
  if (Array.isArray(oneOf) && oneOf.length > 0) {
    return oneOf
      .map((item) => toTsType((item as JsonSchema) || {}, depth + 1))
      .join(" | ");
  }

  const anyOf = schema.anyOf;
  if (Array.isArray(anyOf) && anyOf.length > 0) {
    return anyOf
      .map((item) => toTsType((item as JsonSchema) || {}, depth + 1))
      .join(" | ");
  }

  const schemaType = inferSchemaType(schema);
  switch (schemaType) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "array": {
      const items = (schema.items as JsonSchema) || {};
      return `${toTsType(items, depth + 1)}[]`;
    }
    case "object": {
      const properties =
        (schema.properties as Record<string, JsonSchema>) || {};
      const required = new Set(
        Array.isArray(schema.required) ? schema.required : [],
      );
      const entries = Object.entries(properties).map(([key, propSchema]) => {
        const optionalFlag = required.has(key) ? "" : "?";
        return `${JSON.stringify(key)}${optionalFlag}: ${toTsType(
          propSchema || {},
          depth + 1,
        )};`;
      });
      return entries.length > 0
        ? `{\n${entries.map((line) => `  ${line}`).join("\n")}\n}`
        : "Record<string, unknown>";
    }
    default:
      return "unknown";
  }
};

const generateSampleFromSchema = (schema: JsonSchema, depth = 0): unknown => {
  if (depth > 8) return null;
  if (schema.const !== undefined) return schema.const;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length > 0)
    return schema.enum[0];

  const oneOf = schema.oneOf;
  if (Array.isArray(oneOf) && oneOf.length > 0) {
    return generateSampleFromSchema((oneOf[0] as JsonSchema) || {}, depth + 1);
  }
  const anyOf = schema.anyOf;
  if (Array.isArray(anyOf) && anyOf.length > 0) {
    return generateSampleFromSchema((anyOf[0] as JsonSchema) || {}, depth + 1);
  }

  const schemaType = inferSchemaType(schema);
  switch (schemaType) {
    case "string": {
      const format = schema.format;
      if (format === "email") return "user@example.com";
      if (format === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
      if (format === "date-time") return "2026-01-01T00:00:00.000Z";
      if (format === "uri") return "https://example.com";
      return "string";
    }
    case "integer":
      return 1;
    case "number":
      return 1.0;
    case "boolean":
      return true;
    case "null":
      return null;
    case "array": {
      const items = (schema.items as JsonSchema) || {};
      return [generateSampleFromSchema(items, depth + 1)];
    }
    case "object": {
      const properties =
        (schema.properties as Record<string, JsonSchema>) || {};
      const required = new Set(
        Array.isArray(schema.required) ? schema.required : [],
      );
      const result: Record<string, unknown> = {};
      for (const [key, propSchema] of Object.entries(properties)) {
        if (required.has(key) || Math.random() > 0.4) {
          result[key] = generateSampleFromSchema(propSchema || {}, depth + 1);
        }
      }
      return result;
    }
    default:
      return null;
  }
};

function SchemaLabComponent({ instanceId }: { instanceId: string }) {
  const t = useAppTranslations("schemaLab");
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const appRootRef = React.useRef<HTMLDivElement | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    [],
  );
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const statusLabel = useMemo(() => {
    if (isValid === null) return t("validation.notRun");
    return isValid ? t("validation.valid") : t("validation.invalid");
  }, [isValid, t]);
  const mapParseError = (error: string) =>
    error === UNKNOWN_PARSE_ERROR ? t("messages.unknownParseError") : error;

  const parseSchema = (): JsonSchema | null => {
    const parsed = safeParseJson(state.schemaInput);
    if (!parsed.ok || typeof parsed.value !== "object" || !parsed.value) {
      toast.error(
        t("messages.invalidSchema", {
          error: parsed.ok ? "" : mapParseError(parsed.error),
        }),
      );
      return null;
    }
    return parsed.value as JsonSchema;
  };

  const parseData = (): unknown | null => {
    const parsed = safeParseJson(state.dataInput);
    if (!parsed.ok) {
      toast.error(
        t("messages.invalidData", { error: mapParseError(parsed.error) }),
      );
      return null;
    }
    return parsed.value;
  };

  const handleValidate = () => {
    const schema = parseSchema();
    if (!schema) return;
    const data = parseData();
    if (data === null) return;

    try {
      const validate = ajv.compile(schema);
      const result = validate(data);
      if (result) {
        setIsValid(true);
        setValidationIssues([]);
        toast.success(t("messages.validationPassed"));
      } else {
        setIsValid(false);
        const issues: ValidationIssue[] =
          validate.errors?.map((error) => ({
            path: error.instancePath || "/",
            message: error.message || t("validation.unknownError"),
          })) || [];
        setValidationIssues(issues);
        toast.warning(t("messages.validationFailed", { count: issues.length }));
      }
      setState({ activeResultTab: "validation" });
    } catch (error) {
      toast.error(
        t("messages.validationEngineError", {
          error:
            error instanceof Error
              ? error.message
              : t("messages.unknownErrorValue"),
        }),
      );
    }
  };

  const handleGenerateTypes = () => {
    const schema = parseSchema();
    if (!schema) return;
    const ts = `export interface RootSchema ${toTsType(schema)}`;
    setState({ tsOutput: ts, activeResultTab: "typescript" });
    toast.success(t("messages.typesGenerated"));
  };

  const handleGenerateSample = () => {
    const schema = parseSchema();
    if (!schema) return;
    const sample = generateSampleFromSchema(schema);
    setState({
      sampleOutput: JSON.stringify(sample, null, 2),
      activeResultTab: "sample",
    });
    toast.success(t("messages.sampleGenerated"));
  };

  const handleClear = () => {
    setState({
      schemaInput: "",
      dataInput: "",
      tsOutput: "",
      sampleOutput: "",
      activeResultTab: "validation",
    });
    setValidationIssues([]);
    setIsValid(null);
  };

  const copyText = async (value: string) => {
    if (!value.trim()) {
      toast.info(t("messages.nothingToCopy"));
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("messages.copied"));
    } catch {
      toast.error(t("messages.copyFailed"));
    }
  };

  return (
    <div
      ref={appRootRef}
      className="@container flex h-full w-full flex-col gap-3 overflow-hidden border-t bg-card p-2.5 @sm:p-3 text-card-foreground"
    >
      <div className="rounded-md border border-border bg-muted/20 p-2.5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{t("description")}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                title={t("tips.hint")}
              >
                <CircleHelp className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              portalContainer={appRootRef.current ?? undefined}
              overlayClassName="absolute inset-0 z-[180] bg-black/35"
              className="!absolute top-1/2 left-1/2 z-[181] sm:max-w-md"
            >
              <DialogHeader>
                <DialogTitle>{t("title")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("help.globalWhatIs")}</p>
                <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                  <p>
                    <strong>{t("help.globalFlowTitle")}</strong>
                  </p>
                  <p>{t("help.globalFlowStep1")}</p>
                  <p>{t("help.globalFlowStep2")}</p>
                  <p>{t("help.globalFlowStep3")}</p>
                  <p>{t("help.globalFlowStep4")}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                  <p>
                    <strong>{t("help.globalTipsTitle")}</strong>
                  </p>
                  <p>{t("help.globalTipRequired")}</p>
                  <p>{t("help.globalTipEnum")}</p>
                  <p>{t("help.globalTipFormat")}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleValidate}
            size="sm"
            className="w-full @sm:w-auto"
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            {t("buttons.validate")}
          </Button>
          <Button
            onClick={handleGenerateTypes}
            size="sm"
            variant="outline"
            className="w-full @sm:w-auto"
          >
            <FileJson2 className="mr-1.5 h-4 w-4" />
            {t("buttons.generateTypes")}
          </Button>
          <Button
            onClick={handleGenerateSample}
            size="sm"
            variant="outline"
            className="w-full @sm:w-auto"
          >
            <FlaskConical className="mr-1.5 h-4 w-4" />
            {t("buttons.generateSample")}
          </Button>
          <Button
            onClick={handleClear}
            size="sm"
            variant="ghost"
            className="w-full @sm:w-auto"
          >
            <Eraser className="mr-1.5 h-4 w-4" />
            {t("buttons.clear")}
          </Button>
          <Badge
            variant={
              isValid === null
                ? "secondary"
                : isValid
                  ? "default"
                  : "destructive"
            }
            className="@sm:ml-auto"
          >
            {statusLabel}
          </Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div className="grid min-h-[360px] grid-cols-1 gap-3 @4xl:grid-cols-2">
          <div className="flex min-h-[220px] flex-col rounded-md border border-border p-2.5 @sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{t("labels.schema")}</p>
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title={t("placeholders.schema")}
                    >
                      <CircleHelp className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    portalContainer={appRootRef.current ?? undefined}
                    overlayClassName="absolute inset-0 z-[180] bg-black/35"
                    className="!absolute top-1/2 left-1/2 z-[181] sm:max-w-md"
                  >
                    <DialogHeader>
                      <DialogTitle>{t("labels.schema")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{t("help.schemaWhatIs")}</p>
                      <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                        <p>
                          <strong>{t("help.schemaMinimalTitle")}</strong>
                        </p>
                        <p>{`{ ${t("help.schemaMinimalExample")} }`}</p>
                      </div>
                      <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                        <p>
                          <strong>{t("help.schemaChecklistTitle")}</strong>
                        </p>
                        <p>{t("help.schemaChecklistType")}</p>
                        <p>{t("help.schemaChecklistRequired")}</p>
                        <p>{t("help.schemaChecklistRules")}</p>
                        <p>{t("help.schemaChecklistAdditionalProps")}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => copyText(state.schemaInput)}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {t("buttons.copy")}
                </Button>
              </div>
            </div>
            <Textarea
              value={state.schemaInput}
              onChange={(event) =>
                setState({ schemaInput: event.target.value })
              }
              className="min-h-[160px] flex-1 font-mono text-xs"
              placeholder={t("placeholders.schema")}
            />
          </div>

          <div className="flex min-h-[220px] flex-col rounded-md border border-border p-2.5 @sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{t("labels.data")}</p>
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title={t("placeholders.data")}
                    >
                      <CircleHelp className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    portalContainer={appRootRef.current ?? undefined}
                    overlayClassName="absolute inset-0 z-[180] bg-black/35"
                    className="!absolute top-1/2 left-1/2 z-[181] sm:max-w-md"
                  >
                    <DialogHeader>
                      <DialogTitle>{t("labels.data")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{t("help.dataWhatIs")}</p>
                      <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                        <p>
                          <strong>{t("help.dataErrorsTitle")}</strong>
                        </p>
                        <p>{t("help.dataErrorQuotes")}</p>
                        <p>{t("help.dataErrorTrailingComma")}</p>
                        <p>{t("help.dataErrorLiterals")}</p>
                      </div>
                      <div className="rounded-md border border-border bg-muted/30 p-2 text-xs space-y-1">
                        <p>
                          <strong>{t("help.dataTipTitle")}</strong>{" "}
                          {t("help.dataTipDescription")}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => copyText(state.dataInput)}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {t("buttons.copy")}
                </Button>
              </div>
            </div>
            <Textarea
              value={state.dataInput}
              onChange={(event) => setState({ dataInput: event.target.value })}
              className="min-h-[160px] flex-1 font-mono text-xs"
              placeholder={t("placeholders.data")}
            />
          </div>
        </div>

        <div className="flex min-h-[260px] flex-col rounded-md border border-border p-2.5 @sm:p-3">
          <Tabs
            value={state.activeResultTab}
            onValueChange={(value) =>
              setState({
                activeResultTab: value as
                  | "validation"
                  | "typescript"
                  | "sample",
              })
            }
            className="min-h-0 flex-1"
          >
            <TabsList className="max-w-full justify-start overflow-x-auto overflow-y-hidden">
              <TabsTrigger
                value="validation"
                className="flex-none px-2 @sm:px-3"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden @sm:inline @sm:ml-1">
                  {t("resultTabs.validation")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="typescript"
                className="flex-none px-2 @sm:px-3"
              >
                <FileJson2 className="h-4 w-4" />
                <span className="hidden @sm:inline @sm:ml-1">
                  {t("resultTabs.typescript")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="sample" className="flex-none px-2 @sm:px-3">
                <FlaskConical className="h-4 w-4" />
                <span className="hidden @sm:inline @sm:ml-1">
                  {t("resultTabs.sample")}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="validation"
              className="min-h-0 flex-1 overflow-hidden"
            >
              <ScrollArea className="min-h-0 h-full rounded-md border border-border bg-muted/20 p-2">
                {validationIssues.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {isValid === null
                      ? t("validation.notRunHint")
                      : isValid
                        ? t("validation.validHint")
                        : t("validation.invalidHint")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {validationIssues.map((issue, index) => (
                      <div
                        key={`${issue.path}-${index}`}
                        className="rounded-md border border-destructive/30 bg-destructive/5 p-2"
                      >
                        <p className="font-mono text-[11px] text-destructive">
                          {issue.path}
                        </p>
                        <p className="text-xs text-foreground">
                          {issue.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="typescript"
              className="min-h-0 flex-1 overflow-hidden"
            >
              <div className="flex min-h-0 h-full flex-col">
                <div className="mb-2 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyText(state.tsOutput)}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {t("buttons.copy")}
                  </Button>
                </div>
                <ScrollArea className="min-h-0 flex-1 rounded-md border border-border bg-muted/20 p-2">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                    {state.tsOutput || t("placeholders.typesOutput")}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent
              value="sample"
              className="min-h-0 flex-1 overflow-hidden"
            >
              <div className="flex min-h-0 h-full flex-col">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyText(state.sampleOutput)}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {t("buttons.copy")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      if (!state.sampleOutput.trim()) return;
                      setState({ dataInput: state.sampleOutput });
                      toast.success(t("messages.sampleSentToData"));
                    }}
                  >
                    {t("buttons.useAsData")}
                  </Button>
                </div>
                <ScrollArea className="min-h-0 flex-1 rounded-md border border-border bg-muted/20 p-2">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                    {state.sampleOutput || t("placeholders.sampleOutput")}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const MemoizedSchemaLab = React.memo(SchemaLabComponent);
export function SchemaLab({ instanceId }: { instanceId: string }) {
  return <MemoizedSchemaLab instanceId={instanceId} />;
}
