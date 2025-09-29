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
import { useAppTranslations } from "@/hooks/useTranslations";
import CryptoJS from "crypto-js";
import { Copy, RefreshCw } from "lucide-react";
import { customAlphabet } from "nanoid";
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

const createToolOptions = (t: (key: string) => string) => [
  { value: "uuid", label: t("tools.uuid") },
  { value: "nanoid", label: t("tools.nanoid") },
  { value: "hash", label: t("tools.hash") },
  { value: "password", label: t("tools.password") },
];

const createNanoidAlphabets = (t: (key: string) => string) => ({
  urlSafe: {
    label: t("nanoidAlphabets.urlSafe"),
    value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
  },
  numbers: { label: t("nanoidAlphabets.numbers"), value: "0123456789" },
  uppercase: {
    label: t("nanoidAlphabets.uppercase"),
    value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  lowercase: {
    label: t("nanoidAlphabets.lowercase"),
    value: "abcdefghijklmnopqrstuvwxyz",
  },
  noLookAlikes: {
    label: t("nanoidAlphabets.noLookAlikes"),
    value: "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz",
  },
  custom: { label: t("nanoidAlphabets.custom"), value: "custom" },
});

const hashAlgorithms = [
  "MD5",
  "SHA1",
  "SHA256",
  "SHA384",
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
    alphabetType: "urlSafe" as keyof ReturnType<typeof createNanoidAlphabets>,
    customAlphabetValue: "",
    customUseNumbers: true,
    customUseLowercase: true,
    customUseUppercase: true,
  },
  hashConfig: {
    input: "Hello, world!",
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
  SHA384: CryptoJS.SHA384,
  SHA512: CryptoJS.SHA512,
  SHA3: CryptoJS.SHA3,
  RIPEMD160: CryptoJS.RIPEMD160,
};

type ConfigObjectKeys = keyof Omit<typeof defaultState, "selectedTool">;

function DataGeneratorComponent({ instanceId }: DataGeneratorProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const { selectedTool, uuidConfig, nanoidConfig, hashConfig, passwordConfig } =
    state;
  const t = useAppTranslations("dataGenerator");

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
            throw new Error(t("errors.nameAndNamespaceRequired"));
          newIds = [uuidv3(v3v5_name, v3v5_namespace)];
          break;
        case "v5":
          if (!v3v5_name || !uuidValidate(v3v5_namespace))
            throw new Error(t("errors.nameAndNamespaceRequired"));
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
      toast.error(t("errors.uuidGenerationError"), {
        description: (e as Error).message,
      });
    }
  }, [uuidConfig]);

  const generateNanoIds = useCallback(() => {
    const { quantity, size, alphabetType, customAlphabetValue } = nanoidConfig;
    const nanoidAlphabets = createNanoidAlphabets(t);
    const alphabet =
      alphabetType === "custom"
        ? customAlphabetValue
        : nanoidAlphabets[alphabetType].value;
    if (!alphabet || alphabet.length < 2) {
      toast.error(t("errors.alphabetError"), {
        description: t("errors.alphabetMinLength"),
      });
      setGeneratedIds([]);
      return;
    }
    try {
      const customNanoid = customAlphabet(alphabet, size);
      const newIds = Array.from({ length: quantity }, () => customNanoid());
      setGeneratedIds(newIds);
    } catch (e) {
      toast.error(t("errors.nanoidGenerationError"), {
        description: (e as Error).message,
      });
      setGeneratedIds([]);
    }
  }, [nanoidConfig, t]);

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
      toast.error(t("errors.selectCharacterType"));
      setGeneratedPassword("");
      return;
    }
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setGeneratedPassword(newPassword);
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
  }, [
    selectedTool,
    uuidConfig,
    nanoidConfig,
    passwordConfig,
    generateUuids,
    generateNanoIds,
    generatePassword,
  ]);

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
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(t("messages.copied")));
  };
  const handleCopyAllIds = () => {
    if (formattedIds.length === 0) return;
    const allIds = formattedIds.join("\n");
    navigator.clipboard
      .writeText(allIds)
      .then(() => toast.success(t("messages.allIdsCopied")));
  };

  useEffect(() => {
    if (nanoidConfig.alphabetType === "custom") {
      const { customUseNumbers, customUseLowercase, customUseUppercase } =
        nanoidConfig;
      let newAlphabet = "";
      if (customUseLowercase) newAlphabet += "abcdefghijklmnopqrstuvwxyz";
      if (customUseUppercase) newAlphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (customUseNumbers) newAlphabet += "0123456789";

      handleConfigChange("nanoidConfig", "customAlphabetValue", newAlphabet);
    }
  }, [
    nanoidConfig.alphabetType,
    nanoidConfig.customUseNumbers,
    nanoidConfig.customUseLowercase,
    nanoidConfig.customUseUppercase,
  ]);

  const isNameBasedVersion =
    uuidConfig.version === "v3" || uuidConfig.version === "v5";
  const isConstantVersion =
    uuidConfig.version === "nil" || uuidConfig.version === "max";
  const isBulkGeneratable = !isNameBasedVersion && !isConstantVersion;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t @container">
      <div className="flex items-center gap-4 border-b pb-4 flex-wrap">
        <Label className="flex-shrink-0 font-bold">{t("labels.tool")}:</Label>
        <Select
          value={selectedTool}
          onValueChange={(value) => setState({ selectedTool: value })}
        >
          <SelectTrigger className="w-full @sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[999999999]">
            {createToolOptions(t).map((opt) => (
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
                  {t("uuid.settings.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="uuid-version">
                    {t("uuid.settings.version")}
                  </Label>
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
                    <SelectTrigger id="uuid-version" className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[999999999]">
                      <SelectItem value="v7">
                        {t("uuid.versions.v7")}
                      </SelectItem>
                      <SelectItem value="v4">
                        {t("uuid.versions.v4")}
                      </SelectItem>
                      <SelectItem value="v6">
                        {t("uuid.versions.v6")}
                      </SelectItem>
                      <SelectItem value="v1">
                        {t("uuid.versions.v1")}
                      </SelectItem>
                      <SelectItem value="v5">
                        {t("uuid.versions.v5")}
                      </SelectItem>
                      <SelectItem value="v3">
                        {t("uuid.versions.v3")}
                      </SelectItem>
                      <SelectItem value="nil">
                        {t("uuid.versions.nil")}
                      </SelectItem>
                      <SelectItem value="max">
                        {t("uuid.versions.max")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isNameBasedVersion && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="v3v5-name">
                        {t("uuid.settings.name")}
                      </Label>
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
                        {t("uuid.settings.namespace")}
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
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleConfigChange(
                              "uuidConfig",
                              "v3v5_namespace",
                              UUID_NAMESPACES.DNS
                            )
                          }
                        >
                          {t("uuid.settings.dns")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleConfigChange(
                              "uuidConfig",
                              "v3v5_namespace",
                              UUID_NAMESPACES.URL
                            )
                          }
                        >
                          {t("uuid.settings.url")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {!isConstantVersion && (
                  <div className="space-y-4 border-t pt-4">
                    {isBulkGeneratable && (
                      <div>
                        <Label htmlFor="uuid-quantity">
                          {t("labels.quantity")}
                        </Label>
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
                        {t("uuid.settings.removeHyphens")}
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
                        {t("uuid.settings.uppercase")}
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {isBulkGeneratable && (
              <Button onClick={generateUuids} size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />{" "}
                {t("buttons.generateNew")}
              </Button>
            )}
            <Button onClick={handleCopyAllIds} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> {t("buttons.copyAll")}
            </Button>
          </div>
          <div className="@4xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  {t("labels.generatedIds")}
                </CardTitle>
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

      {selectedTool === "nanoid" && (
        <div className="grid grid-cols-1 @4xl:grid-cols-3 gap-4 flex-grow min-h-0 overflow-y-auto">
          <div className="@4xl:col-span-1 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("nanoid.settings.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nanoid-quantity">
                    {t("labels.quantity")}
                  </Label>
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
                  <Label htmlFor="nanoid-size">
                    {t("nanoid.settings.idSize")}
                  </Label>
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
                <div className="space-y-2">
                  <Label htmlFor="nanoid-alphabet-type">
                    {t("nanoid.settings.alphabet")}
                  </Label>
                  <Select
                    value={nanoidConfig.alphabetType}
                    onValueChange={(v) =>
                      handleConfigChange(
                        "nanoidConfig",
                        "alphabetType",
                        v as keyof ReturnType<typeof createNanoidAlphabets>
                      )
                    }
                  >
                    <SelectTrigger id="nanoid-alphabet-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[999999999]">
                      {Object.entries(createNanoidAlphabets(t)).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {nanoidConfig.alphabetType === "custom" && (
                  <div className="space-y-4 border-t pt-4">
                    <Label>{t("nanoid.settings.customAlphabetBuilder")}</Label>
                    <div className="grid @md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nanoid-custom-lower"
                          checked={nanoidConfig.customUseLowercase}
                          onCheckedChange={(c) =>
                            handleConfigChange(
                              "nanoidConfig",
                              "customUseLowercase",
                              !!c
                            )
                          }
                        />
                        <Label htmlFor="nanoid-custom-lower">
                          {t("nanoid.settings.lowercase")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nanoid-custom-upper"
                          checked={nanoidConfig.customUseUppercase}
                          onCheckedChange={(c) =>
                            handleConfigChange(
                              "nanoidConfig",
                              "customUseUppercase",
                              !!c
                            )
                          }
                        />
                        <Label htmlFor="nanoid-custom-upper">
                          {t("nanoid.settings.uppercase")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nanoid-custom-numbers"
                          checked={nanoidConfig.customUseNumbers}
                          onCheckedChange={(c) =>
                            handleConfigChange(
                              "nanoidConfig",
                              "customUseNumbers",
                              !!c
                            )
                          }
                        />
                        <Label htmlFor="nanoid-custom-numbers">
                          {t("nanoid.settings.numbers")}
                        </Label>
                      </div>
                    </div>
                    <Textarea
                      id="nanoid-custom-alphabet"
                      value={nanoidConfig.customAlphabetValue}
                      onChange={(e) =>
                        handleConfigChange(
                          "nanoidConfig",
                          "customAlphabetValue",
                          e.target.value
                        )
                      }
                      className="font-mono text-xs h-24"
                      placeholder={t(
                        "nanoid.settings.customAlphabetPlaceholder"
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            <Button onClick={generateNanoIds} size="lg">
              <RefreshCw className="mr-2 h-4 w-4" /> {t("buttons.generateNew")}
            </Button>
            <Button onClick={handleCopyAllIds} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> {t("buttons.copyAll")}
            </Button>
          </div>
          <div className="@4xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  {t("labels.generatedNanoids")}
                </CardTitle>
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
              <CardTitle className="text-base">{t("hash.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="hash-input">{t("hash.inputLabel")}</Label>
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
              <CardTitle className="text-base">
                {t("hash.generatedTitle")}
              </CardTitle>
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
              <CardTitle className="text-base">
                {t("password.generatedTitle")}
              </CardTitle>
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
                {t("password.settings.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("password.settings.length")}:</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={passwordConfig.uppercase}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "uppercase", !!c)
                    }
                  />
                  <Label htmlFor="uppercase">
                    {t("password.settings.uppercase")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={passwordConfig.lowercase}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "lowercase", !!c)
                    }
                  />
                  <Label htmlFor="lowercase">
                    {t("password.settings.lowercase")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={passwordConfig.numbers}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "numbers", !!c)
                    }
                  />
                  <Label htmlFor="numbers">
                    {t("password.settings.numbers")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={passwordConfig.symbols}
                    onCheckedChange={(c) =>
                      handleConfigChange("passwordConfig", "symbols", !!c)
                    }
                  />
                  <Label htmlFor="symbols">
                    {t("password.settings.symbols")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={generatePassword}
            size="lg"
            className="w-full max-w-lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />{" "}
            {t("buttons.generateNewPassword")}
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
