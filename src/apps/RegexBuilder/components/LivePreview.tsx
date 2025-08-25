"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import { useMemo } from "react";
import { QuantifierType, RegexBuilderState, RegexComponent } from "../types";

function componentToRegexString(component: RegexComponent): string {
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
}

export function LivePreview({ state }: { state: RegexBuilderState }) {
  const generatedPattern = useMemo(() => {
    return state.componentsTree.map(componentToRegexString).join("");
  }, [state.componentsTree]);

  const fullRegex = useMemo(() => {
    const flags = Object.keys(state.flags)
      .filter((f) => state.flags[f as keyof typeof state.flags])
      .join("");
    return `/${generatedPattern}/${flags}`;
  }, [generatedPattern, state.flags]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preview da Regex</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Regex Gerada</Label>
        <Input readOnly value={fullRegex} className="font-mono mt-1" />
      </CardContent>
    </Card>
  );
}
