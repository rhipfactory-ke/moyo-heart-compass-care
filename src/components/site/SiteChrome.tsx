import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Linkedin, Instagram, Facebook, User, Stethoscope } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MoyoDoc home">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-on-dark" : "bg-brand-gradient"}`}
      >
        <svg
          viewBox="0 0 32 32"
          className={`h-6 w-6 ${light ? "text-primary" : "text-on-dark"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 22V10l6 8 3-5 3 6 3-9 3 7 6-7v12" />
        </svg>
      </span>
      <span
        className={`font-display text-xl font-extrabold tracking-tight ${light ? "text-on-dark" : "text-wine"}`}
      >
        Moyo<span className={light ? "text-coral" : "text-primary"}>Doc</span>
      </span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/patients", label: "For Patients" },
  { to: "/providers", label: "For Healthcare Providers" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About Us" },
] as const;

function GetStartedMenu({ onPick }: { onPick?: () => void }) {
  return (
    <div className="grid gap-1 p-2">
      <Link
        to="/register"
        onClick={onPick}
        className="flex items-center gap-3 rounded-xl p-3 hover:bg-blush"
      >
        <User className="h-5 w-5 text-primary" />
        <span>
          <span className="block font-semibold text-wine">I'm a Patient</span>
          <span className="text-xs text-muted-foreground">Check my heart health</span>
        </span>
      </Link>
      <Link
        to="/providers/apply"
        onClick={onPick}
        className="flex items-center gap-3 rounded-xl p-3 hover:bg-blush"
      >
        <Stethoscope className="h-5 w-5 text-primary" />
        <span>
          <span className="block font-semibold text-wine">I'm a Healthcare Provider</span>
          <span className="text-xs text-muted-foreground">Join the provider network</span>
        </span>
      </Link>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="btn btn-outline py-2">
            Log In
          </Link>
          <div className="relative">
            <button
              className="btn btn-primary py-2"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
            >
              Get Started
            </button>
            {menu && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border bg-popover shadow-float"
                onMouseLeave={() => setMenu(false)}
              >
                <GetStartedMenu onPick={() => setMenu(false)} />
              </div>
            )}
          </div>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6 text-wine" /> : <Menu className="h-6 w-6 text-wine" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background px-5 pb-6 lg:hidden">
          <nav className="grid py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 font-medium"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="py-3 font-medium">
              Log In
            </Link>
          </nav>
          <p className="eyebrow mb-1">Get Started</p>
          <div className="rounded-2xl border">
            <GetStartedMenu onPick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const col = "grid gap-2 text-sm text-on-dark/75";
  return (
    <footer className="bg-wine text-on-dark">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 text-on-dark/80">Better blood pressure care. Beyond the clinic.</p>
          <div className="mt-6 flex gap-3">
            {[Linkedin, Instagram, Facebook].map((I, i) => (
              <span
                key={i}
                className="grid h-9 w-9 place-items-center rounded-full border border-on-dark/25"
                title="Official account coming soon"
              >
                <I className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-on-dark">Explore</h4>
          <div className={col}>
            <Link to="/">Home</Link>
            <Link to="/patients">For Patients</Link>
            <Link to="/providers">For Healthcare Providers</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/about">About MoyoDoc</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-on-dark">Get Started</h4>
          <div className={col}>
            <Link to="/register">Patient Registration</Link>
            <Link to="/providers/apply">Healthcare Provider Registration</Link>
            <Link to="/login">Log In</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-on-dark">Contact</h4>
          <div className={col}>
            <Link to="/about">Contact Us</Link>
            <Link to="/providers/apply">Provider Enquiries</Link>
            <Link to="/about">Support</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-on-dark">Legal</h4>
          <div className={col}>
            <Link to="/legal">Privacy Policy</Link>
            <Link to="/legal">Terms of Use</Link>
            <Link to="/legal">Medical Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-on-dark/15">
        <div className="mx-auto max-w-7xl px-5 py-6 text-xs leading-relaxed text-on-dark/65">
          <p>
            MoyoDoc supports hypertension management and communication between patients and
            healthcare professionals. It does not independently diagnose medical conditions,
            prescribe medication or replace professional medical advice. Always consult a qualified
            healthcare professional regarding your health.
          </p>
          <p className="mt-3">Copyright © 2026 MoyoDoc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function SampleBadge() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Sample data
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-soft-gradient">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">{title}</h1>
        {children && (
          <div className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{children}</div>
        )}
      </div>
    </section>
  );
}
