"use client";

import { faker } from "@faker-js/faker";
import { Download, Loader2, Trash2, X } from "lucide-react";
import { FC, useCallback, useEffect, useRef } from "react";

import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";

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
import { toast } from "sonner";

type SelectedField = {
  id: string;
  fieldName: string;
  fakerMethod: string;
};

export const defaultState = {
  selectedFields: [] as SelectedField[],
  quantity: 10,
  outputFormat: "json" as "json" | "csv",
  generatedData: "",
  isLoading: false,
  csvOptions: {
    includeHeader: true,
    delimiter: "," as "," | ";",
  },
};

const AVAILABLE_FAKER_FIELDS = {
  "ID (UUID)": "string.uuid",
  "Nome Completo": "person.fullName",
  "Primeiro Nome": "person.firstName",
  Sobrenome: "person.lastName",
  "E-mail": "internet.email",
  "Nome de Usuário": "internet.userName",
  "Avatar (URL)": "image.avatar",
  País: "location.country",
  Cidade: "location.city",
  Telefone: "phone.number",
  "Nome da Empresa": "company.name",
  Preço: "commerce.price",
  "Nome do Produto": "commerce.productName",
  Parágrafo: "lorem.paragraph",
};

type DataGeneratorProps = {
  instanceId: string;
};

export const DataGenerator: FC<DataGeneratorProps> = ({ instanceId }) => {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./workers/dataGenerator.worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = (
      event: MessageEvent<{ generatedData: string }>
    ) => {
      setState({
        generatedData: event.data.generatedData,
        isLoading: false,
      });
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleAddField = useCallback(
    (fakerMethod: string) => {
      if (!fakerMethod) return;
      const defaultFieldName = fakerMethod.split(".").pop() || "field";
      setState((s) => ({
        selectedFields: [
          ...s.selectedFields,
          { id: faker.string.uuid(), fieldName: defaultFieldName, fakerMethod },
        ],
      }));
    },
    [setState]
  );

  const handleRemoveField = useCallback(
    (id: string) => {
      setState((s) => ({
        selectedFields: s.selectedFields.filter((field) => field.id !== id),
      }));
    },
    [setState]
  );

  const handleFieldNameChange = useCallback(
    (id: string, newName: string) => {
      setState((s) => ({
        selectedFields: s.selectedFields.map((f) =>
          f.id === id ? { ...f, fieldName: newName } : f
        ),
      }));
    },
    [setState]
  );

  const handleClearSchema = useCallback(() => {
    setState({ selectedFields: defaultState.selectedFields });
    toast.success("Schema Limpo!", {
      description: "A configuração de campos foi resetada.",
    });
  }, [setState]);

  const handleGenerateData = useCallback(() => {
    if (!workerRef.current || state.selectedFields.length === 0) return;
    setState({ isLoading: true, generatedData: "" });
    workerRef.current.postMessage({
      fields: state.selectedFields,
      quantity: state.quantity,
      format: state.outputFormat,
      csvOptions: state.csvOptions,
    });
  }, [state, setState]);

  const handleDownload = useCallback(() => {
    if (!state.generatedData) return;
    const fileExtension = state.outputFormat;
    const mimeType =
      state.outputFormat === "json" ? "application/json" : "text/csv";
    const blob = new Blob([state.generatedData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated_data_${instanceId}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.generatedData, state.outputFormat, instanceId]);

  return (
    <div className="grid grid-cols-1 @container lg:grid-cols-3 gap-4 h-full w-full overflow-auto p-4 bg-background">
      <div className="lg:col-span-1 flex flex-col gap-4">
        {/* MUDANÇA: O Card de gerenciamento agora só precisa do botão de Limpar.
            A persistência é automática, então o botão "Salvar" não é mais necessário. */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleClearSchema}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Resetar/Limpar Schema
            </Button>
          </CardContent>
        </Card>

        {/* O restante do JSX permanece praticamente o mesmo, mas agora
            as funções `setState` que eles chamam são as do seu hook customizado. */}

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleAddField}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar um campo..." />
              </SelectTrigger>
              <SelectContent className="z-[9999999999]">
                {Object.entries(AVAILABLE_FAKER_FIELDS).map(
                  ([name, method]) => (
                    <SelectItem key={method} value={method}>
                      {name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {state.selectedFields.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    value={field.fieldName}
                    onChange={(e) =>
                      handleFieldNameChange(field.id, e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveField(field.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantidade de registros</Label>
              <Input
                id="quantity"
                type="number"
                value={state.quantity}
                onChange={(e) =>
                  setState({
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label>Formato de saída</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={
                    state.outputFormat === "json" ? "default" : "outline"
                  }
                  onClick={() => setState({ outputFormat: "json" })}
                >
                  JSON
                </Button>
                <Button
                  variant={state.outputFormat === "csv" ? "default" : "outline"}
                  onClick={() => setState({ outputFormat: "csv" })}
                >
                  CSV
                </Button>
              </div>
            </div>
            {state.outputFormat === "csv" && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHeader"
                    checked={state.csvOptions.includeHeader}
                    onCheckedChange={(checked) =>
                      setState((s) => ({
                        csvOptions: {
                          ...s.csvOptions,
                          includeHeader: !!checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="includeHeader">
                    Incluir cabeçalho no CSV
                  </Label>
                </div>
                <div>
                  <Label>Delimitador do CSV</Label>
                  <Select
                    value={state.csvOptions.delimiter}
                    onValueChange={(value: "," | ";") =>
                      setState((s) => ({
                        csvOptions: { ...s.csvOptions, delimiter: value },
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999999999]">
                      <SelectItem value=",">Vírgula (,)</SelectItem>
                      <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleGenerateData}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {state.isLoading ? "Gerando..." : "Gerar Dados Falsos"}
        </Button>
      </div>

      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dados Gerados</CardTitle>
            {state.generatedData && !state.isLoading && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Baixar
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              readOnly
              value={
                state.isLoading
                  ? "Gerando dados na thread de segundo plano..."
                  : state.generatedData
              }
              placeholder='Configure os dados na coluna à esquerda e clique em "Gerar" para ver os resultados aqui.'
              className="h-full resize-none text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
