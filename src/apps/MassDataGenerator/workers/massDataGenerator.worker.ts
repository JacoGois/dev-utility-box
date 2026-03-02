import { faker } from "@faker-js/faker";
import * as fakerBr from "faker-br";
type GeneratedRecord = Record<string, string | number>;

interface MessageData {
  fields: { fieldName: string; fakerMethod: string }[];
  quantity: number;
  format: "json" | "csv";
  csvOptions: { includeHeader: boolean; delimiter: string };
}

function getFakerMethod(path: string): () => string | number {
  try {
    if (path.startsWith("br.")) {
      const methodName = path.split(".");
      return fakerBr[methodName[0]][methodName[1]];
    }

    const parts = path.split(".");

    let current: unknown = faker;

    for (const part of parts) {
      if (typeof current === "object" && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        throw new Error(
          `Invalid path in Faker object: part "${part}" does not exist.`
        );
      }
    }

    if (typeof current === "function") {
      return current as () => string | number;
    }

    throw new Error(`Path "${path}" did not result in a function.`);
  } catch (error) {
    console.error(`Error resolving Faker method for path "${path}":`, error);
    return () => `Error: Invalid method (${path})`;
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
  let generationError: string | undefined;

  for (let i = 0; i < quantity; i++) {
    const record: GeneratedRecord = {};

    fields.forEach((field) => {
      const fakerFunction = getFakerMethod(field.fakerMethod);
      const value = fakerFunction();
      record[field.fieldName] = value;
      if (
        typeof value === "string" &&
        value.startsWith("Error: Invalid method (")
      ) {
        generationError = value;
      }
    });

    generatedRecords.push(record);
  }

  let result: string;
  if (format === "json") {
    result = JSON.stringify(generatedRecords, null, 2);
  } else {
    result = convertToCSV(generatedRecords, csvOptions);
  }

  self.postMessage({
    generatedData: result,
    ...(generationError && { error: generationError }),
  });
};
