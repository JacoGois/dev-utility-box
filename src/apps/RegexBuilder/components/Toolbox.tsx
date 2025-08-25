"use client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDraggable } from "@dnd-kit/core";
import { RegexBuilderAction, RegexComponent } from "../types";

const blockPrototypes: (Omit<
  RegexComponent,
  "id" | "quantifier" | "parentId"
> & { prompt?: string })[] = [
  {
    label: "Texto...",
    token: "",
    type: "literal",
    prompt: "Digite o texto a ser encontrado:",
  },
  { label: "Dígito (\\d)", token: "\\d", type: "char_class" },
  { label: "Letra (A-Z)", token: "[a-zA-Z]", type: "char_class" },
  { label: "Letra ou Dígito (\\w)", token: "\\w", type: "char_class" },
  { label: "Espaço (\\s)", token: "\\s", type: "char_class" },
  { label: "Grupo ()", token: "", type: "group", children: [] },
  { label: "Operador OU |", token: "|", type: "or_operator" },
  { label: "Início da Linha (^)", token: "^", type: "anchor" },
  { label: "Fim da Linha ($)", token: "$", type: "anchor" },
];

function DraggableToolboxItem({
  block,
  dispatch, // MUDANÇA: Recebemos o dispatch aqui
}: {
  block: (typeof blockPrototypes)[0];
  dispatch: React.Dispatch<RegexBuilderAction>; // E tipamos ele
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${block.label}`,
    data: { prototype: block },
  });

  const handleAdd = () => {
    if (block.type === "literal" && block.prompt) {
      const value = prompt(block.prompt);
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
            targetId: null,
          },
        });
      }
    } else {
      dispatch({
        type: "ADD_COMPONENT",
        payload: { component: block, targetId: null },
      });
    }
  };

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="secondary"
      className="cursor-grab"
      // MUDANÇA: O clique também adiciona o bloco (melhora acessibilidade)
      onClick={handleAdd}
    >
      {block.label}
    </Button>
  );
}

// MUDANÇA: O componente Toolbox agora aceita e passa a prop 'dispatch'
export function Toolbox({
  dispatch,
}: {
  dispatch: React.Dispatch<RegexBuilderAction>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paleta de Ferramentas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {blockPrototypes.map((block) => (
          <DraggableToolboxItem
            key={block.label}
            block={block}
            dispatch={dispatch}
          />
        ))}
      </CardContent>
    </Card>
  );
}
