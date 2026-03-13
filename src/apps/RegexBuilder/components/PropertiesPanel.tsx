"use client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/SelectCore";
import { Trash2 } from "lucide-react";
import { QuantifierType, RegexBuilderAction, RegexComponent } from "../types";

interface PropertiesPanelProps {
  selectedComponent: RegexComponent | null;
  dispatch: React.Dispatch<RegexBuilderAction>;
}

export function PropertiesPanel({
  selectedComponent,
  dispatch,
}: PropertiesPanelProps) {
  if (!selectedComponent) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Propriedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecione um bloco no construtor para ver e editar suas
            propriedades.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { id, quantifier } = selectedComponent;

  const handleQuantifierTypeChange = (type: QuantifierType) => {
    dispatch({
      type: "UPDATE_COMPONENT_QUANTIFIER",
      payload: { id, quantifier: { ...quantifier, type } },
    });
  };
  const handleQuantifierValueChange = (
    key: "value" | "min" | "max",
    value: string
  ) => {
    const numValue = Math.max(0, Number(value) || 0);
    dispatch({
      type: "UPDATE_COMPONENT_QUANTIFIER",
      payload: { id, quantifier: { ...quantifier, [key]: numValue } },
    });
  };

  const handleRemove = () => {
    dispatch({ type: "REMOVE_COMPONENT", payload: { id } });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">
          Propriedades de: {selectedComponent.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Repetição (Quantificador)</Label>
          <Select
            value={quantifier.type}
            onValueChange={(v) =>
              handleQuantifierTypeChange(v as QuantifierType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[999999999]">
              <SelectItem value="none">Nenhuma (Exatamente uma vez)</SelectItem>
              <SelectItem value="+">Uma ou Mais Vezes (+)</SelectItem>
              <SelectItem value="*">Zero ou Mais Vezes (*)</SelectItem>
              <SelectItem value="?">Opcional (0 ou 1) (?)</SelectItem>
              <SelectItem value="exact">Exatamente...</SelectItem>
              <SelectItem value="range">Intervalo...</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {quantifier.type === "exact" && (
          <div>
            <Label>Número Exato</Label>
            <Input
              type="number"
              value={quantifier.value}
              onChange={(e) =>
                handleQuantifierValueChange("value", e.target.value)
              }
              min={0}
            />
          </div>
        )}
        {quantifier.type === "range" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Mínimo</Label>
              <Input
                type="number"
                value={quantifier.min}
                onChange={(e) =>
                  handleQuantifierValueChange("min", e.target.value)
                }
                min={0}
              />
            </div>
            <div>
              <Label>Máximo</Label>
              <Input
                type="number"
                value={quantifier.max}
                onChange={(e) =>
                  handleQuantifierValueChange("max", e.target.value)
                }
                min={0}
              />
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleRemove}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover Bloco
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
