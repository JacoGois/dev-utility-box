"use client";

import { apps } from "@/lib/apps";
import { useWindowStore, WindowInstance } from "@/stores/useWindowStore";
import { motion } from "framer-motion";
import { Minus, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

type Props = {
  instance: WindowInstance;
};

export default function AppWindow({ instance }: Props) {
  const {
    closeApp,
    focusApp,
    focusStack,
    minimizedApps,
    toggleMaximizeApp,
    maximizedApps,
    minimizeApp,
  } = useWindowStore();

  const { id, appKey } = instance;
  const app = apps[appKey];
  const Component = app.component;

  const isMinimized = minimizedApps.includes(id);
  const isMaximized = maximizedApps.includes(id);
  const index = focusStack.findIndex((i) => i === id);
  const zIndex = 100 + index;

  const nodeRef = useRef<HTMLDivElement>(null!);
  const [defaultPosition, setDefaultPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const width = 400;
    const height = 300;
    const x = window.innerWidth / 2 - width / 2;
    const y = window.innerHeight / 2 - height / 2;
    setDefaultPosition({ x, y });
    setReady(true);
  }, []);

  const isHidden = isMinimized || !ready;

  if (!ready) return null;

  return isMaximized ? (
    <motion.div
      ref={nodeRef}
      onMouseDown={() => focusApp(id)}
      style={{
        zIndex,
        top: 0,
        left: 0,
        pointerEvents: isHidden ? "none" : "auto",
        visibility: isHidden ? "hidden" : "visible",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isHidden ? 0 : 1, scale: isHidden ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute w-screen h-screen bg-foreground"
    >
      <WindowHeader
        title={app.name}
        onMinimize={() => minimizeApp(id)}
        onMaximize={() => toggleMaximizeApp(id)}
        onClose={() => closeApp(id)}
      />
      <Component />
    </motion.div>
  ) : (
    <Draggable
      handle=".handle"
      nodeRef={nodeRef}
      defaultPosition={defaultPosition}
      onStart={() => {
        if (isMaximized) {
          toggleMaximizeApp(id);
        }
      }}
    >
      <div
        ref={nodeRef}
        onMouseDown={() => focusApp(id)}
        style={{
          zIndex,
          visibility: isHidden ? "hidden" : "visible",
        }}
        className="absolute"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isHidden ? 0 : 1, scale: isHidden ? 0.95 : 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-[400px] h-[300px] bg-foreground rounded-lg overflow-hidden shadow-lg"
        >
          <WindowHeader
            title={app.name}
            onMinimize={() => minimizeApp(id)}
            onMaximize={() => toggleMaximizeApp(id)}
            onClose={() => closeApp(id)}
          />
          <Component />
        </motion.div>
      </div>
    </Draggable>
  );
}

function WindowHeader({
  title,
  onMinimize,
  onMaximize,
  onClose,
}: {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-card text-foreground px-4 py-2 flex justify-between items-center handle cursor-move rounded-t-lg">
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
