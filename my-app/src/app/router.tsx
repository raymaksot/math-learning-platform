import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import TeacherDashboard from "./pages/TeacherDashboard";
import BattleInterface from "./pages/BattleInterface";
import TeamHeadquarters from "./pages/TeamHeadquarters";
import UserProfile from "./pages/UserProfile";
import LoginPage from "./pages/about/AboutPage"; // временно используем AboutPage как LoginPage

// Пример проверки аутентификации (заменить на реальную логику)
function useAuth() {
  // Здесь можно использовать глобальное состояние, context или localStorage
  // Например: return Boolean(localStorage.getItem("token"));
  return true; // всегда аутентифицирован для примера
}

function PrivateRoute() {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/battle/:battleId" element={<BattleInterface />} />
          <Route path="/team" element={<TeamHeadquarters />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
