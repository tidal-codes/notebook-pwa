import { useBreakpointValue } from "@/shared/lib/use-breakpoint-value";
import { AppControlsAside, AppControlsHeader } from "@/widgets/app-controls";

export default function AppControll() {
  const isSidebar = useBreakpointValue({ base: false, md: true });
  return isSidebar ? <AppControlsAside /> : <AppControlsHeader />;
}
