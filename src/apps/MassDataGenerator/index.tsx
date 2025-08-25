"use client";

import { faker } from "@faker-js/faker";
import { Copy, Download, Library, Loader2, X } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

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
import { useWindowShellStore } from "@/stores/useWindowShellStore";
import { toast } from "sonner";
import { FieldLibraryDialog } from "./components/FieldLibraryDialog";

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

const AVAILABLE_FAKER_FIELDS: Record<string, Record<string, string>> = {
  Pessoa: {
    "Nome Completo": "person.fullName",
    "Primeiro Nome": "person.firstName",
    Sobrenome: "person.lastName",
    "Nome do Meio": "person.middleName",
    "Prefixo (Sr., Dr.)": "person.prefix",
    "Sufixo (Jr., PhD)": "person.suffix",
    "Sexo Biológico": "person.sex",
    Gênero: "person.gender",
    Bio: "person.bio",
    "Área de Trabalho": "person.jobArea",
    Cargo: "person.jobTitle",
    "Descrição do Cargo": "person.jobDescriptor",
    "Tipo de Cargo": "person.jobType",
    "Signo do Zodíaco": "person.zodiacSign",
    CPF: "br.cpf",
    CNPJ: "br.cnpj",
  },
  Internet: {
    "E-mail": "internet.email",
    "Nome de Usuário": "internet.userName",
    URL: "internet.url",
    Domínio: "internet.domainName",
    "Endereço IP": "internet.ip",
    "Endereço IPv6": "internet.ipv6",
    "Endereço MAC": "internet.mac",
    "Cor (Hex)": "internet.color",
    Senha: "internet.password",
    Protocolo: "internet.protocol",
    "User Agent": "internet.userAgent",
    "Método HTTP": "internet.httpMethod",
  },
  Finanças: {
    "Nº da Conta": "finance.accountNumber",
    "Nome da Conta": "finance.accountName",
    "Nome da Moeda": "finance.currencyName",
    "Código da Moeda": "finance.currencyCode",
    "Símbolo da Moeda": "finance.currencySymbol",
    "Nº Cartão de Crédito": "finance.creditCardNumber",
    "CVV do Cartão": "finance.creditCardCVV",
    IBAN: "finance.iban",
    BIC: "finance.bic",
    "Endereço Bitcoin": "finance.bitcoinAddress",
    "Endereço Ethereum": "finance.ethereumAddress",
  },
  Localização: {
    Endereço: "location.streetAddress",
    Cidade: "location.city",
    "Estado (Abrev.)": "location.state",
    País: "location.country",
    "Código do País": "location.countryCode",
    CEP: "location.zipCode",
    Latitude: "location.latitude",
    Longitude: "location.longitude",
    Direção: "location.direction",
    "Fuso Horário": "location.timeZone",
  },
  Animal: {
    Cachorro: "animal.dog",
    Gato: "animal.cat",
    Pássaro: "animal.bird",
    Peixe: "animal.fish",
    Inseto: "animal.insect",
    "Tipo de Animal": "animal.type",
    Urso: "animal.bear",
    Vaca: "animal.cow",
    Leão: "animal.lion",
  },
  Comércio: {
    "Nome do Produto": "commerce.productName",
    Preço: "commerce.price",
    Departamento: "commerce.department",
    SKU: "commerce.sku",
    "Descrição do Produto": "commerce.productDescription",
    "Adjetivo do Produto": "commerce.productAdjective",
    "Material do Produto": "commerce.productMaterial",
  },
  Sistema: {
    "Nome de Arquivo": "system.fileName",
    "Extensão de Arquivo": "system.fileExt",
    "Tipo de Arquivo": "system.fileType",
    "MIME Type": "system.mimeType",
    "Caminho de Diretório": "system.directoryPath",
    "Caminho de Arquivo": "system.filePath",
    "Versão Semântica": "system.semver",
  },
  String: {
    UUID: "string.uuid",
    "Alfanumérico (String)": "string.alphanumeric",
    "Numérico (String)": "string.numeric",
    "Hexadecimal (String)": "string.hexadecimal",
    "Binário (String)": "string.binary",
    "Octal (String)": "string.octal",
  },
  Veículo: {
    Veículo: "vehicle.vehicle",
    Fabricante: "vehicle.manufacturer",
    Modelo: "vehicle.model",
    "Tipo de Veículo": "vehicle.type",
    "VIN (Chassi)": "vehicle.vin",
    "Cor do Veículo": "vehicle.color",
  },
  Data: {
    "Data no Passado": "date.past",
    "Data no Futuro": "date.future",
    "Data Recente": "date.recent",
    "Data de Aniversário": "date.birthdate",
    "Data Entre...": "date.between",
    "Dia da Semana": "date.weekday",
    Mês: "date.month",
  },
  "Tipos Primitivos": {
    "String (UUID)": "string.uuid",
    "String (Alfanumérica)": "string.alphanumeric",
    "String (Letras)": "string.alpha",
    "Número Inteiro": "number.int",
    "Número Decimal": "number.float",
    "Booleano (true/false)": "datatype.boolean",
  },
  "Texto Lorem": {
    "Palavra (Lorem)": "lorem.word",
    "Palavras (Lorem)": "lorem.words",
    "Sentença (Lorem)": "lorem.sentence",
    "Parágrafo (Lorem)": "lorem.paragraph",
    "Linhas de Texto (Lorem)": "lorem.lines",
    "Slug (Lorem)": "lorem.slug",
  },
  Número: {
    "Inteiro (Numérico)": "number.int",
    "Decimal (Numérico)": "number.float",
    "Hexadecimal (Numérico)": "number.hex",
    "Binário (Numérico)": "number.binary",
    "Octal (Numérico)": "number.octal",
  },
  "Companhia Aérea": {
    "Companhia Aérea": "airline.airline",
    Aeronave: "airline.airplane",
    Aeroporto: "airline.airport",
    "Nº do Voo": "airline.flightNumber",
    Assento: "airline.seat",
  },
  Hacker: {
    Abreviação: "hacker.abbreviation",
    Adjetivo: "hacker.adjective",
    Substantivo: "hacker.noun",
    Verbo: "hacker.verb",
    "Frase Hacker": "hacker.phrase",
  },
  Palavra: {
    "Substantivo (Dicionário)": "word.noun",
    "Verbo (Dicionário)": "word.verb",
    "Adjetivo (Dicionário)": "word.adjective",
    "Preposição (Dicionário)": "word.preposition",
    "Palavra (Dicionário)": "word.sample",
  },
  Empresa: {
    "Nome da Empresa": "company.name",
    "Slogan (Buzz)": "company.buzzPhrase",
    "Frase de Efeito": "company.catchPhrase",
    "Jargão de Negócios": "company.bs",
  },
  Database: {
    "Nome da Coluna": "database.column",
    "Tipo de Coluna": "database.type",
    Engine: "database.engine",
    "ID MongoDB": "database.mongodbObjectId",
  },
  Git: {
    Branch: "git.branch",
    "SHA do Commit": "git.commitSha",
    "SHA Curto do Commit": "git.shortSha",
    "Mensagem do Commit": "git.commitMessage",
  },
  Imagem: {
    "URL de Imagem": "image.url",
    Avatar: "image.avatar",
    "Data URI da Imagem": "image.dataUri",
  },
  Cor: {
    "Nome da Cor": "color.human",
    "Espaço de Cor": "color.space",
    "Cor RGB": "color.rgb",
  },
  Música: {
    "Gênero Musical": "music.genre",
    "Nome da Música": "music.songName",
  },
  Telefone: {
    "Número de Telefone": "phone.number",
    IMEI: "phone.imei",
  },
  Ciência: {
    "Elemento Químico": "science.chemicalElement",
    "Unidade de Medida": "science.unit",
  },
};

