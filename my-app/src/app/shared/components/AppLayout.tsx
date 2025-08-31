import { Link, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b">
        <nav className="mx-auto max-w-5xl flex items-center gap-4 p-4">
          <Link to="/" className="font-semibold hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl w-full flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl p-4 text-xs opacity-70">
          © {new Date().getFullYear()} my-app
        </div>
      </footer>
    </div>
  );
}
