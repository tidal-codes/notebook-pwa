import { RouterProvider } from "react-router-dom";
import router from "@/app/routes";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { ThemeProvider } from "./theme/theme-provider";
import StoreProvider from "@/shared/config/store/store-provider";


export default function App() {
  const client = useMemo(() => new QueryClient(), []);
  return (
    <TooltipProvider delayDuration={900} skipDelayDuration={300}>
      <QueryClientProvider client={client}>
        <StoreProvider>
          <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </StoreProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
}
