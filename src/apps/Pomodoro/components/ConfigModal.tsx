import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BarChart3, Settings, Volume2 } from "lucide-react";
import { RefObject, useState } from "react";

type ConfigModalProps = {
  parentModalContainerRef?: RefObject<HTMLDivElement>;
};

export const ConfigModal = ({ parentModalContainerRef }: ConfigModalProps) => {
  console.log(parentModalContainerRef);

  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [alarmSound, setAlarmSound] = useState("kitchen");
  const [alarmVolume, setAlarmVolume] = useState([50]);
  const [alarmRepeat, setAlarmRepeat] = useState(1);
  const [tickingSound, setTickingSound] = useState("none");
  const [tickingVolume, setTickingVolume] = useState([50]);
  return (
    <Dialog>
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
        className="max-w-md max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="sound" className="flex items-center gap-2">
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
                    value={pomodoroTime}
                    onChange={(e) => setPomodoroTime(Number(e.target.value))}
                    className="mt-1 text-center"
                  />
                </div>
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    Short Break
                  </Label>
                  <Input
                    type="number"
                    value={shortBreakTime}
                    onChange={(e) => setShortBreakTime(Number(e.target.value))}
                    className="mt-1 text-center"
                  />
                </div>
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    Long Break
                  </Label>
                  <Input
                    type="number"
                    value={longBreakTime}
                    onChange={(e) => setLongBreakTime(Number(e.target.value))}
                    className="mt-1 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto Start Breaks</Label>
                <Switch
                  checked={autoStartBreaks}
                  onCheckedChange={setAutoStartBreaks}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto Start Pomodoros</Label>
                <Switch
                  checked={autoStartPomodoros}
                  onCheckedChange={setAutoStartPomodoros}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Long Break interval</Label>
                <Input
                  type="number"
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(Number(e.target.value))}
                  className="w-16 text-center"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sound" className="space-y-6 mt-6 mb-3">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Alarm Sound</Label>
                <Select value={alarmSound} onValueChange={setAlarmSound}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[999999]">
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{alarmVolume[0]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">repeat</span>
                      <Input
                        type="number"
                        value={alarmRepeat}
                        onChange={(e) => setAlarmRepeat(Number(e.target.value))}
                        className="w-16 text-center"
                        min="1"
                      />
                    </div>
                  </div>
                  <Slider
                    value={alarmVolume}
                    onValueChange={setAlarmVolume}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Ticking Sound</Label>
                <Select value={tickingSound} onValueChange={setTickingSound}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[999999]">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ticking">Ticking</SelectItem>
                    <SelectItem value="white-noise">White Noise</SelectItem>
                    <SelectItem value="brown-noise">Brown Noise</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{tickingVolume[0]}</span>
                  </div>
                  <Slider
                    value={tickingVolume}
                    onValueChange={setTickingVolume}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
