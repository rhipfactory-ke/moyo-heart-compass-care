import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Heart,
  Stethoscope,
  Building2,
  Shield,
  ArrowRight,
  UserPlus,
  Lock,
  AlertCircle,
} from "lucide-react";
import { seo } from "@/lib/seo";
import {
  getSuperAdmins,
  registerSuperAdmin,
  authenticateSuperAdmin,
  authenticateHospitalAdmin,
  authenticateClinician,
  authenticatePatient,
  setSession,
} from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => seo("Log In | MoyoDoc", "Log in to your MoyoDoc patient, specialist, or admin account."),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"PATIENT" | "PHYSICIAN" | "HOSPITAL_ADMIN" | "SUPER_ADMIN">(
    "PATIENT",
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [superAdminName, setSuperAdminName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);

  useEffect(() => {
    const sync = () => {
      setHasSuperAdmin(getSuperAdmins().length > 0);
    };
    sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, []);

  const handleRoleSwitch = (nextRole: typeof role) => {
    setRole(nextRole);
    setErrorMsg(null);
    setIdentifier("");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (role === "PATIENT") {
      const res = authenticatePatient(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }
      setSession({
        role: "PATIENT",
        userId: res.patient.id,
        name: res.patient.name,
        email: res.patient.email,
      });
      toast.success(`Signed in as ${res.patient.name}`);
      navigate({ to: "/patient", search: { patientId: res.patient.id } });
      return;
    }

    if (role === "PHYSICIAN") {
      const res = authenticateClinician(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }
      setSession({
        role: "PHYSICIAN",
        userId: res.clinician.id,
        name: res.clinician.name,
        email: res.clinician.email,
        hospitalId: res.clinician.hospitalId,
        hospitalName: res.clinician.hospitalName,
      });
      toast.success(`Welcome back, ${res.clinician.name}`);
      navigate({ to: "/doctor" });
      return;
    }

    if (role === "HOSPITAL_ADMIN") {
      const res = authenticateHospitalAdmin(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }
      setSession({
        role: "HOSPITAL_ADMIN",
        userId: res.hospital.id,
        name: res.hospital.adminName || `${res.hospital.name} Admin`,
        email: res.hospital.adminEmail,
        hospitalId: res.hospital.id,
        hospitalName: res.hospital.name,
      });
      toast.success(`Signed in to ${res.hospital.name} Admin Portal`);
      navigate({ to: "/hospital" });
      return;
    }

    if (role === "SUPER_ADMIN") {
      if (!hasSuperAdmin) {
        if (!superAdminName.trim() || !identifier.trim() || !password) {
          setErrorMsg("Please enter your full name, email, and password to initialize Super Admin.");
          return;
        }
        const admin = registerSuperAdmin({
          name: superAdminName.trim(),
          email: identifier.trim(),
          password,
        });
        setSession({
          role: "SUPER_ADMIN",
          userId: admin.id,
          name: admin.name,
          email: admin.email,
        });
        toast.success(`Super Admin account initialized for ${admin.name}`);
        navigate({ to: "/super-admin" });
        return;
      }

      const res = authenticateSuperAdmin(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }
      setSession({
        role: "SUPER_ADMIN",
        userId: res.admin.id,
        name: res.admin.name,
        email: res.admin.email,
      });
      toast.success(`Signed in as Super Admin (${res.admin.name})`);
      navigate({ to: "/super-admin" });
    }
  };

  return (
    <section className="bg-soft-gradient">
      <div className="mx-auto max-w-xl px-5 py-16 md:py-24">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Lock className="h-3.5 w-3.5" />
            Role-Based Access Control
          </div>
          <h1 className="mt-1 text-3xl font-extrabold">Log in to MoyoDoc</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your role and enter your registered credentials to access your portal.
          </p>

          {/* 4-Tier Role Selector */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { id: "PATIENT", label: "Patient", sub: "Companion", icon: Heart },
              { id: "PHYSICIAN", label: "Specialist", sub: "Clinical Panel", icon: Stethoscope },
              { id: "HOSPITAL_ADMIN", label: "Hospital Admin", sub: "Facility Governance", icon: Building2 },
              { id: "SUPER_ADMIN", label: "Super Admin", sub: "Platform Ops", icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRoleSwitch(item.id as typeof role)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition ${
                    active
                      ? "border-primary bg-blush text-primary shadow-xs"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.sub}</span>
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-900">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {role === "SUPER_ADMIN" && !hasSuperAdmin && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
              <span className="font-bold">First-Time Platform Setup:</span> No Super Admin account
              exists yet. Create the master Super Admin account below to begin enrolling Partner
              Hospitals.
            </div>
          )}

          {role === "HOSPITAL_ADMIN" && (
            <div className="mt-5 rounded-2xl border bg-muted/40 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-wine">Hospital Admin Access:</span> Sign in using
              the administrator email and password created when your hospital was enrolled by the
              MoyoDoc Super Admin.
            </div>
          )}

          <form className="mt-5 grid gap-4" onSubmit={handleLogin}>
            {role === "SUPER_ADMIN" && !hasSuperAdmin && (
              <label className="grid gap-1.5 text-sm font-medium">
                Super Admin Full Name *
                <input
                  required
                  value={superAdminName}
                  onChange={(e) => setSuperAdminName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="field"
                />
              </label>
            )}

            <label className="grid gap-1.5 text-sm font-medium">
              {role === "PATIENT"
                ? "Registered Phone Number or Email *"
                : role === "PHYSICIAN"
                  ? "Registered Work Email or KMPDC License # *"
                  : role === "HOSPITAL_ADMIN"
                    ? "Hospital Admin Email *"
                    : "Super Admin Email *"}
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === "PATIENT"
                    ? "e.g. +254 712 345 678 or jane.doe@example.com"
                    : role === "PHYSICIAN"
                      ? "e.g. dr.janedoe@hospital.co.ke or KMPDC-A8492"
                      : role === "HOSPITAL_ADMIN"
                        ? "e.g. admin@nairobiheart.co.ke"
                        : "e.g. superadmin@moyodoc.com"
                }
                className="field"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Password *
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="field"
              />
            </label>

            <button type="submit" className="btn btn-primary">
              {role === "SUPER_ADMIN" && !hasSuperAdmin
                ? "Initialize Super Admin & Continue"
                : `Sign In as ${
                    role === "PATIENT"
                      ? "Patient"
                      : role === "PHYSICIAN"
                        ? "Specialist"
                        : role === "HOSPITAL_ADMIN"
                          ? "Hospital Admin"
                          : "Super Admin"
                  }`}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-sm">
            <span>
              New patient?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Register & check heart health
              </Link>
            </span>
            <span>
              Healthcare provider?{" "}
              <Link to="/providers/apply" className="font-semibold text-primary hover:underline">
                <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                Apply to join network
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