type MassDataGeneratorProps = {
  instanceId: string;
};

export const MassDataGenerator: FC<MassDataGeneratorProps> = ({
  instanceId,
}) => {
  const parentModalContainerRef = useWindowShellStore(
    (state) => state.refs[instanceId]
  );
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./workers/massDataGenerator.worker.ts", import.meta.url)
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

  const handleCopyToClipboard = useCallback(() => {
    if (!state.generatedData) return;
    navigator.clipboard.writeText(state.generatedData).then(
      () => {
        toast.success("Dados copiados para a área de transferência!");
      },
      () => {
        toast.error("Erro ao copiar dados. Tente novamente.");
      }
    );
  }, [state.generatedData]);

  return (
    <div className="grid grid-cols-6 @container gap-4 h-full w-full overflow-auto p-4 bg-background">
      <div className="col-span-6 @4xl:col-span-2 flex flex-col gap-4">
        <FieldLibraryDialog
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          onSelectField={handleAddField}
          availableFields={AVAILABLE_FAKER_FIELDS}
          parentModalContainerRef={parentModalContainerRef}
        />

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsLibraryOpen(true)}
            >
              <Library className="h-4 w-4" /> Adicionar
              <span className="hidden @md:inline-block">
                Campo da Biblioteca
              </span>
            </Button>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
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
                placeholder="Ex.: 10"
                value={state.quantity}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    Math.max(1, parseInt(e.target.value) || 1) > 10000
                  ) {
                    toast.error("Quantidade máxima é 10.000 registros.");
                    return;
                  }
                  setState({
                    quantity:
                      Math.max(1, parseInt(e.target.value)) || undefined,
                  });
                }}
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
          disabled={state.isLoading || !state.selectedFields.length}
        >
          {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {state.isLoading ? "Gerando..." : "Gerar Dados Falsos"}
        </Button>
      </div>

      <div className="col-span-6 @4xl:col-span-4 flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader className="grid-cols-1 @md:grid-cols-2 items-center justify-between gap-3">
            <CardTitle className="w-fit">Dados Gerados</CardTitle>
            <div className="flex flex-col @md:flex-row @md:justify-end items-center gap-2 w-full">
              {state.generatedData && !state.isLoading && (
                <>
                  <Button
                    className="@md:max-w-32 w-full"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" /> Baixar
                  </Button>
                  <Button
                    className="@md:max-w-32 w-full"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copiar
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              readOnly
              value={
                state.isLoading
                  ? "Gerando dados na thread de segundo plano..."
                  : state.generatedData
              }
              placeholder='Configure os dados e clique em "Gerar Dados Falsos" para ver os resultados aqui.'
              className="h-full resize-none text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
