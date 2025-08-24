"use client";

import { Badge } from "@/components/ui/Badge";
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
import { Textarea } from "@/components/ui/form/Textarea";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { format, fromUnixTime } from "date-fns";
import { SignJWT, jwtVerify } from "jose";
import { JwtPayload as DecodedJwtPayload, jwtDecode } from "jwt-decode";
import _ from "lodash";
import { CheckCircle, Copy, Eraser, ShieldAlert, XCircle } from "lucide-react";
import React, { FC, useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

const toolOptions = [
  { value: "jwt", label: "JWT Encoder / Decoder" },
  { value: "base64", label: "Base64 Encoder / Decoder" },
  { value: "url", label: "URL Encoder / Decoder" },
];
type ToolKey = "base64" | "url" | "jwt";
export const defaultState = {
  selectedTool: "jwt" as ToolKey,
  base64Input: "",
  urlInput: "",
};

interface JWTToolState {
  encodedToken: string;
  headerStr: string;
  payloadStr: string;
  secret: string;
  algorithm: "HS256" | "HS384" | "HS512";
  verification: {
    status: "idle" | "verified" | "invalid";
    error: string | null;
  };
}
type JWTToolAction =
  | {
      type: "UPDATE_FIELD";
      payload: {
        field: keyof Omit<JWTToolState, "verification">;
        value: string;
      };
    }
  | { type: "SET_VERIFICATION"; payload: JWTToolState["verification"] }
  | { type: "RESET" };

const jwtInitialState: JWTToolState = {
  encodedToken: "",
  headerStr: JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2),
  payloadStr: JSON.stringify(
    { sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) },
    null,
    2
  ),
  secret: "your-super-secret-key-that-is-at-least-32-bytes-long",
  algorithm: "HS256",
  verification: { status: "idle", error: null },
};

const handleCopyToClipboard = (content: unknown) => {
  if (!content) return;
  const textToCopy =
    typeof content === "object"
      ? JSON.stringify(content, null, 2)
      : String(content);
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => toast.success("Copiado!"));
};

function jwtReducer(state: JWTToolState, action: JWTToolAction): JWTToolState {
  switch (action.type) {
    case "UPDATE_FIELD":
      if (action.payload.field === "algorithm") {
        try {
          const newHeader = {
            ...JSON.parse(state.headerStr),
            alg: action.payload.value,
          };
          return {
            ...state,
            algorithm: action.payload.value as JWTToolState["algorithm"],
            headerStr: JSON.stringify(newHeader, null, 2),
          };
        } catch {
          return {
            ...state,
            algorithm: action.payload.value as JWTToolState["algorithm"],
          };
        }
      }
      return { ...state, [action.payload.field]: action.payload.value };
    case "SET_VERIFICATION":
      return { ...state, verification: action.payload };
    case "RESET":
      return { ...jwtInitialState, secret: state.secret };
    default:
      return state;
  }
}

