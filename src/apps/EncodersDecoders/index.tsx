"use client";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/SelectCore";
import { Textarea } from "@/components/ui/form/Textarea";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { Copy, Eraser } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const toolOptions = [{ value: "base64", label: "Base64 Encoder / Decoder" }];

export const defaultState = {
  selectedTool: "base64",
  inputValue: "",
};

type EncodersDecodersProps = {
  instanceId: string;
};

function EncodersDecodersComponent({ instanceId }: EncodersDecodersProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const { selectedTool, inputValue } = state;

  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");

  const outputValue = useMemo(() => {
    if (!inputValue.trim()) return "";

    try {
      if (selectedTool === "base64") {
        if (base64Mode === "encode") {
          return btoa(unescape(encodeURIComponent(inputValue)));
        } else {
          return decodeURIComponent(escape(atob(inputValue)));
        }
      }

      return "";
    } catch (e) {
      return `Erro: ${(e as Error).message}`;
    }
  }, [inputValue, selectedTool, base64Mode]);

  const handleCopyToClipboard = (text: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copiado!"));
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t">
      {/* Cabeçalho com Seletor de Ferramenta */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Label className="flex-shrink-0">Ferramenta:</Label>
        <Select
          value={selectedTool}
          onValueChange={(value) => setState({ selectedTool: value })}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione uma ferramenta..." />
          </SelectTrigger>
          <SelectContent>
            {toolOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-grow" />
        <Button
          onClick={() => setState({ inputValue: "" })}
          variant="ghost"
          size="sm"
        >
          <Eraser className="mr-2 h-4 w-4" /> Limpar
        </Button>
      </div>

      {/* Controles Específicos da Ferramenta */}
      {selectedTool === "base64" && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={base64Mode === "encode" ? "default" : "outline"}
            onClick={() => setBase64Mode("encode")}
          >
            Texto {"->"} Base64
          </Button>
          <Button
            variant={base64Mode === "decode" ? "default" : "outline"}
            onClick={() => setBase64Mode("decode")}
          >
            Base64 {"->"} Texto
          </Button>
        </div>
      )}

      {/* Painéis de Entrada e Saída */}
      <div className="grid md:grid-cols-2 gap-4 flex-grow min-h-0">
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-textarea">Entrada</Label>
          <Textarea
            id="input-textarea"
            value={inputValue}
            onChange={(e) => setState({ inputValue: e.target.value })}
            placeholder={
              base64Mode === "encode"
                ? "Digite seu texto aqui..."
                : "Cole seu Base64 aqui..."
            }
            className="h-full resize-none font-mono text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="output-textarea">Saída</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyToClipboard(outputValue)}
              title="Copiar Saída"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            id="output-textarea"
            readOnly
            value={outputValue}
            placeholder="O resultado aparecerá aqui..."
            className="h-full resize-none font-mono text-sm bg-muted/50"
          />
        </div>
      </div>
    </div>
  );
}

const MemoizedEncodersDecoders = React.memo(EncodersDecodersComponent);

export function EncodersDecoders({ instanceId }: { instanceId: string }) {
  return <MemoizedEncodersDecoders instanceId={instanceId} />;
}
