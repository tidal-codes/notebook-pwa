import { RootPage } from "@/pages/root";
import { createBrowserRouter } from "react-router-dom";

export default createBrowserRouter([
  {
    path: "/:panel?",
    element: <RootPage />,
  },
])
