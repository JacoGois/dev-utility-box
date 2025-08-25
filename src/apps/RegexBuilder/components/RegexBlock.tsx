"use client";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SET_SELECTED_COMPONENT", payload: { id: component.id } });
  };

  if (component.type === "group") {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 border-2 border-dashed rounded-lg p-2 m-1 min-h-[40px] cursor-pointer",
          isSelected
            ? "border-primary bg-primary/10"
            : "border-muted hover:border-muted-foreground"
        )}
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
          <span className="text-xs text-muted-foreground">Grupo Vazio</span>
        )}
      </div>
    );
  }

  return (
    <Badge
      onClick={handleClick}
      variant={isSelected ? "default" : "secondary"}
      className="text-base p-2 cursor-pointer"
    >
      {component.label}
    </Badge>
  );
}
