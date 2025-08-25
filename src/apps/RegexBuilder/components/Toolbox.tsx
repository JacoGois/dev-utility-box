"use client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RegexBuilderAction, RegexComponent } from "../types";

const blockPrototypes: Omit<
  RegexComponent,
  "id" | "quantifier" | "parentId"
>[] = [
  { label: "Texto...", token: "", type: "literal" },
  { label: "Dígito (\\d)", token: "\\d", type: "char_class" },
  { label: "Letra (A-Z)", token: "[a-zA-Z]", type: "char_class" },
  { label: "Letra ou Dígito (\\w)", token: "\\w", type: "char_class" },
  { label: "Espaço (\\s)", token: "\\s", type: "char_class" },
  { label: "Grupo ()", token: "", type: "group", children: [] },
  { label: "Operador OU |", token: "|", type: "or_operator" },
  { label: "Início da Linha (^)", token: "^", type: "anchor" },
  { label: "Fim da Linha ($)", token: "$", type: "anchor" },
];

export function Toolbox({
  dispatch,
}: {
  dispatch: React.Dispatch<RegexBuilderAction>;
}) {
  const handleAdd = (
    block: Omit<RegexComponent, "id" | "quantifier" | "parentId">
  ) => {
    if (block.type === "literal") {
      const value = prompt("Digite o texto a ser encontrado:");
      if (value) {
        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        dispatch({
          type: "ADD_COMPONENT",
          payload: {
            component: {
              ...block,
              label: `Texto: "${value}"`,
              token: escapedValue,
            },
          },
        });
      }
    } else {
      dispatch({ type: "ADD_COMPONENT", payload: { component: block } });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paleta de Ferramentas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {blockPrototypes.map((block) => (
          <Button
            key={block.label}
            variant="secondary"
            onClick={() => handleAdd(block)}
          >
            {block.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
