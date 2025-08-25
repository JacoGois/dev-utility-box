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
import { Textarea } from "@/components/ui/form/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Slider } from "@/components/ui/Slider";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import CryptoJS from "crypto-js";
import { Copy, RefreshCw } from "lucide-react";
import { nanoid } from "nanoid";
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

const toolOptions = [
  { value: "uuid", label: "Gerador de UUID" },
  { value: "nanoid", label: "Gerador de NanoID" },
  { value: "hash", label: "Gerador de Hash (MD5, SHA)" },
  { value: "password", label: "Gerador de Senhas Seguras" },
];

const hashAlgorithms = [
  "MD5",
  "SHA1",
  "SHA256",
  "SHA512",
  "SHA3",
  "RIPEMD160",
] as const;
type HashAlgorithm = (typeof hashAlgorithms)[number];

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
  nanoidConfig: {
    quantity: 5,
    size: 21,
  },
  hashConfig: {
    input: "Olá, mundo!",
  },
  passwordConfig: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
};

type DataGeneratorProps = {
  instanceId: string;
};

const UUID_NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
};

const hashFunctionMap: Record<HashAlgorithm, (message: string) => void> = {
  MD5: CryptoJS.MD5,
  SHA1: CryptoJS.SHA1,
  SHA256: CryptoJS.SHA256,
  SHA512: CryptoJS.SHA512,
  SHA3: CryptoJS.SHA3,
  RIPEMD160: CryptoJS.RIPEMD160,
};

type ConfigObjectKeys = keyof Omit<typeof defaultState, "selectedTool">;

