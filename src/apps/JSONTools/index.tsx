"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import _ from "lodash";
import {
  CheckCircle,
  Copy,
  Download,
  Eraser,
  FileJson2,
  FileTextIcon,
  MessageSquareQuote,
  Minimize2,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const indentOptions = [
  { label: "2 Espaços", value: 2 },
  { label: "4 Espaços", value: 4 },
  { label: "Tabulação", value: "\t" },
];

type ParsedJsonType = object | unknown[] | string | number | boolean | null;

function JSONToolsComponent() {
  const [inputValue, setInputValue] = useState<string>("");
  const [outputValue, setOutputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [indentSpace, setIndentSpace] = useState<number | string>(2);

  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [parsedJsonForTree, setParsedJsonForTree] =
    useState<ParsedJsonType>(null);
  const [outputViewMode, setOutputViewMode] = useState<"text" | "tree">("text");
  const [jsonStats, setJsonStats] = useState<{
    lines: number;
    chars: number;
    sizeKB: string;
    rawSize: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedValidate = useCallback(
    _.debounce((value: string) => {
      if (!value.trim()) {
        setIsValidJson(null);
        setParsedJsonForTree(null);
        setJsonStats(null);
        setError(null);
        return;
      }
      try {
        const parsed = JSON.parse(value);
        setIsValidJson(true);
        setParsedJsonForTree(parsed);
        const lines = value.split("\n").length;
        const chars = value.length;
        const sizeBytes = new Blob([value]).size;
        const sizeKB = (sizeBytes / 1024).toFixed(2);
        setJsonStats({
          lines,
          chars,
          sizeKB: `${sizeKB} KB`,
          rawSize: sizeBytes,
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setIsValidJson(false);
        setParsedJsonForTree(null);
        setJsonStats(null);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedValidate(inputValue);
  }, [inputValue, debouncedValidate]);

  const handleParseAndSetOutput = useCallback(
    (input: string, operation: "format" | "minify") => {
      if (!input.trim()) {
        setOutputValue("");
        setError(null);
        setParsedJsonForTree(null);
        toast.info("Área de entrada vazia.");
        return false;
      }
      try {
        const parsed = JSON.parse(input);
        let resultJsonString: string;

        if (operation === "format") {
          resultJsonString = JSON.stringify(parsed, null, indentSpace);
          toast.success("JSON formatado e válido!");
        } else {
          resultJsonString = JSON.stringify(parsed);
          toast.success("JSON minificado!");
        }

        setOutputValue(resultJsonString);
        setParsedJsonForTree(parsed);
        setError(null);
        setIsValidJson(true);
        return true;
      } catch (e) {
        console.error(e);
        setOutputValue("");
        setParsedJsonForTree(null);
        const errorMessage = `JSON Inválido: ${(
          e as { message: string }
        ).message.substring(0, 150)}`;
        setError(errorMessage);
        setIsValidJson(false);
        toast.error("Erro ao processar JSON.");
        return false;
      }
    },
    [indentSpace]
  );

  const handleFormatValidate = useCallback(() => {
    handleParseAndSetOutput(inputValue, "format");
  }, [inputValue, handleParseAndSetOutput]);

  const handleMinify = useCallback(() => {
    handleParseAndSetOutput(inputValue, "minify");
  }, [inputValue, handleParseAndSetOutput]);

  const handleClear = () => {
    setInputValue("");
    setOutputValue("");
    setError(null);
    setIsValidJson(null);
    setParsedJsonForTree(null);
    setJsonStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyToClipboard = useCallback((text: string, type: string) => {
    if (typeof text !== "string" || !text.trim()) {
      toast.error(`Nenhum ${type} para copiar.`);
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${type} copiado!`))
      .catch(() => toast.error(`Falha ao copiar ${type}.`));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          setInputValue(text);
          toast.success(`Arquivo "${file.name}" carregado.`);
        } catch (e) {
          console.error(e);
          setError("Não foi possível ler o arquivo.");
          toast.error("Erro ao ler arquivo.");
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    let contentToDownload = outputValue;
    let fileName = "processed.json";

    if (outputViewMode === "tree" && parsedJsonForTree && isValidJson) {
      contentToDownload = JSON.stringify(parsedJsonForTree, null, indentSpace);
      fileName = "formatted_tree.json";
    } else if (!outputValue.trim() && parsedJsonForTree && isValidJson) {
      contentToDownload = JSON.stringify(parsedJsonForTree, null, indentSpace);
      fileName = "formatted_input.json";
    }

    if (!contentToDownload.trim()) {
      toast.error("Nenhum conteúdo na saída para baixar.");
      return;
    }
    try {
      JSON.parse(contentToDownload);
      const blob = new Blob([contentToDownload], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("JSON baixado!");
    } catch (e) {
      console.error(e);
      toast.error("O conteúdo da saída não é JSON válido para download.");
    }
  };

  const handleEscapeString = () => {
    if (!inputValue.trim()) {
      toast.info("Entrada vazia para escapar.");
      return;
    }

    setOutputViewMode("text");

    const jsonStringValue = JSON.stringify(inputValue);
    setOutputValue(jsonStringValue);

    setParsedJsonForTree(null);
    setError(null);
    setIsValidJson(null);
    toast.success("String escapada para valor JSON.");
  };

  const handleUnescapeString = () => {
    if (!inputValue.trim()) {
      toast.info("Entrada vazia para desescapar.");
      return;
    }

    try {
      const unescaped = JSON.parse(inputValue);
      if (typeof unescaped === "string") {
        setOutputValue(unescaped);
        setParsedJsonForTree(null);
        setError(null);
        setIsValidJson(null);
        setOutputViewMode("text");
        toast.success("String desescapada.");
      } else {
        setError(
          'A entrada não resultou em uma string após desescapar (deve ser uma string JSON, ex: "texto").'
        );
        toast.error("A entrada não é uma string JSON válida.");
      }
    } catch (e) {
      setError(
        `Erro ao desescapar string: ${(
          e as { message: string }
        ).message.substring(0, 100)}`
      );
      toast.error("Erro ao desescapar string.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-3 md:p-4 gap-3 md:gap-4 bg-card text-card-foreground border-t">
      <div className="flex items-center gap-2 md:gap-3 flex-wrap border-b pb-3 md:pb-4">
        <Button
          onClick={handleFormatValidate}
          size="sm"
          disabled={!isValidJson && inputValue.length > 0}
        >
          <Sparkles className="mr-1.5 h-4 w-4" /> Formatar
        </Button>
        <Button
          onClick={handleMinify}
          size="sm"
          disabled={!isValidJson && inputValue.length > 0}
        >
          <Minimize2 className="mr-1.5 h-4 w-4" /> Minificar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground">
            Indentação:
          </span>
          <Select
            value={String(indentSpace)}
            onValueChange={(value) =>
              setIndentSpace(value === "\t" ? "\t" : parseInt(value, 10))
            }
          >
            <SelectTrigger className="w-[110px] md:w-[120px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[999999999]">
              {indentOptions.map((opt) => (
                <SelectItem
                  key={String(opt.value)}
                  value={String(opt.value)}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input
          type="file"
          accept=".json,.txt"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="json-file-input"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="bg-transparent"
          size="sm"
        >
          <Upload className="mr-1.5 h-4 w-4" /> Carregar
        </Button>
        <Button
          className="bg-transparent"
          onClick={handleDownload}
          variant="outline"
          size="sm"
        >
          <Download className="mr-1.5 h-4 w-4" /> Baixar
        </Button>
        <div className="flex-grow" />
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary-foreground"
        >
          <Eraser className="mr-1.5 h-4 w-4" /> Limpar
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs md:text-sm">
        <span className="text-muted-foreground">Transformar String:</span>
        <Button
          onClick={handleEscapeString}
          variant="outline"
          className="bg-transparent"
          size="sm"
          title="Escapar string para ser um valor JSON"
        >
          <MessageSquareQuote className="mr-1.5 h-4 w-4 transform rotate-90" />{" "}
          Escapar
        </Button>
        <Button
          onClick={handleUnescapeString}
          variant="outline"
          className="bg-transparent"
          size="sm"
          title="Desescapar uma string que é um valor JSON (ex: com aspas e escapes)"
        >
          <MessageSquareQuote className="mr-1.5 h-4 w-4" /> Desescapar
        </Button>
        <div className="flex-grow" />
        <span className="text-muted-foreground">Ver Saída:</span>
        <Select
          value={outputViewMode}
          onValueChange={(v) => setOutputViewMode(v as "text" | "tree")}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[999999999]">
            <SelectItem value="text" className="text-xs group">
              <FileTextIcon className="mr-1.5 h-3.5 w-3.5 inline-block text-foreground group-hover:text-primary-foreground" />
              Texto
            </SelectItem>
            <SelectItem value="tree" className="text-xs group">
              <FileJson2 className="mr-1.5 h-3.5 w-3.5 inline-block text-foreground group-hover:text-primary-foreground" />
              Árvore
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="p-2 md:p-3 bg-destructive/20 border border-destructive text-foreground text-xs md:text-sm rounded-md break-all mt-2">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-hidden h-full mt-2">
        <div className="flex flex-col gap-1 h-full overflow-auto">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <label htmlFor="json-input" className="text-sm font-medium">
                Entrada
              </label>
              {isValidJson === true && (
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600 text-white text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Válido
                </Badge>
              )}
              {isValidJson === false && inputValue.trim() !== "" && (
                <Badge variant="destructive" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inválido
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                handleCopyToClipboard(inputValue, "JSON de entrada")
              }
              title="Copiar entrada"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          {jsonStats && (
            <div className="text-xs text-muted-foreground flex gap-x-3 gap-y-1 flex-wrap mb-1">
              <span>Linhas: {jsonStats.lines}</span>
              <span>Caracteres: {jsonStats.chars}</span>
              <span>Tamanho: {jsonStats.sizeKB}</span>
            </div>
          )}
          <div className="w-full h-full overflow-auto">
            <Textarea
              id="json-input"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
                if (isValidJson !== null) setIsValidJson(null);
              }}
              placeholder="Cole seu JSON aqui..."
              className="w-full h-full overflow-auto resize-none p-2 font-mono text-sm border focus:ring-0 bg-background"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 h-full overflow-auto">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Saída</label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                handleCopyToClipboard(outputValue, "JSON de saída")
              }
              title="Copiar saída"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {outputViewMode === "text" ? (
            <div className="w-full h-full overflow-auto bg-muted/20">
              <Textarea
                id="json-output"
                value={outputValue}
                readOnly
                placeholder="Resultado aparecerá aqui..."
                className="w-full h-full resize-none p-2 font-mono text-sm border-0 focus:ring-0 bg-transparent"
              />
            </div>
          ) : parsedJsonForTree !== null && isValidJson === true ? (
            <div className="w-full h-full overflow-auto bg-muted/20">
              <JsonView
                value={parsedJsonForTree as object}
                style={vscodeTheme}
                displayDataTypes={false}
                enableClipboard={false}
                collapsed={1}
                className="h-full"
                indentWidth={2}
              />
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground bg-muted/40 rounded-lg h-full flex items-center justify-center">
              {inputValue.trim() === ""
                ? "A saída aparecerá aqui."
                : isValidJson === false
                ? "JSON de entrada inválido para visualização em árvore."
                : "Formate ou minifique um JSON válido para ver em árvore."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedJSONTools = React.memo(JSONToolsComponent);
export { MemoizedJSONTools as JSONTools };
