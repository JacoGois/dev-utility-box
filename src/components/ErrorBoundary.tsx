"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  appName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Uncaught error in ${this.props.appName || "a component"}:`,
      error,
      errorInfo
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: "20px",
            border: "1px solid hsl(var(--destructive))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--destructive))",
            borderRadius: "var(--radius)",
            margin: "10px",
            textAlign: "center",
          }}
        >
          <h2>
            Algo deu errado
            {this.props.appName ? `em ${this.props.appName}` : ""}.
          </h2>
          <p>Por favor, tente recarregar o aplicativo ou esta seção.</p>
          {this.state.error && (
            <details
              style={{
                whiteSpace: "pre-wrap",
                marginTop: "10px",
                fontSize: "0.8em",
              }}
            >
              <summary>Detalhes do Erro (Dev)</summary>
              {this.state.error.toString()}
              <br />
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
