import { RouterProvider } from "react-router-dom";
import router from "@/app/routes";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useMemo } from "react";
import { ThemeProvider } from "./theme/theme-provider";
import StoreProvider from "@/shared/config/store/store-provider";
import { AuthProvider } from "@/features/auth/model/auth-provider";

export default function App() {
  const client = useMemo(() => new QueryClient(), []);
  useLayoutEffect(() => {
    console.log(document.querySelector(".loading-screen"));
    document.querySelector(".loading-screen")?.remove();
  }, []);

  return (
    <TooltipProvider delayDuration={900} skipDelayDuration={300}>
      <QueryClientProvider client={client}>
        <StoreProvider>
          <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
}
