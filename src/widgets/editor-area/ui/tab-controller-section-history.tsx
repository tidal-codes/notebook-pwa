import {
  selectCanStepBack,
  selectCanStepForward,
} from "@/entities/tabs/model/selectors";
import useTabHistoryStep from "@/features/tabs/use-tab-history-step";
import { useAppSelector } from "@/shared/config/store/hooks";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function TabControllerSectionHistory() {
  const canStepBack = useAppSelector(selectCanStepBack);
  const { handleTabHistoryStep } = useTabHistoryStep();
  const canStepForward = useAppSelector(selectCanStepForward);
  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon-sm"
        disabled={!canStepBack}
        onClick={() => handleTabHistoryStep("back")}
      >
        <ArrowLeft />
      </Button>
      <Button
        size="icon-sm"
        disabled={!canStepForward}
        onClick={() => handleTabHistoryStep("forward")}
      >
        <ArrowRight />
      </Button>
    </div>
  );
}