const JWTToolLayout: FC<{ instanceId: string }> = ({ instanceId }) => {
  const [persistedState, setPersistedState] = usePersistentAppStore(
    instanceId,
    { jwtState: jwtInitialState }
  );
  const [state, dispatch] = useReducer(jwtReducer, persistedState.jwtState);
  const {
    encodedToken,
    headerStr,
    payloadStr,
    secret,
    algorithm,
    verification,
  } = state;

  useEffect(() => {
    setPersistedState({ jwtState: state });
  }, [state]);

  useEffect(() => {
    const signToken = async () => {
      try {
        const header = JSON.parse(headerStr);
        const payload = JSON.parse(payloadStr);
        const secretKey = new TextEncoder().encode(secret);
        const newEncodedToken = await new SignJWT(payload)
          .setProtectedHeader(header)
          .sign(secretKey);
        dispatch({
          type: "UPDATE_FIELD",
          payload: { field: "encodedToken", value: newEncodedToken },
        });
      } catch {}
    };
    const debouncedSign = _.debounce(signToken, 300);
    debouncedSign();
    return () => debouncedSign.cancel();
  }, [headerStr, payloadStr, secret, algorithm]);

  useEffect(() => {
    if (!encodedToken.trim()) {
      dispatch({
        type: "SET_VERIFICATION",
        payload: { status: "idle", error: null },
      });
      return;
    }
    const verifyToken = async () => {
      try {
        const secretKey = new TextEncoder().encode(secret);
        await jwtVerify(encodedToken, secretKey);
        dispatch({
          type: "SET_VERIFICATION",
          payload: { status: "verified", error: null },
        });
      } catch (e) {
        dispatch({
          type: "SET_VERIFICATION",
          payload: { status: "invalid", error: (e as Error).message },
        });
      }
    };
    const debouncedVerify = _.debounce(verifyToken, 300);
    debouncedVerify();
    return () => debouncedVerify.cancel();
  }, [encodedToken, secret]);

  const decodedParts = useMemo(() => {
    if (!encodedToken.trim()) return { header: null, payload: null };
    try {
      const header = jwtDecode(encodedToken, { header: true });
      const payload: DecodedJwtPayload & Record<string, unknown> =
        jwtDecode(encodedToken);
      for (const key of ["iat", "exp", "nbf"]) {
        if (payload[key] && typeof payload[key] === "number") {
          payload[`${key}_iso`] = `${format(
            fromUnixTime(payload[key] as number),
            "yyyy-MM-dd HH:mm:ss"
          )} UTC`;
        }
      }
      return { header, payload };
    } catch {
      return { header: null, payload: null };
    }
  }, [encodedToken]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-grow min-h-0">
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex-grow flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="text-base text-rose-400">HEADER</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              value={headerStr}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  payload: { field: "headerStr", value: e.target.value },
                })
              }
              className="h-full w-full resize-none border-0 rounded-none font-mono text-xs bg-background"
            />
          </CardContent>
        </Card>
        <Card className="flex-grow flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="text-base text-violet-400">PAYLOAD</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              value={payloadStr}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  payload: { field: "payloadStr", value: e.target.value },
                })
              }
              className="h-full w-full resize-none border-0 rounded-none font-mono text-xs bg-background"
            />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2 flex-grow min-h-0">
          <div className="flex justify-between items-center">
            <Label>Token Codificado / Decodificado</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyToClipboard(encodedToken)}
              title="Copiar Token"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-rows-2 gap-4 flex-grow min-h-0">
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between py-2 px-4">
                <CardTitle className="text-base">
                  Header (Decodificado)
                </CardTitle>
                {decodedParts.header && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyToClipboard(decodedParts.header)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-0">
                {decodedParts.header ? (
                  <JsonView
                    value={decodedParts.header}
                    style={vscodeTheme}
                    displayDataTypes={false}
                    enableClipboard={false}
                  />
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    Aguardando...
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between py-2 px-4">
                <CardTitle className="text-base">
                  Payload (Decodificado)
                </CardTitle>
                {decodedParts.payload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyToClipboard(decodedParts.payload)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-0">
                {decodedParts.payload ? (
                  <JsonView
                    value={decodedParts.payload}
                    style={vscodeTheme}
                    displayDataTypes={false}
                    enableClipboard={false}
                  />
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    Aguardando...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Label>Chave Secreta (HMAC)</Label>
              <Input
                type="text"
                value={secret}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    payload: { field: "secret", value: e.target.value },
                  })
                }
                className="font-mono text-xs"
              />
            </div>
            <div className="w-[120px]">
              <Label>Algoritmo</Label>
              <Select
                value={algorithm}
                onValueChange={(v) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    payload: { field: "algorithm", value: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[999999999]">
                  <SelectItem value="HS256">HS256</SelectItem>
                  <SelectItem value="HS384">HS384</SelectItem>
                  <SelectItem value="HS512">HS512</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2 h-6">
            {verification.status === "verified" && (
              <Badge className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Assinatura Verificada
              </Badge>
            )}
            {verification.status === "invalid" && (
              <Badge variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Assinatura Inválida
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TextToTextLayout: FC<{
  inputValue: string;
  setInputValue: (v: string) => void;
  mode: "encode" | "decode";
  processor: (input: string, options: { mode: "encode" | "decode" }) => string;
}> = ({ inputValue, setInputValue, mode, processor }) => {
  const outputValue = useMemo(() => {
    if (!inputValue.trim()) return "";
    try {
      return processor(inputValue, { mode });
    } catch (e) {
      return (e as Error).message;
    }
  }, [inputValue, mode, processor]);

  return (
    <div className="grid md:grid-cols-2 gap-4 flex-grow min-h-0">
      <div className="flex flex-col gap-2">
        <Label>Entrada</Label>
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-full resize-none font-mono text-sm bg-background"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label>Saída</Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopyToClipboard(outputValue)}
            title="Copiar Saída"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          readOnly
          value={outputValue}
          className="h-full resize-none font-mono text-sm bg-muted/50"
        />
      </div>
    </div>
  );
};

function EncodersDecodersComponent({ instanceId }: { instanceId: string }) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const { selectedTool, base64Input, urlInput } = state;
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");
  const [urlMode, setUrlMode] = useState<"encode" | "decode">("encode");

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t">
      <div className="flex items-center gap-4 flex-wrap">
        <Label className="flex-shrink-0">Ferramenta:</Label>
        <Select
          value={selectedTool}
          onValueChange={(value) =>
            setState({ selectedTool: value as ToolKey })
          }
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[999999999]">
            {toolOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-grow" />
        <Button
          onClick={() => setState({ [`${selectedTool}Input`]: "" })}
          variant="ghost"
          size="sm"
        >
          <Eraser className="mr-2 h-4 w-4" /> Limpar
        </Button>
      </div>

      {selectedTool === "jwt" && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
          <span>
            Ferramenta de depuração. Nunca use chaves secretas de produção.
          </span>
        </div>
      )}
      {selectedTool === "base64" && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={base64Mode === "encode" ? "default" : "outline"}
            onClick={() => setBase64Mode("encode")}
          >
            Texto → Base64
          </Button>
          <Button
            variant={base64Mode === "decode" ? "default" : "outline"}
            onClick={() => setBase64Mode("decode")}
          >
            Base64 → Texto
          </Button>
        </div>
      )}
      {selectedTool === "url" && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={urlMode === "encode" ? "default" : "outline"}
            onClick={() => setUrlMode("encode")}
          >
            Encode URL
          </Button>
          <Button
            variant={urlMode === "decode" ? "default" : "outline"}
            onClick={() => setUrlMode("decode")}
          >
            Decode URL
          </Button>
        </div>
      )}

      {selectedTool === "base64" && (
        <TextToTextLayout
          inputValue={base64Input}
          setInputValue={(v) => setState({ base64Input: v })}
          mode={base64Mode}
          processor={(input, options) => {
            if (options.mode === "encode")
              return btoa(unescape(encodeURIComponent(input)));
            return decodeURIComponent(escape(atob(input)));
          }}
        />
      )}
      {selectedTool === "url" && (
        <TextToTextLayout
          inputValue={urlInput}
          setInputValue={(v) => setState({ urlInput: v })}
          mode={urlMode}
          processor={(input, options) => {
            if (options.mode === "encode") return encodeURIComponent(input);
            return decodeURIComponent(input);
          }}
        />
      )}
      {selectedTool === "jwt" && <JWTToolLayout instanceId={instanceId} />}
    </div>
  );
}

const MemoizedEncodersDecoders = React.memo(EncodersDecodersComponent);
export function EncodersDecoders({ instanceId }: { instanceId: string }) {
  return <MemoizedEncodersDecoders instanceId={instanceId} />;
}
