import { AppLauncher } from "@/components/AppLauncher";
import Desktop from "@/components/Desktop";
import { Dock } from "@/components/Dock";

export default function Home() {
  return (
    <Desktop>
      <Dock />
      <AppLauncher />
    </Desktop>
  );
}