function DataGeneratorComponent({ instanceId }: DataGeneratorProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const { selectedTool, uuidConfig, nanoidConfig, hashConfig, passwordConfig } =
    state;

  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  const handleConfigChange = <T extends ConfigObjectKeys>(
    tool: T,
    key: keyof (typeof defaultState)[T],
    value: (typeof defaultState)[T][keyof (typeof defaultState)[T]]
  ) => {
    setState((currentState) => ({
      ...currentState,
      [tool]: {
        ...currentState[tool],
        [key]: value,
      },
    }));
  };

  const generateUuids = useCallback(() => {
    const { quantity, version, v3v5_name, v3v5_namespace } = uuidConfig;
    let newIds: string[] = [];
    try {
      switch (version) {
        case "v1":
          newIds = Array.from({ length: quantity }, () => uuidv1());
          break;
        case "v3":
          if (!v3v5_name || !uuidValidate(v3v5_namespace))
            throw new Error("Nome e Namespace UUID válido são obrigatórios.");
          newIds = [uuidv3(v3v5_name, v3v5_namespace)];
          break;
        case "v5":
          if (!v3v5_name || !uuidValidate(v3v5_namespace))
            throw new Error("Nome e Namespace UUID válido são obrigatórios.");
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

  const generateNanoIds = useCallback(() => {
    const { quantity, size } = nanoidConfig;
    const newIds = Array.from({ length: quantity }, () => nanoid(size));
    setGeneratedIds(newIds);
    toast.success(`${quantity} NanoID(s) gerados!`);
  }, [nanoidConfig]);

  const generatePassword = useCallback(() => {
    const { length, uppercase, lowercase, numbers, symbols } = passwordConfig;
    const charSets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };
    let charset = "";
    if (uppercase) charset += charSets.uppercase;
    if (lowercase) charset += charSets.lowercase;
    if (numbers) charset += charSets.numbers;
    if (symbols) charset += charSets.symbols;
    if (!charset) {
      toast.error("Selecione ao menos um tipo de caractere para a senha.");
      setGeneratedPassword("");
      return;
    }
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setGeneratedPassword(newPassword);
    toast.success("Nova senha gerada!");
  }, [passwordConfig]);

  useEffect(() => {
    switch (selectedTool) {
      case "uuid":
        generateUuids();
        break;
      case "nanoid":
        generateNanoIds();
        break;
      case "password":
        generatePassword();
        break;
    }
  }, [selectedTool, generateUuids, generateNanoIds, generatePassword]);

  const formattedIds = useMemo(() => {
    return generatedIds.map((id) => {
      let formattedId = id;
      if (selectedTool === "uuid" && uuidConfig.noHyphens)
        formattedId = formattedId.replace(/-/g, "");
      if (selectedTool === "uuid" && uuidConfig.uppercase)
        formattedId = formattedId.toUpperCase();
      return formattedId;
    });
  }, [generatedIds, uuidConfig, selectedTool]);

  const calculatedHashes = useMemo(() => {
    if (!hashConfig.input) return {};
    const hashes: Partial<Record<HashAlgorithm, string>> = {};
    hashAlgorithms.forEach((alg) => {
      const hashFunction = hashFunctionMap[alg];
      hashes[alg] = (
        hashFunction(hashConfig.input) as unknown as string
      ).toString();
    });
    return hashes;
  }, [hashConfig.input]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copiado!"));
  };
  const handleCopyAllIds = () => {
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
                      handleConfigChange(
                        "uuidConfig",
                        "version",
                        v as UuidVersion
                      )
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
                          handleConfigChange(
                            "uuidConfig",
                            "v3v5_name",
                            e.target.value
                          )
                        }
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
                          handleConfigChange(
                            "uuidConfig",
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
                            handleConfigChange(
                              "uuidConfig",
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
                            handleConfigChange(
                              "uuidConfig",
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
                            handleConfigChange(
                              "uuidConfig",
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
                          handleConfigChange(
                            "uuidConfig",
                            "noHyphens",
                            !!checked
                          )
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
                          handleConfigChange(
                            "uuidConfig",
                            "uppercase",
                            !!checked
                          )
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
              <Button onClick={generateUuids} size="lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Gerar Novos
              </Button>
            )}
            <Button onClick={handleCopyAllIds} variant="outline">
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

      {selectedTool === "nanoid" && (
        <div className="grid grid-cols-1 @4xl:grid-cols-3 gap-4 flex-grow min-h-0 overflow-y-auto">
          <div className="@4xl:col-span-1 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Configurações do NanoID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nanoid-quantity">Quantidade</Label>
                  <Input
                    id="nanoid-quantity"
                    type="number"
                    value={nanoidConfig.quantity}
                    onChange={(e) =>
                      handleConfigChange(
                        "nanoidConfig",
                        "quantity",
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    min="1"
                    max="1000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nanoid-size">Tamanho do ID</Label>
                  <Input
                    id="nanoid-size"
                    type="number"
                    value={nanoidConfig.size}
                    onChange={(e) =>
                      handleConfigChange(
                        "nanoidConfig",
                        "size",
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    min="1"
                    max="100"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            <Button onClick={generateNanoIds} size="lg">
              <RefreshCw className="mr-2 h-4 w-4" /> Gerar Novos
            </Button>
            <Button onClick={handleCopyAllIds} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> Copiar Todos
            </Button>
          </div>
          <div className="@4xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">NanoIDs Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-fit max-h-[calc(100vh-20rem)]">
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

      {selectedTool === "hash" && (
        <div className="flex flex-col gap-4 flex-grow min-h-0 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gerador de Hash</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="hash-input">Texto de Entrada</Label>
              <Textarea
                id="hash-input"
                value={hashConfig.input}
                onChange={(e) =>
                  handleConfigChange("hashConfig", "input", e.target.value)
                }
                className="mt-1 font-mono text-sm h-32"
              />
            </CardContent>
          </Card>
          <Card className="flex-grow">
            <CardHeader>
              <CardTitle className="text-base">Hashes Gerados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-fit max-h-[calc(100vh-25rem)]">
                {hashAlgorithms.map((alg) => (
                  <div key={alg} className="mb-3">
                    <Label>{alg}</Label>
                    <div className="flex items-center gap-2 font-mono text-sm p-2 bg-muted/50 rounded mt-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          handleCopyToClipboard(calculatedHashes[alg] || "")
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <span className="flex-grow truncate text-xs">
                        {calculatedHashes[alg]}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTool === "password" && (
        <div className="flex flex-col items-center gap-4 flex-grow overflow-y-auto">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Senha Segura Gerada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 font-mono text-lg p-3 bg-primary/10 rounded">
                <span className="flex-grow truncate">{generatedPassword}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleCopyToClipboard(generatedPassword)}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">
                Configurações da Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tamanho:</Label>
                  <span>{passwordConfig.length}</span>
                </div>
                <Slider
                  value={[passwordConfig.length]}
                  onValueChange={(v) =>
                    handleConfigChange("passwordConfig", "length", v[0])
                  }
                  min={4}
                  max={64}
                  step={1}
                />
              </div>
              <div className="grid @md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={passwordConfig.uppercase}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "uppercase", !!c)
                    }
                  />
                  <Label htmlFor="uppercase">Maiúsculas (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={passwordConfig.lowercase}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "lowercase", !!c)
                    }
                  />
                  <Label htmlFor="lowercase">Minúsculas (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={passwordConfig.numbers}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "numbers", !!c)
                    }
                  />
                  <Label htmlFor="numbers">Números (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={passwordConfig.symbols}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "symbols", !!c)
                    }
                  />
                  <Label htmlFor="symbols">Símbolos (!@#)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={generatePassword}
            size="lg"
            className="w-full max-w-lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Gerar Nova Senha
          </Button>
        </div>
      )}
    </div>
  );
}

const MemoizedDataGenerator = React.memo(DataGeneratorComponent);
export function DataGenerator({ instanceId }: { instanceId: string }) {
  return <MemoizedDataGenerator instanceId={instanceId} />;
}
