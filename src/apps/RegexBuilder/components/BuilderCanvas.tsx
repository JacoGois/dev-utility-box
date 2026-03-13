"use client";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RegexBuilderAction, RegexComponent } from "../types";
import { RegexBlock } from "./RegexBlock";

interface BuilderCanvasProps {
  components: RegexComponent[];
  selectedComponentId: string | null;
  dispatch: React.Dispatch<RegexBuilderAction>;
}

export function BuilderCanvas({
  components,
  selectedComponentId,
  dispatch,
}: BuilderCanvasProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;

    if (activeId.startsWith("toolbox-")) {
      const prototype = active.data.current?.prototype;
      if (prototype) {
        const targetId =
          over?.data.current?.sortable.containerId ||
          (over?.id as string | null);
        dispatch({
          type: "ADD_COMPONENT",
          payload: {
            component: prototype,
            targetId: targetId === "root" ? null : targetId,
          },
        });
      }
      return;
    }

    if (over && active.id !== over.id) {
      dispatch({
        type: "MOVE_COMPONENT",
        payload: { activeId: active.id as string, overId: over.id as string },
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="p-4 border rounded-lg bg-background flex-grow">
        <h3 className="text-lg font-semibold mb-4">
          Sua Expressão Visual (Arraste e Solte)
        </h3>
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg min-h-[80px]">
            {components.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Arraste ferramentas da paleta para começar.
              </p>
            )}
            {components.map((component) => (
              <RegexBlock
                key={component.id}
                component={component}
                selectedId={selectedComponentId}
                dispatch={dispatch}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
}
