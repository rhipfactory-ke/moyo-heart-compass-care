import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, CheckCircle2, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";
import {
  addOrUpdateClinician,
  getHospitals,
  type ClinicianRecord,
  type HospitalOrg,
} from "@/lib/store";

export const Route = createFileRoute("/providers/apply")({
  head: () =>
    seo(
      "Join the MoyoDoc Provider Network | MoyoDoc",
      "Cardiologists, internists and qualified cardiovascular practitioners in Kenya can apply to join the MoyoDoc provider network.",
    ),
  component: Apply,
});

function Apply() {
  const [done, setDone] = useState(false);
  const [createdDoc, setCreatedDoc] = useState<ClinicianRecord | null>(null);
  const [hospitals, setHospitals] = useState<HospitalOrg[]>([]);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [reg, setReg] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [county, setCounty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [practice, setPractice] = useState("");
  const [consultDays, setConsultDays] = useState<string[]>([]);
  const [consultFormat, setConsultFormat] = useState<string[]>([]);
  const [hoursFrom, setHoursFrom] = useState("09:00");
  const [hoursTo, setHoursTo] = useState("17:00");

  useEffect(() => {
    const sync = () => {
      const h = getHospitals();
      setHospitals(h);
      if (h.length > 0 && !affiliation) {
        setAffiliation(h[0].name);
        setCounty(h[0].county);
      }
    };
    sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, [affiliation]);

  const toggleDay = (day: string) => {
    setConsultDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleFormat = (fmt: string) => {
    setConsultFormat((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt],
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!affiliation.trim()) {
      toast.error("Please select an enrolled hospital facility.");
      return;
    }
    if (consultDays.length === 0 || consultFormat.length === 0) {
      toast.error("Please tick at least one consultation day and consultation format.");
      return;
    }

    const doc = addOrUpdateClinician({
      name: name.trim(),
      title: title.trim() || "Consultant Cardiologist",
      role: "CARDIOLOGIST",
      kmpdcReg: reg.trim(),
      hospitalName: affiliation.trim(),
      county: county.trim() || "Nairobi",
      email: email.trim(),
      phone: phone.trim(),
      password,
      subspecialty: practice.trim() || title.trim() || "Hypertension & Cardiovascular Care",
      consultDays,
      consultFormat,
      consultationHours: `${hoursFrom}–${hoursTo}`,
      status: "PENDING",
    });

    setCreatedDoc(doc);
    setDone(true);
    toast.success(
      `Application submitted for ${doc.name}! Pending KMPDC verification by ${doc.hospitalName} Admin.`,
    );
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <PageHero eyebrow="For cardiovascular healthcare professionals" title="Apply to join MoyoDoc">
        For cardiologists, internists and qualified cardiovascular practitioners in Kenya.
      </PageHero>
      <section className="mx-auto max-w-2xl px-5 pb-24">
        {done ? (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-soft" role="status">
            <CheckCircle2 className="mx-auto h-12 w-12 text-health" />
            <h2 className="mt-4 text-2xl font-bold">
              Application Received, {createdDoc?.name}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Your specialist profile (<span className="font-mono font-semibold">{createdDoc?.kmpdcReg}</span>) has been submitted to{" "}
              <span className="font-semibold text-wine">{createdDoc?.hospitalName}</span> for
              Hospital Admin KMPDC verification. Once approved by your Hospital Administrator, you
              can sign in at <span className="font-semibold">/login</span> using your email and
              password.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn btn-primary">
                Go to Sign In <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <form
            className="grid gap-5 rounded-3xl border bg-card p-8 shadow-soft"
            onSubmit={handleSubmit}
          >
            {hospitals.length === 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                <div>
                  <span className="font-bold">Hospital Enrollment Required First:</span> No partner
                  hospitals have been enrolled yet. Please have the{" "}
                  <Link to="/login" className="font-bold underline">
                    Super Admin
                  </Link>{" "}
                  enroll your hospital facility first so you can affiliate with it.
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Full name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="field"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Professional title / specialty *
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Consultant Cardiologist"
                  className="field"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Medical registration number (KMPDC) *
                <input
                  required
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  placeholder="e.g. KMPDC-A8492"
                  className="field"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Enrolled Hospital Affiliation *
                {hospitals.length > 0 ? (
                  <select
                    required
                    value={affiliation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAffiliation(val);
                      const found = hospitals.find((h) => h.name === val);
                      if (found) setCounty(found.county);
                    }}
                    className="field"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} ({h.county})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="e.g. Nairobi Heart Institute"
                    className="field"
                  />
                )}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                County / location *
                <input
                  required
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="e.g. Nairobi"
                  className="field"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Phone number *
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 711 234 567"
                  className="field"
                />
              </label>
            </div>

            {/* Consultation Days with Clear Tick Checkboxes */}
            <div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
              <div className="text-sm font-semibold text-wine">
                Clinic Consultation Days *{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Tick all days you are available)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const selected = consultDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        selected
                          ? "border-primary bg-blush text-primary shadow-xs"
                          : "border-border bg-white text-foreground/80 hover:border-primary/40"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 pt-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-wine">
                    Consultation Format *{" "}
                    <span className="text-xs font-normal text-muted-foreground">(Tick)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["In-person", "Virtual"].map((fmt) => {
                      const selected = consultFormat.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => toggleFormat(fmt)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            selected
                              ? "border-primary bg-blush text-primary shadow-xs"
                              : "border-border bg-white text-foreground/80 hover:border-primary/40"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              selected
                                ? "border-primary bg-primary text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-wine">Consultation Hours</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hoursFrom}
                      onChange={(e) => setHoursFrom(e.target.value)}
                      className="field py-2 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={hoursTo}
                      onChange={(e) => setHoursTo(e.target.value)}
                      className="field py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Work email (for login) *
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. dr.janedoe@hospital.co.ke"
                  className="field bg-white"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Create account password *
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="field bg-white"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-medium">
              Brief description of practice (optional)
              <textarea
                rows={3}
                value={practice}
                onChange={(e) => setPractice(e.target.value)}
                placeholder="e.g. Outpatient hypertension clinic, resistant HTN titration, and remote patient telemetry..."
                className="field"
              />
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input required type="checkbox" className="mt-1 accent-primary" />I confirm my KMPDC
              registration is active and consent to verification by my affiliated Hospital
              Administrator.
            </label>

            <button className="btn btn-primary">Submit Provider Application</button>
          </form>
        )}
      </section>
    </>
  );
}
