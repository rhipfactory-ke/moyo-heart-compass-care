import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Building2,
  ArrowRight,
  Stethoscope,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";
import { RISK_LABEL } from "@/lib/bp";
import {
  addOrUpdatePatient,
  getClinicians,
  createEnrollmentRequest,
  setSession,
  type PatientRecord,
  type ClinicianRecord,
} from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () =>
    seo(
      "Check My Heart Health | MoyoDoc Patient Registration",
      "Register with MoyoDoc, give consent and complete a short cardiovascular health intake to start your connected blood pressure care journey.",
    ),
  component: Register,
});

const steps = ["Your details", "Consent", "Health intake", "Risk summary & connect"];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0 fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [county, setCounty] = useState("");
  const [age, setAge] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");

  // Step 2 fields
  const [dx, setDx] = useState<string>("");
  const [diabetes, setDiabetes] = useState<string>("");
  const [meds, setMeds] = useState<string>("");
  const [fam, setFam] = useState<string>("");
  const [monitor, setMonitor] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [baselineSys, setBaselineSys] = useState("");
  const [baselineDia, setBaselineDia] = useState("");

  const [createdPatient, setCreatedPatient] = useState<PatientRecord | null>(null);
  const [clinicians, setClinicians] = useState<ClinicianRecord[]>([]);
  const [requestedDocId, setRequestedDocId] = useState<string | null>(null);

  useEffect(() => {
    setClinicians(getClinicians().filter((c) => c.status === "ACTIVE" && c.canOnboardPatients));
  }, [step]);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      const conditions: string[] = [];
      if (dx === "Yes") conditions.push("Hypertension");
      if (diabetes === "Yes") conditions.push("Type 2 Diabetes");

      const sys = parseInt(baselineSys, 10);
      const dia = parseInt(baselineDia, 10);

      const record = addOrUpdatePatient({
        name: fullName.trim(),
        age: parseInt(age, 10) || 45,
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        county: county.trim() || "Nairobi",
        conditions,
        takingMeds: meds === "Yes",
        hasHomeMonitor: monitor === "Yes",
        familyHistory: fam === "Yes",
        symptomsNarrative: symptoms.trim() || undefined,
        caregiverName: caregiverName.trim() || undefined,
        caregiverPhone: caregiverPhone.trim() || undefined,
        baselineReading:
          !isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0
            ? { systolic: sys, diastolic: dia }
            : null,
      });

      setSession({
        role: "PATIENT",
        userId: record.id,
        name: record.name,
        email: record.email,
      });

      setCreatedPatient(record);
      toast.success("Cardiovascular health intake saved!");
    }
    setStep((s) => s + 1);
  };

  const handleRequestSpecialist = (doc: ClinicianRecord) => {
    if (!createdPatient) return;
    createEnrollmentRequest({ patient: createdPatient, specialist: doc });
    setRequestedDocId(doc.id);
    toast.success(`Enrollment request sent to ${doc.name} at ${doc.hospitalName}!`);
  };

  return (
    <>
      <PageHero eyebrow="Patient registration" title="Check my heart health">
        A healthier tomorrow starts with understanding your numbers.
      </PageHero>
      <section className="mx-auto max-w-2xl px-5 pb-24">
        <ol className="mb-8 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              <p
                className={`mt-2 text-xs font-semibold ${
                  i <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s}
              </p>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          {step === 0 && (
            <form className="grid gap-5" onSubmit={next}>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                  Full name
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="field"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Age (years)
                  <input
                    required
                    type="number"
                    min={18}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 52"
                    className="field"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Phone number
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="field"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  County
                  <input
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="e.g. Nairobi"
                    className="field"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Email (optional)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jane.doe@example.com"
                    className="field"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Create Password *
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create login password"
                    className="field"
                  />
                </label>
              </div>
              <div className="grid gap-4 rounded-2xl border bg-muted/40 p-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium">
                  Moyo Contact / Care Supporter Name (optional)
                  <input
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="e.g. John Doe (Spouse / Supporter)"
                    className="field"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium">
                  Moyo Contact / Care Supporter Phone (optional)
                  <input
                    type="tel"
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    placeholder="e.g. +254 722 987 654"
                    className="field"
                  />
                </label>
              </div>
              <button className="btn btn-primary">Continue</button>
            </form>
          )}
          {step === 1 && (
            <form className="grid gap-5" onSubmit={next}>
              <h2 className="text-xl font-bold">Your consent matters</h2>
              <p className="text-muted-foreground">
                MoyoDoc shares your health information only with the specialist you choose to
                connect with, and only with your explicit consent.
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input required type="checkbox" className="mt-1 accent-primary" />I consent to
                MoyoDoc collecting and processing my health information to support my care.
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input required type="checkbox" className="mt-1 accent-primary" />I understand
                MoyoDoc does not diagnose conditions, prescribe medication or provide emergency
                services.
              </label>
              <button className="btn btn-primary">I agree, continue</button>
            </form>
          )}
          {step === 2 && (
            <form className="grid gap-5" onSubmit={next}>
              <h2 className="text-xl font-bold">A few questions about your heart health</h2>
              <Choice
                name="dx"
                q="Have you been diagnosed with high blood pressure?"
                opts={["Yes", "No", "Not sure"]}
                value={dx}
                onChange={setDx}
              />
              <Choice
                name="diabetes"
                q="Have you been diagnosed with diabetes?"
                opts={["Yes", "No", "Not sure"]}
                value={diabetes}
                onChange={setDiabetes}
              />
              <Choice
                name="meds"
                q="Are you currently taking blood pressure medication?"
                opts={["Yes", "No"]}
                value={meds}
                onChange={setMeds}
              />
              <Choice
                name="fam"
                q="Does anyone in your close family have high blood pressure or heart disease?"
                opts={["Yes", "No", "Not sure"]}
                value={fam}
                onChange={setFam}
              />
              <Choice
                name="monitor"
                q="Do you have a home blood pressure monitor?"
                opts={["Yes", "No"]}
                value={monitor}
                onChange={setMonitor}
              />
              <div className="grid gap-3 rounded-2xl border bg-muted/40 p-4 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-medium">
                  Recent Systolic BP (mmHg, optional)
                  <input
                    type="number"
                    min={50}
                    max={300}
                    value={baselineSys}
                    onChange={(e) => setBaselineSys(e.target.value)}
                    placeholder="e.g. 145"
                    className="field"
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Recent Diastolic BP (mmHg, optional)
                  <input
                    type="number"
                    min={30}
                    max={200}
                    value={baselineDia}
                    onChange={(e) => setBaselineDia(e.target.value)}
                    placeholder="e.g. 92"
                    className="field"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium">
                Current symptoms or notes (optional)
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe any headaches, dizziness, or concerns..."
                  className="field"
                />
              </label>
              <button className="btn btn-primary">Submit intake</button>
            </form>
          )}
          {step === 3 && (
            <div className="space-y-6" role="status">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-health" />
                <h2 className="mt-4 text-2xl font-bold">
                  Thank you, {createdPatient?.name} — your intake has been received.
                </h2>
                <div className="mx-auto mt-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <Activity className="h-4 w-4 text-amber-600" />
                    Cardiovascular Risk Summary:{" "}
                    {createdPatient ? RISK_LABEL[createdPatient.riskCategory] : "Assessed"}
                  </div>
                  <p className="mt-1 text-xs text-amber-800">
                    This plain-language summary is not a medical diagnosis. Connecting with an enlisted cardiovascular specialist helps calibrate your targets and monitor your home readings.
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-wine">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Enlisted Cardiovascular Specialists
                </h3>
                {clinicians.length === 0 ? (
                  <p className="rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
                    No specialists have been registered yet. You can onboard a specialist via{" "}
                    <Link to="/providers/apply" className="font-semibold text-primary underline">
                      Provider Application
                    </Link>{" "}
                    and connect anytime from your Patient Companion dashboard.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {clinicians.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
                      >
                        <div>
                          <p className="font-bold text-wine">{doc.name}</p>
                          <p className="text-xs text-primary">{doc.title}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {doc.hospitalName} · {doc.county}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRequestSpecialist(doc)}
                          disabled={requestedDocId === doc.id}
                          className="btn btn-outline py-2 px-4 text-xs"
                        >
                          {requestedDocId === doc.id
                            ? "Enrollment Requested ✓"
                            : "Request to Connect"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/patient",
                      search: { patientId: createdPatient?.id },
                    })
                  }
                  className="btn btn-primary"
                >
                  Open My Patient Companion <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/" className="btn btn-outline">
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Choice({
  name,
  q,
  opts,
  value,
  onChange,
}: {
  name: string;
  q: string;
  opts: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{q}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opts.map((o) => (
          <label
            key={o}
            className="cursor-pointer rounded-full border px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-blush has-[:checked]:text-primary"
          >
            <input
              required
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="sr-only"
            />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
