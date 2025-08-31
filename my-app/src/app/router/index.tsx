import { useRoutes, Navigate } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import AboutPage from "../pages/about/AboutPage";
import AppLayout from "../shared/components/AppLayout";
import TeacherDashboard from "../pages/TeacherDashboard";
import BattleInterface from "../pages/BattleInterface";
import TeamHeadquarters from "../pages/TeamHeadquarters";
import UserProfile from "../pages/UserProfile";

export function AppRouter() {
  const routes = useRoutes([
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/about", element: <AboutPage /> },
        { path: "*", element: <Navigate to="/" replace /> },
        { path: "/teacher", element: <TeacherDashboard />},
        {  path: "/battle/:battleId",  element: <BattleInterface />},
        {  path: "/team",  element: <TeamHeadquarters />, },
        {  path: "/user/:userId",  element: <UserProfile />, },
      ],
    },
  ]);

  return routes;
}
