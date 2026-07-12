import { Button } from "@/shared/ui/button";
import Tooltip from "@/shared/ui/tooltip";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type ActionTriggerProps = ComponentPropsWithoutRef<typeof Button>;

const SortActionMenuTrigger = forwardRef<HTMLButtonElement, ActionTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Tooltip content="change sort order">
        <Button ref={ref} size="icon-lg" {...props}>
          {children}
        </Button>
      </Tooltip>
    );
  },
);

SortActionMenuTrigger.displayName = "SortActionMenuTrigger";

export default SortActionMenuTrigger;
