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
import { useAppTranslations } from "@/hooks/useTranslations";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { format, fromUnixTime } from "date-fns";
import { SignJWT, jwtVerify } from "jose";
import { JwtPayload as DecodedJwtPayload, jwtDecode } from "jwt-decode";
import _ from "lodash";
import { CheckCircle, Copy, Eraser, ShieldAlert, XCircle } from "lucide-react";
import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

const createToolOptions = (t: (key: string) => string) => [
  { value: "jwt", label: t("tools.jwt") },
  { value: "base64", label: t("tools.base64") },
  { value: "url", label: t("tools.url") },
];
type ToolKey = "base64" | "url" | "jwt";

export const defaultState = {
  selectedTool: "jwt" as ToolKey,
  base64Input: "",
  urlInput: "",
};

interface JWTToolState {
  headerStr: string;
  payloadStr: string;
  secret: string;
  algorithm: "HS256" | "HS384" | "HS512";
  generatedToken: string;

  tokenToDecode: string;
  verification: {
    status: "idle" | "verified" | "invalid";
    error: string | null;
  };
}

type JWTToolAction =
  | {
      type: "UPDATE_FIELD";
      payload: {
        field: keyof JWTToolState;
        value: string | JWTToolState["verification"];
      };
    }
  | { type: "RESET" };

const jwtInitialState: JWTToolState = {
  headerStr: JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2),
  payloadStr: JSON.stringify(
    { sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) },
    null,
    2
  ),
  secret: "your-super-secret-key-that-is-at-least-32-bytes-long",
  algorithm: "HS256",
  generatedToken: "",
  tokenToDecode: "",
  verification: { status: "idle", error: null },
};

const handleCopyToClipboard = (
  content: unknown,
  t: (key: string) => string
) => {
  if (!content) return;
  const textToCopy =
    typeof content === "object"
      ? JSON.stringify(content, null, 2)
      : String(content);
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => toast.success(t("messages.copied")));
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
    case "RESET":
      return {
        ...jwtInitialState,
        secret: state.secret,
        tokenToDecode: state.tokenToDecode,
      };
    default:
      return state;
  }
}

const JWTToolLayout = forwardRef<
  { reset: () => void },
  { instanceId: string; t: (key: string) => string }
