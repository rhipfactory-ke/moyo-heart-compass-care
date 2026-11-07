import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMe } from "@/hooks/use-me";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Your care workspace — MoyoDoc" },
      { name: "description", content: "Open your personal MoyoDoc care workspace." },
    ],
  }),
  component: AppDispatch,
});

function AppDispatch() {
  const { data, isLoading } = useMe();
  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
    );
  }
  if (!data) {
    return <Navigate to="/login" replace />;
  }
  if (data.role === "PHYSICIAN") return <Navigate to="/doctor" replace />;
  if (data.role === "HOSPITAL_ADMIN") return <Navigate to="/hospital" replace />;
  if (data.role === "SUPER_ADMIN") return <Navigate to="/super-admin" replace />;
  return <Navigate to="/patient" replace />;
}
