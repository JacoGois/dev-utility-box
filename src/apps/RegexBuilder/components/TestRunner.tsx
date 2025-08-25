"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Label } from "@/components/ui/form/Label";
import { Textarea } from "@/components/ui/form/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import React, { useMemo } from "react";
import { Match, RegexBuilderAction, RegexFlags } from "../types";

interface TestRunnerProps {
  testString: string;
  pattern: string;
  flags: RegexFlags;
  dispatch: React.Dispatch<RegexBuilderAction>;
}

export function TestRunner({
  testString,
  pattern,
  flags,
  dispatch,
}: TestRunnerProps) {
  const { matches, error, highlightedText } = useMemo(() => {
    // Se o padrão estiver vazio, não há nada para testar.
    if (!pattern?.trim()) {
      return { matches: [], error: null, highlightedText: testString };
    }
    try {
      const flagStr = Object.keys(flags)
        .filter((key) => flags[key as keyof typeof flags])
        .join("");
      const regex = new RegExp(pattern, flagStr);

      const allMatchesRaw = Array.from(testString.matchAll(regex));

      if (allMatchesRaw.length === 0) {
        return { matches: [], error: null, highlightedText: testString };
      }

      const allMatches: Match[] = allMatchesRaw.map((rawMatch) => ({
        fullMatch: rawMatch[0],
        index: rawMatch.index || 0,
        groups: rawMatch.slice(1).filter((g) => g !== undefined),
      }));

      // A lógica para criar o texto com destaques
      const parts: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      allMatches.forEach((match, i) => {
        if (match.index > lastIndex) {
          parts.push(testString.substring(lastIndex, match.index));
        }
        parts.push(
          <mark
            key={`match-${i}`}
            className="bg-primary/20 text-primary-foreground rounded"
          >
            {match.fullMatch}
          </mark>
        );
        lastIndex = match.index + match.fullMatch.length;
      });
      if (lastIndex < testString.length) {
        parts.push(testString.substring(lastIndex));
      }

      return {
        matches: allMatches,
        error: null,
        highlightedText: <>{parts}</>,
      };
    } catch (e) {
      return {
        matches: [],
        error: (e as Error).message,
        highlightedText: testString,
      };
    }
  }, [pattern, testString, flags]);

  return (
    <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4 flex-grow min-h-0">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label htmlFor="test-string">Texto de Teste</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-g"
                checked={flags.g}
                onCheckedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", payload: "g" })
                }
              />
              <Label
                htmlFor="flag-g"
                className="font-mono text-xs cursor-pointer"
              >
                Global (g)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-i"
                checked={flags.i}
                onCheckedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", payload: "i" })
                }
              />
              <Label
                htmlFor="flag-i"
                className="font-mono text-xs cursor-pointer"
              >
                Ignorar Caso (i)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-m"
                checked={flags.m}
                onCheckedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", payload: "m" })
                }
              />
              <Label
                htmlFor="flag-m"
                className="font-mono text-xs cursor-pointer"
              >
                Multilinha (m)
              </Label>
            </div>
          </div>
        </div>
        <div className="relative w-full h-full border rounded-lg bg-background">
          <div
            aria-hidden="true"
            className="absolute inset-0 p-2 font-mono text-sm whitespace-pre-wrap pointer-events-none leading-relaxed"
          >
            {highlightedText}
          </div>
          <Textarea
            id="test-string"
            value={testString}
            onChange={(e) =>
              dispatch({ type: "UPDATE_TEST_STRING", payload: e.target.value })
            }
            placeholder="Cole ou digite seu texto aqui..."
            className="relative w-full h-full resize-none font-mono text-sm bg-transparent text-transparent caret-white leading-relaxed"
          />
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1 font-mono">
            Erro na Expressão: {error}
          </p>
        )}
      </div>
      <div className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Resultados ({matches.length} correspondência
              {matches.length !== 1 && "s"})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="p-6 pt-0">
                {matches.length === 0 && !error ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma correspondência encontrada.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {matches.map((match, index) => (
                      <li
                        key={index}
                        className="border-b pb-4 last:border-0 last:pb-0"
                      >
                        <p className="font-mono text-sm font-semibold break-all">
                          <Badge variant="secondary" className="mr-2">
                            Match {index + 1}
                          </Badge>
                          {match.fullMatch || "(Vazio)"}
                        </p>
                        {match.groups.length > 0 && (
                          <ul className="mt-2 space-y-1 pl-4">
                            {match.groups.map((group, gIndex) => (
                              <li
                                key={gIndex}
                                className="text-xs font-mono text-muted-foreground break-all"
                              >
                                <Badge variant="outline" className="mr-2">
                                  Grupo {gIndex + 1}
                                </Badge>
                                {group}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
