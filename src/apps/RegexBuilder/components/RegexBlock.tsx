"use client";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RegexBuilderAction, RegexComponent } from "../types";

interface RegexBlockProps {
  component: RegexComponent;
  selectedId: string | null;
  dispatch: React.Dispatch<RegexBuilderAction>;
}

export function RegexBlock({
  component,
  selectedId,
  dispatch,
}: RegexBlockProps) {
  const isSelected = component.id === selectedId;

  const { attributes, listeners, setNodeRef, transform, transition, isOver } =
    useSortable({ id: component.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SET_SELECTED_COMPONENT", payload: { id: component.id } });
  };

  if (component.type === "group") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className="min-w-fit"
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center gap-1 border-2 border-dashed rounded-lg p-2 m-1 min-h-[50px] cursor-grab active:cursor-grabbing transition-colors",
            isSelected
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-muted-foreground",
            isOver ? "bg-primary/20" : ""
          )}
        >
          {/* MUDANÇA: Contexto de ordenação aninhado para os filhos do grupo */}
          <SortableContext
            items={component.children?.map((c) => c.id) || []}
            strategy={horizontalListSortingStrategy}
          >
            {component.children?.map((child) => (
              <RegexBlock
                key={child.id}
                component={child}
                selectedId={selectedId}
                dispatch={dispatch}
              />
            ))}
            {component.children?.length === 0 && (
              <span className="text-xs text-muted-foreground px-2">
                Solte blocos aqui
              </span>
            )}
          </SortableContext>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Badge
        onClick={handleClick}
        variant={isSelected ? "default" : "secondary"}
        className="text-base p-2 cursor-grab active:cursor-grabbing"
      >
        {component.label}
      </Badge>
    </div>
  );
}