>(({ instanceId, t }, ref) => {
  const [persistedState, setPersistedState] = usePersistentAppStore(
    instanceId,
    { jwtState: jwtInitialState }
  );
  const [state, dispatch] = useReducer(jwtReducer, persistedState.jwtState);
  const {
    headerStr,
    payloadStr,
    secret,
    algorithm,
    generatedToken,
    tokenToDecode,
    verification,
  } = state;

  useImperativeHandle(ref, () => ({
    reset: () => {
      dispatch({ type: "RESET" });
      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          field: "tokenToDecode",
          value: "",
        },
      });
    },
  }));

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
          payload: { field: "generatedToken", value: newEncodedToken },
        });
      } catch {
        dispatch({
          type: "UPDATE_FIELD",
          payload: {
            field: "generatedToken",
            value: t("messages.jsonError"),
          },
        });
      }
    };
    const debouncedSign = _.debounce(signToken, 300);
    debouncedSign();
    return () => debouncedSign.cancel();
  }, [headerStr, payloadStr, secret, algorithm]);

  const decodedParts = useMemo(() => {
    if (!tokenToDecode.trim()) {
      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          field: "verification",
          value: { status: "idle", error: null },
        },
      });
      return { header: null, payload: null, error: null };
    }

    const verify = async () => {
      try {
        const secretKey = new TextEncoder().encode(secret);
        await jwtVerify(tokenToDecode, secretKey);
        dispatch({
          type: "UPDATE_FIELD",
          payload: {
            field: "verification",
            value: { status: "verified", error: null },
          },
        });
      } catch (e) {
        dispatch({
          type: "UPDATE_FIELD",
          payload: {
            field: "verification",
            value: { status: "invalid", error: (e as Error).message },
          },
        });
      }
    };
    verify();

    try {
      const header = jwtDecode(tokenToDecode, { header: true });
      const payload: DecodedJwtPayload & Record<string, unknown> =
        jwtDecode(tokenToDecode);
      for (const key of ["iat", "exp", "nbf"]) {
        if (payload[key] && typeof payload[key] === "number") {
          payload[`${key}_iso`] = `${format(
            fromUnixTime(payload[key] as number),
            "yyyy-MM-dd HH:mm:ss"
          )} UTC`;
        }
      }
      return { header, payload, error: null };
    } catch (e) {
      return { header: null, payload: null, error: (e as Error).message };
    }
  }, [tokenToDecode, secret]);

  return (
    <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4 flex-grow min-h-0 h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        <Card className="flex-grow flex flex-col min-h-0 py-0 gap-0">
          <CardHeader className="pt-3 pb-2">
            <CardTitle className="text-base text-rose-400">
              {t("labels.headerEditable")}
            </CardTitle>
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
              className="h-full w-full resize-none border-0 rounded-xl font-mono text-xs bg-background"
            />
          </CardContent>
        </Card>
        <Card className="flex-grow flex flex-col min-h-0 py-0 gap-0">
          <CardHeader className="pt-3 pb-2">
            <CardTitle className="text-base text-violet-400">
              {t("labels.payloadEditable")}
            </CardTitle>
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
              className="h-full w-full resize-none border-0 rounded-xl font-mono text-xs bg-background"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 flex-grow min-h-0">
          <div className="flex justify-between items-center">
            <Label>{t("labels.generatedToken")}</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyToClipboard(generatedToken, t)}
              title={t("buttons.copyToken")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            readOnly
            value={generatedToken}
            className="h-full resize-none font-mono text-xs bg-muted/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Label>{t("labels.secretKey")}</Label>
              <Input
                type="text"
                value={secret}
                placeholder={t("placeholders.secretKey")}
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
              <Label>{t("labels.algorithm")}</Label>
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
                  <SelectItem value="HS256">{t("algorithms.HS256")}</SelectItem>
                  <SelectItem value="HS384">{t("algorithms.HS384")}</SelectItem>
                  <SelectItem value="HS512">{t("algorithms.HS512")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="jwt-decode-input">
            {t("labels.pasteTokenToDecode")}
          </Label>
          <Textarea
            id="jwt-decode-input"
            value={tokenToDecode}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_FIELD",
                payload: { field: "tokenToDecode", value: e.target.value },
              })
            }
            className="min-h-24 resize-none font-mono text-xs bg-background"
            placeholder={t("placeholders.pasteTokenToDecode")}
          />
        </div>
        {(verification.status === "verified" ||
          verification.status === "invalid") && (
          <div className="mt-2 h-6">
            {verification.status === "verified" && (
              <Badge className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("badges.signatureVerified")}
              </Badge>
            )}
            {verification.status === "invalid" && (
              <Badge variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                {t("badges.signatureInvalid")}
              </Badge>
            )}
          </div>
        )}
        <div className="grid grid-rows-2 gap-4 flex-grow min-h-0">
          <Card className="flex flex-col py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4 w-full">
              <CardTitle className="text-base flex items-center w-full justify-between">
                {t("labels.headerDecoded")}
                {decodedParts.header && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleCopyToClipboard(decodedParts.header, t)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
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
                  {decodedParts.error || t("placeholders.waiting")}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="flex flex-col py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4 w-full">
              <CardTitle className="text-base flex items-center w-full justify-between">
                {t("labels.payloadDecoded")}
                {decodedParts.payload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleCopyToClipboard(decodedParts.payload, t)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
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
                  {decodedParts.error || t("placeholders.waiting")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});
JWTToolLayout.displayName = "JWTToolLayout";

const TextToTextLayout: FC<{
  inputValue: string;
  setInputValue: (v: string) => void;
  mode: "encode" | "decode";
  processor: (input: string, options: { mode: "encode" | "decode" }) => string;
  t: (key: string) => string;
}> = ({ inputValue, setInputValue, mode, processor, t }) => {
  const { outputValue, decodeError } = useMemo(() => {
    if (!inputValue.trim()) return { outputValue: "", decodeError: null as string | null };
    try {
      const value = processor(inputValue, { mode });
      return { outputValue: value, decodeError: null };
    } catch (e) {
      const msg = (e as Error).message;
      return { outputValue: msg, decodeError: mode === "decode" ? msg : null };
    }
  }, [inputValue, mode, processor]);

  React.useEffect(() => {
    if (decodeError) toast.error(t("messages.decodeError"));
  }, [decodeError, t]);

  return (
    <div className="grid @md:grid-cols-2 gap-4 flex-grow min-h-0 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <Label>{t("labels.input")}</Label>
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-full resize-none font-mono text-sm bg-background"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label>{t("labels.output")}</Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopyToClipboard(outputValue, t)}
            title={t("buttons.copyOutput")}
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
  const t = useAppTranslations("encoders");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");
  const [urlMode, setUrlMode] = useState<"encode" | "decode">("encode");

  const jwtToolRef = useRef<{ reset: () => void }>(null);

  const handleClear = () => {
    if (selectedTool === "jwt") {
      jwtToolRef.current?.reset();
    } else {
      setState({ [`${selectedTool}Input`]: "" });
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-card text-card-foreground border-t @container stable-scrollbar-container">
      <div className="flex items-center gap-4 flex-wrap">
        <Label className="flex-shrink-0 font-bold">{t("labels.tool")}</Label>
        <Select
          value={selectedTool}
          onValueChange={(value) =>
            setState({ selectedTool: value as ToolKey })
          }
        >
          <SelectTrigger className="w-full @sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[999999999]">
            {createToolOptions(t).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-grow" />
        <Button onClick={handleClear} variant="ghost" size="sm">
          <Eraser className="mr-2 h-4 w-4" /> {t("buttons.clear")}
        </Button>
      </div>

      {selectedTool === "jwt" && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
          <span>{t("messages.debugWarning")}</span>
        </div>
      )}

      {selectedTool === "base64" && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={base64Mode === "encode" ? "default" : "outline"}
            onClick={() => setBase64Mode("encode")}
          >
            {t("buttons.textToBase64")}
          </Button>
          <Button
            variant={base64Mode === "decode" ? "default" : "outline"}
            onClick={() => setBase64Mode("decode")}
          >
            {t("buttons.base64ToText")}
          </Button>
        </div>
      )}
      {selectedTool === "url" && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={urlMode === "encode" ? "default" : "outline"}
            onClick={() => setUrlMode("encode")}
          >
            {t("buttons.encodeUrl")}
          </Button>
          <Button
            variant={urlMode === "decode" ? "default" : "outline"}
            onClick={() => setUrlMode("decode")}
          >
            {t("buttons.decodeUrl")}
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
          t={t}
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
          t={t}
        />
      )}
      {selectedTool === "jwt" && (
        <JWTToolLayout instanceId={instanceId} t={t} ref={jwtToolRef} />
      )}
    </div>
  );
}

const MemoizedEncodersDecoders = React.memo(EncodersDecodersComponent);
export function EncodersDecoders({ instanceId }: { instanceId: string }) {
  return <MemoizedEncodersDecoders instanceId={instanceId} />;
}
