"use client";

import { apps } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { useWindowStore, WindowInstance } from "@/stores/useWindowStore";
import { motion } from "framer-motion";
import { Minus, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

type Props = {
  instance: WindowInstance;
};

export default function AppWindow({ instance }: Props) {
  const {
    closeApp,
    focusApp,
    focusStack,
    minimizedApps,
    maximizedApps,
    toggleMaximizeApp,
    minimizeApp,
  } = useWindowStore();

  const { id, appKey } = instance;
  const app = apps[appKey];
  const Component = app.component;

  const isMinimized = minimizedApps.includes(id);
  const isMaximized = maximizedApps.includes(id);
  const index = focusStack.findIndex((i) => i === id);
  const zIndex = index === -1 ? 100 : 100 + index;

  return (
    <WindowShell
      id={id}
      isMaximized={isMaximized}
      isMinimized={isMinimized}
      zIndex={zIndex}
      onFocus={() => focusApp(id)}
      onToggleMaximize={() => toggleMaximizeApp(id)}
      header={
        <WindowHeader
          title={app.name}
          isMaximized={isMaximized}
          onMinimize={() => minimizeApp(id)}
          onMaximize={() => toggleMaximizeApp(id)}
          onClose={() => closeApp(id)}
        />
      }
    >
      <Component />
    </WindowShell>
  );
}

function WindowHeader({
  title,
  onMinimize,
  onMaximize,
  onClose,
  isMaximized,
}: {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  isMaximized?: boolean;
}) {
  return (
    <div
      onDoubleClick={onMaximize}
      className={cn(
        "bg-card text-foreground px-4 py-2 flex justify-between items-center handle",
        {
          "rounded-t-lg cursor-move": !isMaximized,
        }
      )}
    >
      <span>{title}</span>
      <div className="flex gap-2">
        <Minus
          className="w-4 h-4 hover:opacity-70 cursor-pointer"
          onClick={onMinimize}
        />
        <Square
          className="w-4 h-4 hover:opacity-70 cursor-pointer"
          onClick={onMaximize}
        />
        <X
          className="w-4 h-4 hover:opacity-70 cursor-pointer"
          onClick={onClose}
        />
      </div>
    </div>
  );
}

function WindowShell({
  isMaximized,
  isMinimized,
  zIndex,
  onFocus,
  header,
  children,
}: {
  id: string;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  onFocus: () => void;
  onToggleMaximize: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [defaultPosition, setDefaultPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const width = 400;
    const height = 300;
    const x = window.innerWidth / 2 - width / 2;
    const y = window.innerHeight / 2 - height / 2;
    setDefaultPosition({ x, y });
    setReady(true);
  }, []);

  if (!ready) return null;

  const hiddenStyle = isMinimized
    ? {
        visibility: "hidden" as const,
        pointerEvents: "none" as const,
      }
    : {};

  return (
    <Draggable
      handle=".handle"
      nodeRef={nodeRef}
      disabled={isMaximized}
      defaultPosition={defaultPosition}
      position={isMaximized ? { x: 0, y: 0 } : undefined}
      bounds="parent"
      cancel=".react-resizable-handle"
    >
      <motion.div
        ref={nodeRef}
        style={{ zIndex, ...hiddenStyle }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("absolute", {
          "top-0 left-0": isMaximized,
        })}
      >
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[300, 200]}
          maxConstraints={[window.innerWidth, window.innerHeight]}
          onResizeStop={(_, data) =>
            setSize({ width: data.size.width, height: data.size.height })
          }
          resizeHandles={isMaximized ? [] : ["se", "e", "s"]}
          handle={isMaximized ? <span /> : undefined}
        >
          <div
            onMouseDown={onFocus}
            className={cn("flex flex-col bg-foreground shadow-lg", {
              "w-screen h-screen": isMaximized,
              "rounded-lg": !isMaximized,
              "w-full h-full": !isMaximized,
            })}
          >
            {header}
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </div>
        </ResizableBox>
      </motion.div>
    </Draggable>
  );
}
