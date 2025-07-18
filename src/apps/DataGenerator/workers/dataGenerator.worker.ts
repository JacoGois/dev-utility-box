import { faker } from "@faker-js/faker";

type GeneratedRecord = Record<string, string | number>;

interface MessageData {
  fields: { fieldName: string; fakerMethod: string }[];
  quantity: number;
  format: "json" | "csv";
  csvOptions: { includeHeader: boolean; delimiter: string };
}

function getFakerMethod(path: string): () => string | number {
  try {
    const parts = path.split(".");

    let current: unknown = faker;

    for (const part of parts) {
      if (typeof current === "object" && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        throw new Error(
          `Caminho inválido no objeto Faker: a parte "${part}" não existe.`
        );
      }
    }

    if (typeof current === "function") {
      return current as () => string | number;
    }

    throw new Error(`O caminho "${path}" não resultou em uma função.`);
  } catch (error) {
    console.error(
      `Erro ao resolver o método Faker para o caminho "${path}":`,
      error
    );
    return () => `Erro: Método inválido (${path})`;
  }
}

function convertToCSV(
  data: GeneratedRecord[],
  options: { includeHeader: boolean; delimiter: string }
): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const { includeHeader, delimiter } = options;

  const rows: string[] = [];

  if (includeHeader) {
    rows.push(headers.join(delimiter));
  }

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (
        typeof value === "string" &&
        (value.includes(delimiter) ||
          value.includes('"') ||
          value.includes("\n"))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(values.join(delimiter));
  });

  return rows.join("\n");
}

self.onmessage = (event: MessageEvent<MessageData>) => {
  const { fields, quantity, format, csvOptions } = event.data;

  if (!fields || fields.length === 0 || !quantity) {
    self.postMessage({ generatedData: "" });
    return;
  }

  const generatedRecords: GeneratedRecord[] = [];

  for (let i = 0; i < quantity; i++) {
    const record: GeneratedRecord = {};

    fields.forEach((field) => {
      const fakerFunction = getFakerMethod(field.fakerMethod);
      record[field.fieldName] = fakerFunction();
    });

    generatedRecords.push(record);
  }

  let result: string;
  if (format === "json") {
    result = JSON.stringify(generatedRecords, null, 2);
  } else {
    result = convertToCSV(generatedRecords, csvOptions);
  }

  self.postMessage({ generatedData: result });
};
