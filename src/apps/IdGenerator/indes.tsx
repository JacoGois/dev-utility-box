"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/SelectCore";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { Copy, RefreshCw } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MAX as UUID_MAX,
  NIL as UUID_NIL,
  v1 as uuidv1,
  v3 as uuidv3,
  v4 as uuidv4,
  v5 as uuidv5,
  v6 as uuidv6,
  v7 as uuidv7,
  validate as uuidValidate,
} from "uuid";

const toolOptions = [{ value: "uuid", label: "Gerador de UUID" }];

type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7" | "nil" | "max";

export const defaultState = {
  selectedTool: "uuid",
  uuidConfig: {
    quantity: 5,
    noHyphens: false,
    uppercase: false,
    version: "v7" as UuidVersion,
    v3v5_name: "example.com",
    v3v5_namespace: "1b671a64-40d5-491e-99b0-da01ff1f3341",
  },
};

type IdGeneratorProps = {
  instanceId: string;
};

const UUID_NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
};

function IdGeneratorComponent({ instanceId }: IdGeneratorProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const { selectedTool, uuidConfig } = state;

  const [generatedIds, setGeneratedIds] = useState<string[]>([]);

  const handleUuidConfigChange = (
    key: keyof typeof uuidConfig,
    value: number | boolean | string
  ) => {
    setState({
      uuidConfig: { ...uuidConfig, [key]: value },
    });
  };

  const generateIds = useCallback(() => {
    const { quantity, version, v3v5_name, v3v5_namespace } = uuidConfig;
    let newIds: string[] = [];

    try {
      switch (version) {
        case "v1":
          newIds = Array.from({ length: quantity }, () => uuidv1());
          break;
        case "v3":
          if (!v3v5_name)
            throw new Error("O campo 'Nome' é obrigatório para UUID v3.");
          if (!uuidValidate(v3v5_namespace))
            throw new Error(
              "O campo 'Namespace' deve ser um UUID válido para v3."
            );
          newIds = [uuidv3(v3v5_name, v3v5_namespace)];
          break;
        case "v5":
          if (!v3v5_name)
            throw new Error("O campo 'Nome' é obrigatório para UUID v5.");
          if (!uuidValidate(v3v5_namespace))
            throw new Error(
              "O campo 'Namespace' deve ser um UUID válido para v5."
            );
          newIds = [uuidv5(v3v5_name, v3v5_namespace)];
          break;
        case "v6":
          newIds = Array.from({ length: quantity }, () => uuidv6());
          break;
        case "v7":
          newIds = Array.from({ length: quantity }, () => uuidv7());
          break;
        case "nil":
          newIds = [UUID_NIL];
          break;
        case "max":
          newIds = [UUID_MAX];
          break;
        case "v4":
        default:
          newIds = Array.from({ length: quantity }, () => uuidv4());
          break;
      }
      setGeneratedIds(newIds);
    } catch (e) {
      toast.error("Erro ao gerar UUID", { description: (e as Error).message });
    }
  }, [uuidConfig]);

  useEffect(() => {
    generateIds();
  }, [uuidConfig]);

  const formattedIds = useMemo(() => {
    return generatedIds.map((id) => {
      let formattedId = id;
      if (uuidConfig.noHyphens) formattedId = formattedId.replace(/-/g, "");
      if (uuidConfig.uppercase) formattedId = formattedId.toUpperCase();
      return formattedId;
    });
  }, [generatedIds, uuidConfig]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("ID copiado!"));
  };
  const handleCopyAll = () => {
    if (formattedIds.length === 0) return;
    const allIds = formattedIds.join("\n");
    navigator.clipboard
      .writeText(allIds)
      .then(() => toast.success("Todos os IDs foram copiados!"));
  };

  const isNameBasedVersion =
    uuidConfig.version === "v3" || uuidConfig.version === "v5";
  const isConstantVersion =
    uuidConfig.version === "nil" || uuidConfig.version === "max";
  const isBulkGeneratable = !isNameBasedVersion && !isConstantVersion;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t @container">
      <div className="flex items-center gap-4 border-b pb-4 flex-wrap">
        <Label className="flex-shrink-0">Ferramenta:</Label>
        <Select
          value={selectedTool}
          onValueChange={(value) => setState({ selectedTool: value })}
        >
          <SelectTrigger className="w-full @sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[999999999]">
            {toolOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTool === "uuid" && (
        <div className="grid grid-cols-1 @4xl:grid-cols-3 gap-4 flex-grow min-h-0 overflow-y-auto">
          <div className="@4xl:col-span-1 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Configurações do UUID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="uuid-version">Versão do UUID</Label>
                  <Select
                    value={uuidConfig.version}
                    onValueChange={(v) =>
                      handleUuidConfigChange("version", v as UuidVersion)
                    }
                  >
                    <SelectTrigger
                      id="uuid-version"
                      className="mt-1 w-full @sm:w-fit"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[999999999]">
                      <SelectItem value="v7">
                        Versão 7 (Unix Time, Ordenável)
                      </SelectItem>
                      <SelectItem value="v4">Versão 4 (Aleatório)</SelectItem>
                      <SelectItem value="v6">
                        Versão 6 (Tempo, Ordenável)
                      </SelectItem>
                      <SelectItem value="v1">
                        Versão 1 (Baseado em Tempo)
                      </SelectItem>
                      <SelectItem value="v5">
                        Versão 5 (Baseado em Nome, SHA-1)
                      </SelectItem>
                      <SelectItem value="v3">
                        Versão 3 (Baseado em Nome, MD5)
                      </SelectItem>
                      <SelectItem value="nil">
                        NIL (UUID Vazio / Nulo)
                      </SelectItem>
                      <SelectItem value="max">MAX (UUID Máximo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isNameBasedVersion && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="v3v5-name">Nome (Name)</Label>
                      <Input
                        id="v3v5-name"
                        type="text"
                        value={uuidConfig.v3v5_name}
                        onChange={(e) =>
                          handleUuidConfigChange("v3v5_name", e.target.value)
                        }
                        placeholder="ex: example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="v3v5-namespace">
                        Namespace (UUID Válido)
                      </Label>
                      <Input
                        id="v3v5-namespace"
                        type="text"
                        value={uuidConfig.v3v5_namespace}
                        onChange={(e) =>
                          handleUuidConfigChange(
                            "v3v5_namespace",
                            e.target.value
                          )
                        }
                        className="mt-1 font-mono text-xs"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUuidConfigChange(
                              "v3v5_namespace",
                              UUID_NAMESPACES.DNS
                            )
                          }
                        >
                          DNS
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUuidConfigChange(
                              "v3v5_namespace",
                              UUID_NAMESPACES.URL
                            )
                          }
                        >
                          URL
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!isConstantVersion && (
                  <div className="space-y-4 border-t pt-4">
                    {isBulkGeneratable && (
                      <div>
                        <Label htmlFor="uuid-quantity">Quantidade</Label>
                        <Input
                          id="uuid-quantity"
                          type="number"
                          value={uuidConfig.quantity}
                          onChange={(e) =>
                            handleUuidConfigChange(
                              "quantity",
                              Math.max(1, Number(e.target.value))
                            )
                          }
                          min="1"
                          max="1000"
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="no-hyphens"
                        checked={uuidConfig.noHyphens}
                        onCheckedChange={(checked) =>
                          handleUuidConfigChange("noHyphens", !!checked)
                        }
                      />
                      <Label htmlFor="no-hyphens" className="cursor-pointer">
                        Remover Hífens
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={uuidConfig.uppercase}
                        onCheckedChange={(checked) =>
                          handleUuidConfigChange("uppercase", !!checked)
                        }
                      />
                      <Label htmlFor="uppercase" className="cursor-pointer">
                        Maiúsculas
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isBulkGeneratable && (
              <Button onClick={generateIds} size="lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Gerar Novos
              </Button>
            )}
            <Button onClick={handleCopyAll} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> Copiar Todos
            </Button>
          </div>

          <div className="@4xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">IDs Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-fit">
                  <div className="space-y-2">
                    {formattedIds.map((id, index) => (
                      <div
                        key={`${id}-${index}`}
                        className="flex items-center gap-2 font-mono text-sm p-2 bg-muted/50 rounded"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleCopyToClipboard(id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <span className="flex-grow truncate">{id}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoizedIdGenerator = React.memo(IdGeneratorComponent);

export function IdGenerator({ instanceId }: { instanceId: string }) {
  return <MemoizedIdGenerator instanceId={instanceId} />;
}
