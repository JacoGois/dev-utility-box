"use client";

import { faker } from "@faker-js/faker";
import { Copy, Download, Library, Loader2, X } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { useAppTranslations } from "@/hooks/useTranslations";

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

const createAvailableFakerFields = (
  t: (key: string) => string
): Record<string, Record<string, string>> => ({
  [t("fields.person")]: {
    [t("fields.fullName")]: "person.fullName",
    [t("fields.firstName")]: "person.firstName",
    [t("fields.lastName")]: "person.lastName",
    [t("fields.middleName")]: "person.middleName",
    [t("fields.prefix")]: "person.prefix",
    [t("fields.suffix")]: "person.suffix",
    [t("fields.sex")]: "person.sex",
    [t("fields.gender")]: "person.gender",
    [t("fields.bio")]: "person.bio",
    [t("fields.jobArea")]: "person.jobArea",
    [t("fields.jobTitle")]: "person.jobTitle",
    [t("fields.jobDescriptor")]: "person.jobDescriptor",
    [t("fields.jobType")]: "person.jobType",
    [t("fields.zodiacSign")]: "person.zodiacSign",
    [t("fields.cpf")]: "br.cpf",
    [t("fields.cnpj")]: "br.cnpj",
  },
  [t("fields.internet")]: {
    [t("fields.email")]: "internet.email",
    [t("fields.userName")]: "internet.userName",
    [t("fields.url")]: "internet.url",
    [t("fields.domainName")]: "internet.domainName",
    [t("fields.ip")]: "internet.ip",
    [t("fields.ipv6")]: "internet.ipv6",
    [t("fields.mac")]: "internet.mac",
    [t("fields.color")]: "internet.color",
    [t("fields.password")]: "internet.password",
    [t("fields.protocol")]: "internet.protocol",
    [t("fields.userAgent")]: "internet.userAgent",
    [t("fields.httpMethod")]: "internet.httpMethod",
  },
  [t("fields.finance")]: {
    [t("fields.accountNumber")]: "finance.accountNumber",
    [t("fields.accountName")]: "finance.accountName",
    [t("fields.currencyName")]: "finance.currencyName",
    [t("fields.currencyCode")]: "finance.currencyCode",
    [t("fields.currencySymbol")]: "finance.currencySymbol",
    [t("fields.creditCardNumber")]: "finance.creditCardNumber",
    [t("fields.creditCardCVV")]: "finance.creditCardCVV",
    [t("fields.iban")]: "finance.iban",
    [t("fields.bic")]: "finance.bic",
    [t("fields.bitcoinAddress")]: "finance.bitcoinAddress",
    [t("fields.ethereumAddress")]: "finance.ethereumAddress",
  },
  [t("fields.location")]: {
    [t("fields.streetAddress")]: "location.streetAddress",
    [t("fields.city")]: "location.city",
    [t("fields.state")]: "location.state",
    [t("fields.country")]: "location.country",
    [t("fields.countryCode")]: "location.countryCode",
    [t("fields.zipCode")]: "location.zipCode",
    [t("fields.latitude")]: "location.latitude",
    [t("fields.longitude")]: "location.longitude",
    [t("fields.direction")]: "location.direction",
    [t("fields.timeZone")]: "location.timeZone",
  },
  [t("fields.animal")]: {
    [t("fields.dog")]: "animal.dog",
    [t("fields.cat")]: "animal.cat",
    [t("fields.bird")]: "animal.bird",
    [t("fields.fish")]: "animal.fish",
    [t("fields.insect")]: "animal.insect",
    [t("fields.animalType")]: "animal.type",
    [t("fields.bear")]: "animal.bear",
    [t("fields.cow")]: "animal.cow",
    [t("fields.lion")]: "animal.lion",
  },
  [t("fields.commerce")]: {
    [t("fields.productName")]: "commerce.productName",
    [t("fields.price")]: "commerce.price",
    [t("fields.department")]: "commerce.department",
    [t("fields.sku")]: "commerce.sku",
    [t("fields.productDescription")]: "commerce.productDescription",
    [t("fields.productAdjective")]: "commerce.productAdjective",
    [t("fields.productMaterial")]: "commerce.productMaterial",
  },
  [t("fields.system")]: {
    [t("fields.fileName")]: "system.fileName",
    [t("fields.fileExt")]: "system.fileExt",
    [t("fields.fileType")]: "system.fileType",
    [t("fields.mimeType")]: "system.mimeType",
    [t("fields.directoryPath")]: "system.directoryPath",
    [t("fields.filePath")]: "system.filePath",
    [t("fields.semver")]: "system.semver",
  },
  [t("fields.string")]: {
    [t("fields.uuid")]: "string.uuid",
    [t("fields.alphanumeric")]: "string.alphanumeric",
    [t("fields.numeric")]: "string.numeric",
    [t("fields.hexadecimal")]: "string.hexadecimal",
    [t("fields.binary")]: "string.binary",
    [t("fields.octal")]: "string.octal",
  },
  [t("fields.vehicle")]: {
    [t("fields.vehicle")]: "vehicle.vehicle",
    [t("fields.manufacturer")]: "vehicle.manufacturer",
    [t("fields.model")]: "vehicle.model",
    [t("fields.vehicleType")]: "vehicle.type",
    [t("fields.vin")]: "vehicle.vin",
    [t("fields.vehicleColor")]: "vehicle.color",
  },
  [t("fields.date")]: {
    [t("fields.pastDate")]: "date.past",
    [t("fields.futureDate")]: "date.future",
    [t("fields.recentDate")]: "date.recent",
    [t("fields.birthdate")]: "date.birthdate",
    [t("fields.dateBetween")]: "date.between",
    [t("fields.weekday")]: "date.weekday",
    [t("fields.month")]: "date.month",
  },
  [t("fields.primitiveTypes")]: {
    [t("fields.stringUuid")]: "string.uuid",
    [t("fields.stringAlphanumeric")]: "string.alphanumeric",
    [t("fields.stringAlpha")]: "string.alpha",
    [t("fields.intNumber")]: "number.int",
    [t("fields.floatNumber")]: "number.float",
    [t("fields.boolean")]: "datatype.boolean",
  },
  [t("fields.loremText")]: {
    [t("fields.loremWord")]: "lorem.word",
    [t("fields.loremWords")]: "lorem.words",
    [t("fields.loremSentence")]: "lorem.sentence",
    [t("fields.loremParagraph")]: "lorem.paragraph",
    [t("fields.loremLines")]: "lorem.lines",
    [t("fields.loremSlug")]: "lorem.slug",
  },
  [t("fields.number")]: {
    [t("fields.intNumeric")]: "number.int",
    [t("fields.floatNumeric")]: "number.float",
    [t("fields.hexNumeric")]: "number.hex",
    [t("fields.binaryNumeric")]: "number.binary",
    [t("fields.octalNumeric")]: "number.octal",
  },
  [t("fields.airline")]: {
    [t("fields.airline")]: "airline.airline",
    [t("fields.airplane")]: "airline.airplane",
    [t("fields.airport")]: "airline.airport",
    [t("fields.flightNumber")]: "airline.flightNumber",
    [t("fields.seat")]: "airline.seat",
  },
  [t("fields.hacker")]: {
    [t("fields.abbreviation")]: "hacker.abbreviation",
    [t("fields.adjective")]: "hacker.adjective",
    [t("fields.noun")]: "hacker.noun",
    [t("fields.verb")]: "hacker.verb",
    [t("fields.phrase")]: "hacker.phrase",
  },
  [t("fields.word")]: {
    [t("fields.wordNoun")]: "word.noun",
    [t("fields.wordVerb")]: "word.verb",
    [t("fields.wordAdjective")]: "word.adjective",
    [t("fields.wordPreposition")]: "word.preposition",
    [t("fields.wordSample")]: "word.sample",
  },
  [t("fields.company")]: {
    [t("fields.companyName")]: "company.name",
    [t("fields.buzzPhrase")]: "company.buzzPhrase",
    [t("fields.catchPhrase")]: "company.catchPhrase",
    [t("fields.bs")]: "company.bs",
  },
  [t("fields.database")]: {
    [t("fields.column")]: "database.column",
    [t("fields.columnType")]: "database.type",
    [t("fields.engine")]: "database.engine",
    [t("fields.mongodbObjectId")]: "database.mongodbObjectId",
  },
  [t("fields.git")]: {
    [t("fields.branch")]: "git.branch",
    [t("fields.commitSha")]: "git.commitSha",
    [t("fields.shortSha")]: "git.shortSha",
    [t("fields.commitMessage")]: "git.commitMessage",
  },
  [t("fields.image")]: {
    [t("fields.imageUrl")]: "image.url",
    [t("fields.avatar")]: "image.avatar",
    [t("fields.dataUri")]: "image.dataUri",
  },
  [t("fields.color")]: {
    [t("fields.colorName")]: "color.human",
    [t("fields.colorSpace")]: "color.space",
    [t("fields.rgbColor")]: "color.rgb",
  },
  [t("fields.music")]: {
    [t("fields.genre")]: "music.genre",
    [t("fields.songName")]: "music.songName",
  },
  [t("fields.phone")]: {
    [t("fields.phoneNumber")]: "phone.number",
    [t("fields.imei")]: "phone.imei",
  },
  [t("fields.science")]: {
    [t("fields.chemicalElement")]: "science.chemicalElement",
    [t("fields.unit")]: "science.unit",
  },
});

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
  const t = useAppTranslations("massDataGenerator");
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
        toast.success(t("messages.dataCopied"));
      },
      () => {
        toast.error(t("errors.copyError"));
      }
    );
  }, [state.generatedData, t]);

  return (
    <div className="grid grid-cols-6 @container gap-4 h-full w-full overflow-auto p-4 bg-background">
      <div className="col-span-6 @4xl:col-span-2 flex flex-col gap-4">
        <FieldLibraryDialog
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          onSelectField={handleAddField}
          availableFields={createAvailableFakerFields(t)}
          parentModalContainerRef={parentModalContainerRef}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("labels.dataTypes")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsLibraryOpen(true)}
            >
              <Library className="h-4 w-4" /> {t("buttons.add")}
              <span className="hidden @md:inline-block">
                {t("buttons.fieldFromLibrary")}
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
            <CardTitle>{t("labels.generalSettings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">{t("labels.recordQuantity")}</Label>
              <Input
                id="quantity"
                type="number"
                placeholder={t("placeholders.quantityExample")}
                value={state.quantity}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    Math.max(1, parseInt(e.target.value) || 1) > 10000
                  ) {
                    toast.error(t("errors.maxQuantity"));
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
              <Label>{t("labels.outputFormat")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={
                    state.outputFormat === "json" ? "default" : "outline"
                  }
                  onClick={() => setState({ outputFormat: "json" })}
                >
                  {t("formats.json")}
                </Button>
                <Button
                  variant={state.outputFormat === "csv" ? "default" : "outline"}
                  onClick={() => setState({ outputFormat: "csv" })}
                >
                  {t("formats.csv")}
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
                    {t("csv.includeHeader")}
                  </Label>
                </div>
                <div>
                  <Label>{t("csv.delimiter")}</Label>
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
                      <SelectItem value=",">{t("csv.comma")}</SelectItem>
                      <SelectItem value=";">{t("csv.semicolon")}</SelectItem>
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
          {state.isLoading
            ? t("buttons.generating")
            : t("buttons.generateFakeData")}
        </Button>
      </div>

      <div className="col-span-6 @4xl:col-span-4 flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader className="grid-cols-1 @md:grid-cols-2 items-center justify-between gap-3">
            <CardTitle className="w-fit">{t("labels.generatedData")}</CardTitle>
            <div className="flex flex-col @md:flex-row @md:justify-end items-center gap-2 w-full">
              {state.generatedData && !state.isLoading && (
                <>
                  <Button
                    className="@md:max-w-32 w-full"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />{" "}
                    {t("buttons.download")}
                  </Button>
                  <Button
                    className="@md:max-w-32 w-full"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="mr-2 h-4 w-4" /> {t("buttons.copy")}
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
                  ? t("messages.generatingInBackground")
                  : state.generatedData
              }
              placeholder={t("placeholders.configureAndGenerate")}
              className="h-full resize-none text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
