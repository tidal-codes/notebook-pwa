import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { selectIsAppDrawerOpen } from "@/shared/model/app-ui.selectors";
import { closeAppDrawer } from "@/shared/model/app-ui.store";
import { Drawer, DrawerContent } from "@/shared/ui/drawer";
import AppPanel from "@/widgets/app-panel";

export default function PanelDrawer() {
  const isOpen = useAppSelector(selectIsAppDrawerOpen);
  const dispatch = useAppDispatch();
  function handleCloseAppDrawer(open: boolean) {
    if (!open) dispatch(closeAppDrawer());
  }
  return (
    <Drawer open={isOpen} onOpenChange={handleCloseAppDrawer} direction="left">
      <DrawerContent className="data-[vaul-drawer-direction=left]:w-full! data-[vaul-drawer-direction=left]:sm:max-w-2xl">
        <AppPanel isDrawer={true} />
      </DrawerContent>
    </Drawer>
  );
}
