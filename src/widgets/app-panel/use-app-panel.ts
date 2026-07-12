import { useParams } from "react-router-dom";
import { PanelSchema } from "./schema";

export default function useAppPanel() {
  const params = useParams();
  const panel = PanelSchema.safeParse(params.panel).data ?? "explorer";

  return { panel };
}
