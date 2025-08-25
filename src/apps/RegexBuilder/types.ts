// Define os tipos de quantificadores que um bloco pode ter
export type QuantifierType = "none" | "+" | "*" | "?" | "exact" | "range";

// Estrutura de um único componente (bloco ou grupo) na nossa árvore de Regex
export interface RegexComponent {
  id: string;
  parentId: string | null; // ID do grupo pai, para aninhamento
  type: "literal" | "char_class" | "anchor" | "group" | "or_operator";
  token: string; // O token da regex (ex: "\\d", "abc", "|")
  label: string; // O que o usuário vê (ex: "Dígito")
  // Apenas grupos podem ter filhos
  children?: RegexComponent[];
  quantifier: {
    type: QuantifierType;
    value: number;
    min: number;
    max: number;
  };
}

// O estado completo do nosso aplicativo
export interface RegexBuilderState {
  // A árvore de componentes da Regex
  componentsTree: RegexComponent[];
  selectedComponentId: string | null;
  testString: string;
  flags: {
    g: boolean; // Global
    i: boolean; // Case-insensitive
    m: boolean; // Multiline
  };
}

// As ações que podemos despachar para modificar o estado
export type RegexBuilderAction =
  | {
      type: "ADD_COMPONENT";
      payload: {
        component: Omit<RegexComponent, "id" | "quantifier" | "parentId">;
        targetId?: string | null;
      };
    }
  | { type: "REMOVE_COMPONENT"; payload: { id: string } }
  | {
      type: "UPDATE_COMPONENT_QUANTIFIER";
      payload: { id: string; quantifier: RegexComponent["quantifier"] };
    }
  | { type: "SET_SELECTED_COMPONENT"; payload: { id: string | null } }
  | { type: "UPDATE_TEST_STRING"; payload: string }
  | { type: "TOGGLE_FLAG"; payload: keyof RegexBuilderState["flags"] }
  | { type: "RESET" };

// Tipo para um resultado de match encontrado
export interface Match {
  fullMatch: string;
  index: number;
  groups: string[];
}

export interface RegexFlags {
  g: boolean; // Global
  i: boolean; // Case-insensitive
  m: boolean; // Multiline
}
