import { Drawer, DrawerContent } from "@/shared/ui/drawer";
import AppPanel from "@/widgets/app-panel";

export default function PanelDrawer() {
  return (
    <Drawer open={true} direction="left">
      <DrawerContent className="data-[vaul-drawer-direction=left]:w-full! data-[vaul-drawer-direction=left]:sm:max-w-2xl">
        <AppPanel isDrawer={true}/>
      </DrawerContent>
    </Drawer>
  );
}
