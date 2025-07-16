"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/form/Input";
import { Label } from "@/components/ui/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/SelectCore";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { DialogDescription } from "@radix-ui/react-dialog";
import { BarChart3, Settings, Volume2 } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
import { toast } from "sonner";
import { defaultState } from "..";

type ConfigModalProps = {
  instanceId: string;
  parentModalContainerRef?: RefObject<HTMLDivElement>;
};

type PomodoroSettings = Omit<
  typeof defaultState,
  | "mode"
  | "isRunning"
  | "completedPomodoros"
  | "sessionHistory"
  | "notificationDenied"
  | "scrollPosition"
  | "secondsLeft"
>;

export function ConfigModal({
  instanceId,
  parentModalContainerRef,
}: ConfigModalProps) {
  const [globalState, setGlobalState] = usePersistentAppStore(
    instanceId,
    defaultState
  );

  const [localSettings, setLocalSettings] = useState<PomodoroSettings | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const {
        pomodoroTime,
        shortBreakTime,
        longBreakTime,
        longBreakInterval,
        autoStartBreaks,
        autoStartPomodoros,
        alarmSound,
        alarmVolume,
        alarmRepeat,
        tickingSound,
        tickingVolume,
      } = globalState;
      setLocalSettings({
        pomodoroTime,
        shortBreakTime,
        longBreakTime,
        longBreakInterval,
        autoStartBreaks,
        autoStartPomodoros,
        alarmSound,
        alarmVolume,
        alarmRepeat,
        tickingSound,
        tickingVolume,
      });
    } else {
      setLocalSettings(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!localSettings) return;

    setGlobalState((prevState) => {
      const timeSettingMap: { [key: string]: keyof PomodoroSettings } = {
        pomodoro: "pomodoroTime",
        shortBreak: "shortBreakTime",
        longBreak: "longBreakTime",
      };

      const keyForCurrentMode = timeSettingMap[prevState.mode];
      const oldDuration = prevState[keyForCurrentMode];
      const newDuration = localSettings[keyForCurrentMode];

      const newState: Partial<typeof defaultState> = { ...localSettings };
      if (oldDuration !== newDuration) {
        newState.secondsLeft = Number(newDuration) * 60;
        newState.isRunning = false;
      }

      return newState;
    });

    toast.success("Configurações salvas!");
    setIsOpen(false);
  };

  if (!localSettings) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white absolute top-2 right-2 @sm:top-4 @sm:right-4"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white absolute top-2 right-2 @sm:top-4 @sm:right-4"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        portalContainer={parentModalContainerRef?.current ?? undefined}
        className="max-w-md max-h-[80vh] overflow-y-auto z-[9999999]"
        noCloseIcon
      >
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription className="sr-only">
            Ajuste as configurações do timer Pomodoro, pausas e sons.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="sound"
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Som
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6 mt-6 mb-3">
            <div>
              <Label className="text-base font-medium mb-4 block">
                Tempo (minutos)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    Pomodoro
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.pomodoroTime || undefined}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        pomodoroTime: Number(e.target.value),
                      })
                    }
                    className="mt-1 text-center"
                  />
                </div>
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    Short Break
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.shortBreakTime || undefined}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        shortBreakTime: Number(e.target.value),
                      })
                    }
                    className="mt-1 text-center"
                  />
                </div>
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    Long Break
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.longBreakTime || undefined}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        longBreakTime: Number(e.target.value),
                      })
                    }
                    className="mt-1 text-center"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto Start Breaks</Label>
                <Switch
                  checked={localSettings.autoStartBreaks}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      autoStartBreaks: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Start Pomodoros</Label>
                <Switch
                  checked={localSettings.autoStartPomodoros}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      autoStartPomodoros: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Long Break interval</Label>
                <Input
                  type="number"
                  value={localSettings.longBreakInterval || undefined}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      longBreakInterval: Number(e.target.value),
                    })
                  }
                  className="w-16 text-center"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sound" className="space-y-6 mt-6 mb-3">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Alarm Sound</Label>
                <Select
                  value={localSettings.alarmSound}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, alarmSound: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[999999999]">
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {localSettings.alarmVolume[0]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">repeat</span>
                      <Input
                        type="number"
                        value={localSettings.alarmRepeat || undefined}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            alarmRepeat: Number(e.target.value),
                          })
                        }
                        className="w-16 text-center"
                        min="1"
                      />
                    </div>
                  </div>
                  <Slider
                    value={localSettings.alarmVolume}
                    onValueChange={(value) =>
                      setLocalSettings({ ...localSettings, alarmVolume: value })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-base font-medium">Ticking Sound</Label>
                <Select
                  value={localSettings.tickingSound}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, tickingSound: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[999999999]">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ticking">Ticking</SelectItem>
                    <SelectItem value="white-noise">White Noise</SelectItem>
                    <SelectItem value="brown-noise">Brown Noise</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">
                      {localSettings.tickingVolume[0]}
                    </span>
                  </div>
                  <Slider
                    value={localSettings.tickingVolume}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        tickingVolume: value,
                      })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
