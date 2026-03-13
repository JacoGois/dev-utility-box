export type QuantifierType = "none" | "+" | "*" | "?" | "exact" | "range";

export interface RegexComponent {
  id: string;
  parentId: string | null;
  type: "literal" | "char_class" | "anchor" | "group" | "or_operator";
  token: string;
  label: string;
  children?: RegexComponent[];
  quantifier: {
    type: QuantifierType;
    value: number;
    min: number;
    max: number;
  };
}

export interface RegexBuilderState {
  componentsTree: RegexComponent[];
  selectedComponentId: string | null;
  testString: string;
  flags: {
    g: boolean;
    i: boolean;
    m: boolean;
  };
}

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
  | {
      type: "MOVE_COMPONENT";
      payload: { activeId: string; overId: string | null };
    }
  | { type: "RESET" };

export interface Match {
  fullMatch: string;
  index: number;
  groups: string[];
}

export interface RegexFlags {
  g: boolean;
  i: boolean;
  m: boolean;
}
