import { createBrowserRouter } from "react-router";
import { HomePage } from "./App";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedDashboard } from "./pages/ProtectedDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: ProtectedDashboard,
  },
]);