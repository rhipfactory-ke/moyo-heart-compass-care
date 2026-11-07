import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession, type ActiveSession } from "@/lib/store";

function roleHomeRoute(role: ActiveSession["role"]) {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "PHYSICIAN":
      return "/doctor";
    case "HOSPITAL_ADMIN":
      return "/hospital";
    case "SUPER_ADMIN":
      return "/super-admin";
  }
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSessionState] = useState<ActiveSession | null>(() => getSession());

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    window.addEventListener("moyodoc:store_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("moyodoc:store_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      navigate({ to: "/login", replace: true });
      return;
    }

    const allowedPrefix = roleHomeRoute(current.role);
    if (pathname !== "/app" && !pathname.startsWith(allowedPrefix)) {
      navigate({ to: allowedPrefix, replace: true });
    }
  }, [pathname, session, navigate]);

  if (!session) {
    return null;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});
