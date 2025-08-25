"use client";

import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { faker } from "@faker-js/faker";
import React, { useEffect, useMemo, useReducer } from "react";
import { BuilderCanvas } from "./components/BuilderCanvas";
import { LivePreview } from "./components/LivePreview";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { TestRunner } from "./components/TestRunner";
import { Toolbox } from "./components/Toolbox";
import {
  QuantifierType,
  RegexBuilderAction,
  RegexBuilderState,
  RegexComponent,
} from "./types";

const initialState: RegexBuilderState = {
  componentsTree: [],
  selectedComponentId: null,
  testString: "O CPF é 123.456.789-00 e o CNPJ é 12.345.678/0001-99.",
  flags: { g: true, i: true, m: false },
};

// --- Funções Auxiliares para Manipular a Árvore de Componentes ---
const findComponentInTree = (
  tree: RegexComponent[],
  id: string
): RegexComponent | null => {
  for (const component of tree) {
    if (component.id === id) return component;
    if (component.children) {
      const found = findComponentInTree(component.children, id);
      if (found) return found;
    }
  }
  return null;
};

const removeComponentFromTree = (
  tree: RegexComponent[],
  id: string
): RegexComponent[] => {
  const newTree = tree.filter((component) => component.id !== id);
  return newTree.map((component) => {
    if (component.children) {
      return {
        ...component,
        children: removeComponentFromTree(component.children, id),
      };
    }
    return component;
  });
};

const updateComponentInTree = (
  tree: RegexComponent[],
  id: string,
  updates: Partial<Omit<RegexComponent, "id">>
): RegexComponent[] => {
  return tree.map((component) => {
    if (component.id === id) {
      return { ...component, ...updates };
    }
    if (component.children) {
      return {
        ...component,
        children: updateComponentInTree(component.children, id, updates),
      };
    }
    return component;
  });
};

function regexReducer(
  state: RegexBuilderState,
  action: RegexBuilderAction
): RegexBuilderState {
  switch (action.type) {
    case "ADD_COMPONENT":
      const newComponent: RegexComponent = {
        ...action.payload.component,
        id: faker.string.uuid(),
        parentId: action.payload.targetId || null,
        quantifier: { type: "none", value: 1, min: 1, max: 1 },
      };
      // MUDANÇA: Usando 'componentsTree'
      return {
        ...state,
        componentsTree: [...state.componentsTree, newComponent],
      };

    case "REMOVE_COMPONENT":
      return {
        ...state,
        // MUDANÇA: Usando 'componentsTree'
        componentsTree: removeComponentFromTree(
          state.componentsTree,
          action.payload.id
        ),
        selectedComponentId: null,
      };

    case "UPDATE_COMPONENT_QUANTIFIER":
      const updates = { quantifier: action.payload.quantifier };
      // MUDANÇA: Usando 'componentsTree'
      return {
        ...state,
        componentsTree: updateComponentInTree(
          state.componentsTree,
          action.payload.id,
          updates
        ),
      };

    case "SET_SELECTED_COMPONENT":
      return { ...state, selectedComponentId: action.payload.id };

    case "UPDATE_TEST_STRING":
      return { ...state, testString: action.payload };

    case "TOGGLE_FLAG":
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.payload]: !state.flags[action.payload],
        },
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

function RegexBuilderComponent({ instanceId }: { instanceId: string }) {
  const [persistedState, setPersistedState] = usePersistentAppStore(
    instanceId,
    initialState
  );
  const [state, dispatch] = useReducer(regexReducer, persistedState);

  useEffect(() => {
    setPersistedState(state);
  }, [state]);

  const selectedComponent = useMemo(() => {
    // MUDANÇA: Usando 'componentsTree'
    return state.selectedComponentId
      ? findComponentInTree(state.componentsTree, state.selectedComponentId)
      : null;
  }, [state.componentsTree, state.selectedComponentId]);

  const componentToRegexString = (component: RegexComponent): string => {
    const quantifierMap: Record<
      QuantifierType,
      (q: RegexComponent["quantifier"]) => string
    > = {
      none: () => "",
      "+": () => "+",
      "*": () => "*",
      "?": () => "?",
      exact: (q) => `{${q.value}}`,
      range: (q) => `{${q.min},${q.max}}`,
    };
    const quantifier = quantifierMap[component.quantifier.type](
      component.quantifier
    );

    if (component.type === "group") {
      const childrenString =
        component.children?.map(componentToRegexString).join("") || "";
      return `(${childrenString})${quantifier}`;
    }
    return component.token + quantifier;
  };

  const generatedPattern = useMemo(() => {
    // MUDANÇA: Usando 'componentsTree'
    return state.componentsTree.map(componentToRegexString).join("");
  }, [state.componentsTree]);

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t @container">
      <div className="grid grid-cols-1 @[1024px]:grid-cols-4 gap-4">
        <div className="@[1024px]:col-span-1 flex flex-col gap-4">
          <Toolbox dispatch={dispatch} />
          <PropertiesPanel
            selectedComponent={selectedComponent}
            dispatch={dispatch}
          />
        </div>
        <div className="@[1024px]:col-span-3 flex flex-col gap-4">
          {/* MUDANÇA: Passando 'componentsTree' para a prop 'components' */}
          <BuilderCanvas
            components={state.componentsTree}
            selectedComponentId={state.selectedComponentId}
            dispatch={dispatch}
          />
          <LivePreview state={state} />
        </div>
      </div>
      <div className="flex-grow min-h-0">
        <TestRunner
          testString={state.testString}
          pattern={generatedPattern}
          flags={state.flags}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}

const MemoizedRegexBuilder = React.memo(RegexBuilderComponent);
export { MemoizedRegexBuilder as RegexBuilder };
