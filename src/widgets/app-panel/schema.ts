import { z } from "zod";

export const PanelSchema = z.enum([
  "explorer",
  "search",
  "bookmarks",
]);