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

const findItemRecursive = (
  items: RegexComponent[],
  id: string
): RegexComponent | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemRecursive(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const removeItemRecursive = (
  items: RegexComponent[],
  id: string
): RegexComponent[] => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children) {
        return { ...item, children: removeItemRecursive(item.children, id) };
      }
      return item;
    });
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

const insertItemRecursive = (
  items: RegexComponent[],
  newItem: RegexComponent,
  targetId: string | null
): RegexComponent[] => {
  if (!targetId) return [...items, newItem];
  let inserted = false;
  const result = items.map((item) => {
    if (item.id === targetId && item.type === "group") {
      inserted = true;
      return { ...item, children: [...(item.children || []), newItem] };
    }
    if (item.children) {
      const newChildren = insertItemRecursive(item.children, newItem, targetId);
      if (newChildren !== item.children) inserted = true;
      return { ...item, children: newChildren };
    }
    return item;
  });
  return inserted ? result : [...items, newItem];
};

function regexReducer(
  state: RegexBuilderState,
  action: RegexBuilderAction
): RegexBuilderState {
  switch (action.type) {
    case "ADD_COMPONENT": {
      const newComponent: RegexComponent = {
        ...action.payload.component,
        id: faker.string.uuid(),
        parentId: action.payload.targetId || null,
        quantifier: { type: "none", value: 1, min: 1, max: 1 },
      };
      return {
        ...state,
        componentsTree: insertItemRecursive(
          state.componentsTree,
          newComponent,
          action.payload.targetId || null
        ),
        selectedComponentId: newComponent.id,
      };
    }
    case "MOVE_COMPONENT": {
      const { activeId, overId } = action.payload;
      const activeItem = findItemRecursive(state.componentsTree, activeId);
      if (!activeItem) return state;

      const treeWithoutActive = removeItemRecursive(
        state.componentsTree,
        activeId
      );
      const newTree = insertItemRecursive(
        treeWithoutActive,
        activeItem,
        overId
      );

      return { ...state, componentsTree: newTree };
    }

    case "REMOVE_COMPONENT":
      return {
        ...state,
        componentsTree: removeComponentFromTree(
          state.componentsTree,
          action.payload.id
        ),
        selectedComponentId: null,
      };

    case "UPDATE_COMPONENT_QUANTIFIER":
      return {
        ...state,
        componentsTree: updateComponentInTree(
          state.componentsTree,
          action.payload.id,
          { quantifier: action.payload.quantifier }
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
  if (component.type === "or_operator") {
    return `|`;
  }
  return component.token + quantifier;
};

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
    return state.selectedComponentId
      ? findItemRecursive(state.componentsTree, state.selectedComponentId)
      : null;
  }, [state.componentsTree, state.selectedComponentId]);

  const generatedPattern = useMemo(() => {
    return state.componentsTree.map(componentToRegexString).join("");
  }, [state.componentsTree]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        state.selectedComponentId &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA")
        ) {
          return;
        }
        event.preventDefault();
        dispatch({
          type: "REMOVE_COMPONENT",
          payload: { id: state.selectedComponentId },
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.selectedComponentId]);

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
