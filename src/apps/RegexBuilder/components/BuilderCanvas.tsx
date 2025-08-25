"use client";
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
  const handleCanvasClick = () => {
    dispatch({ type: "SET_SELECTED_COMPONENT", payload: { id: null } });
  };

  return (
    <div
      className="p-4 border rounded-lg bg-background flex-grow"
      onClick={handleCanvasClick}
    >
      <h3 className="text-lg font-semibold mb-4">Construtor Visual</h3>
      <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg min-h-[80px]">
        {components.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Adicione ferramentas da paleta para começar.
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
    </div>
  );
}
