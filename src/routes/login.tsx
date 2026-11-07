import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Log In | MoyoDoc", "Log in to your MoyoDoc patient or clinician account."),
  component: Login,
});

function Login() {
  return (
    <section className="bg-soft-gradient">
      <div className="mx-auto max-w-md px-5 py-24">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <h1 className="text-3xl font-extrabold">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Account access is opening soon for registered patients and onboarded providers.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <label className="grid gap-1.5 text-sm font-medium">
              Email or phone
              <input className="field" disabled />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Password
              <input type="password" className="field" disabled />
            </label>
            <button className="btn btn-primary opacity-60" disabled>
              Log In
            </button>
          </form>
          <p className="mt-6 text-sm">
            New to MoyoDoc?{" "}
            <Link to="/register" className="font-semibold text-primary">
              Check my heart health
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
