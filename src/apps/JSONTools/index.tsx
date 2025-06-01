"use client";

import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Copy, Eraser, Minimize2, Sparkles } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

const indentOptions = [
  { label: "2 Espaços", value: 2 },
  { label: "4 Espaços", value: 4 },
  { label: "Tabulação", value: "\t" },
];

function JSONTools() {
  const [inputValue, setInputValue] = useState<string>("");
  const [outputValue, setOutputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [indentSpace, setIndentSpace] = useState<number | string>(2);

  const handleFormatValidate = useCallback(() => {
    if (!inputValue.trim()) {
      setOutputValue("");
      setError(null);
      toast.info("Área de entrada vazia.");
      return;
    }
    try {
      const parsedJson = JSON.parse(inputValue);
      const formattedJson = JSON.stringify(parsedJson, null, indentSpace);
      setOutputValue(formattedJson);
      setError(null);
      toast.success("JSON formatado e válido!");
    } catch (e) {
      console.error(e);
      setOutputValue("");
      setError(`JSON Inválido`);
      toast.error("Erro ao processar JSON.");
    }
  }, [inputValue, indentSpace]);

  const handleMinify = useCallback(() => {
    if (!inputValue.trim()) {
      setOutputValue("");
      setError(null);
      toast.info("Área de entrada vazia.");
      return;
    }
    try {
      const parsedJson = JSON.parse(inputValue);
      const minifiedJson = JSON.stringify(parsedJson);
      setOutputValue(minifiedJson);
      setError(null);
      toast.success("JSON minificado!");
    } catch (e) {
      console.error(e);
      setOutputValue("");
      setError(`JSON Inválido`);
      toast.error("Erro ao processar JSON.");
    }
  }, [inputValue]);

  const handleClear = () => {
    setInputValue("");
    setOutputValue("");
    setError(null);
  };

  const handleCopyToClipboard = useCallback((text: string, type: string) => {
    if (!text) {
      toast.error(`Nenhum texto ${type} para copiar.`);
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast.success(`JSON ${type} copiado para a área de transferência!`)
      )
      .catch(() => toast.error(`Falha ao copiar ${type}.`));
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t">
      <div className="flex items-center gap-4 flex-wrap">
        <Button onClick={handleFormatValidate} size="sm">
          <Sparkles className="mr-2 h-4 w-4" /> Formatar / Validar
        </Button>
        <Button onClick={handleMinify} size="sm">
          <Minimize2 className="mr-2 h-4 w-4" /> Minificar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Indentação:</span>
          <Select
            value={String(indentSpace)}
            onValueChange={(value) => {
              const val = value === "\t" ? "\t" : parseInt(value, 10);
              setIndentSpace(val);
            }}
          >
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Indentação" />
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
        <Button
          onClick={handleClear}
          variant="outline"
          size="sm"
          className="ml-auto bg-card"
        >
          <Eraser className="mr-2 h-4 w-4" /> Limpar Tudo
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-foreground text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        <div className="flex flex-col gap-2 h-full">
          <div className="flex justify-between items-center">
            <label
              htmlFor="json-input"
              className="text-sm font-medium text-muted-foreground"
            >
              Entrada JSON:
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(inputValue, "de entrada")}
              title="Copiar entrada"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea
            id="json-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Cole seu JSON aqui..."
            className="w-full resize-none p-2 font-mono text-sm focus:ring-0 bg-background flex-grow border rounded-md h-[calc(100%-2rem)]"
          />
        </div>

        <div className="flex flex-col gap-2 h-full">
          <div className="flex justify-between items-center">
            <label
              htmlFor="json-output"
              className="text-sm font-medium text-muted-foreground"
            >
              Saída:
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(outputValue, "de saída")}
              title="Copiar saída"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-grow border rounded-md bg-muted/50 h-[calc(100%-2rem)]">
            <Textarea
              id="json-output"
              value={outputValue}
              readOnly
              placeholder="Resultado aparecerá aqui..."
              className="w-full h-full resize-none p-2 font-mono text-sm border-0 focus:ring-0 bg-transparent"
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

const MemoizedJSONTools = React.memo(JSONTools);
export { MemoizedJSONTools as JSONTools };
