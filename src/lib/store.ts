import { isElevated, daysSince, computeRisk, type RiskCategory } from "./bp";

export type ClinicalBucket = "OUT_OF_CONTROL" | "DISENGAGED" | "STABLE";

export interface SuperAdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface HospitalOrg {
  id: string;
  name: string;
  county: string;
  licenseNumber: string;
  adminName?: string | undefined;
  adminEmail?: string | undefined;
  adminPassword?: string | undefined;
  status: "ACTIVE" | "PENDING";
  createdAt: string;
}

export interface ClinicianRecord {
  id: string;
  name: string;
  title: string;
  role: "CARDIOLOGIST" | "PHYSICIAN" | "NURSE_COORDINATOR" | "RESIDENT";
  kmpdcReg: string;
  hospitalId?: string | undefined;
  hospitalName: string;
  department: string;
  county: string;
  email: string;
  phone: string;
  password?: string | undefined;
  subspecialty: string;
  consultDays: string[];
  consultFormat: string[];
  consultationHours: string;
  canOnboardPatients: boolean;
  status: "ACTIVE" | "PENDING" | "RESTRICTED";
  acceptingNew: boolean;
  createdAt: string;
}

export interface BpReadingItem {
  id: string;
  patientId: string;
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  source: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
  ocr_confidence?: string | null;
}

export interface WeeklySymptomCheckin {
  id: string;
  patientId: string;
  loggedAt: string;
  headache: boolean;
  chestDiscomfort: boolean;
  dizziness: boolean;
  notes?: string | undefined;
}

export interface PatientConsent {
  doctorAccessGranted: boolean;
  hospitalAccessGranted: boolean;
  caregiverAccessGranted: boolean;
  updatedAt: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender?: string | undefined;
  phone: string;
  email?: string | undefined;
  password?: string | undefined;
  county: string;
  conditions: string[];
  comorbidityBadge: string;
  smokingStatus?: string | undefined;
  symptomsNarrative?: string | undefined;
  takingMeds?: boolean | undefined;
  currentRegimen?: string | undefined;
  hasHomeMonitor?: boolean | undefined;
  familyHistory?: boolean | undefined;
  riskCategory: RiskCategory;
  caregiverName?: string | undefined;
  caregiverPhone?: string | undefined;
  caregiverContact?: string | undefined;
  whatsappAlerts?: boolean | undefined;
  specialistId?: string | undefined;
  specialistName?: string | undefined;
  hospitalName?: string | undefined;
  latestBp: {
    systolic: number;
    diastolic: number;
    pulse?: number | undefined;
    measuredAt: string;
  } | null;
  contextNote: string;
  medicationAdherence: number;
  medsStreak: number;
  lastMedsLoggedDate?: string | undefined;
  walksCompleted: number;
  lastWalkLoggedDate?: string | undefined;
  bucket: ClinicalBucket;
  status: "OPEN" | "ACKNOWLEDGED";
  acknowledgedAt?: string | undefined;
  acknowledgedBy?: string | undefined;
  adjustedPlan?: string | undefined;
  adjustedPlanTarget?: string | undefined;
  adjustedPlanFollowUpDays?: string | undefined;
  adjustedPlanNote?: string | undefined;
  adjustedPlanAt?: string | undefined;
  adjustedBy?: string | undefined;
  consent: PatientConsent;
  createdAt: string;
}

export interface IncomingEnrollment {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  diagnoses: string;
  symptoms: string;
  caregiver: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  requestedAt: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface ActiveSession {
  role: "PATIENT" | "PHYSICIAN" | "HOSPITAL_ADMIN" | "SUPER_ADMIN";
  userId: string;
  name: string;
  email?: string | undefined;
  hospitalId?: string | undefined;
  hospitalName?: string | undefined;
}

const KEYS = {
  SUPER_ADMINS: "moyodoc_v2_super_admins",
  HOSPITALS: "moyodoc_v2_hospitals",
  CLINICIANS: "moyodoc_v2_clinicians",
  PATIENTS: "moyodoc_v2_patients",
  READINGS: "moyodoc_v2_readings",
  SYMPTOMS: "moyodoc_v2_symptoms",
  ENROLLMENTS: "moyodoc_v2_enrollments",
  SESSION: "moyodoc_v2_session",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("moyodoc:store_updated", { detail: { key } }));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
}

// --- Session ---
export function getSession(): ActiveSession | null {
  return readJson<ActiveSession | null>(KEYS.SESSION, null);
}

export function setSession(session: ActiveSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(KEYS.SESSION);
  } else {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
  }
  window.dispatchEvent(new CustomEvent("moyodoc:store_updated", { detail: { key: KEYS.SESSION } }));
}

// --- Super Admins ---
export function getSuperAdmins(): SuperAdminAccount[] {
  return readJson<SuperAdminAccount[]>(KEYS.SUPER_ADMINS, []);
}

export function registerSuperAdmin(input: {
  name: string;
  email: string;
  password: string;
}): SuperAdminAccount {
  const list = getSuperAdmins();
  const existing = list.find((a) => a.email.toLowerCase() === input.email.trim().toLowerCase());
  if (existing) return existing;
  const item: SuperAdminAccount = {
    id: `sadmin-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.SUPER_ADMINS, [...list, item]);
  return item;
}

export function authenticateSuperAdmin(
  email: string,
  password: string,
): { ok: true; admin: SuperAdminAccount } | { ok: false; error: string } {
  const list = getSuperAdmins();
  if (list.length === 0) {
    return {
      ok: false,
      error: "No Super Admin account has been initialized yet. Use 'Initialize Super Admin' below.",
    };
  }
  const match = list.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!match || match.password !== password) {
    return { ok: false, error: "Invalid Super Admin email or password." };
  }
  return { ok: true, admin: match };
}

// --- Hospitals (Enrolled by Super Admin) ---
export function getHospitals(): HospitalOrg[] {
  return readJson<HospitalOrg[]>(KEYS.HOSPITALS, []);
}

export function addHospital(input: {
  name: string;
  county: string;
  licenseNumber?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}): HospitalOrg {
  const list = getHospitals();
  const existingIdx = list.findIndex(
    (h) => h.name.toLowerCase() === input.name.trim().toLowerCase(),
  );
  if (existingIdx >= 0) {
    const existing = list[existingIdx];
    const updatedItem: HospitalOrg = {
      ...existing,
      county: input.county.trim() || existing.county,
      licenseNumber: input.licenseNumber?.trim() || existing.licenseNumber,
      adminName: input.adminName?.trim() || existing.adminName,
      adminEmail: input.adminEmail?.trim() || existing.adminEmail,
      adminPassword: input.adminPassword || existing.adminPassword,
    };
    const updated = [...list];
    updated[existingIdx] = updatedItem;
    writeJson(KEYS.HOSPITALS, updated);
    return updatedItem;
  }

  const item: HospitalOrg = {
    id: `hosp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    county: input.county.trim() || "Nairobi",
    licenseNumber:
      input.licenseNumber?.trim() || `MED-KE-${Math.floor(100 + Math.random() * 900)}`,
    adminName: input.adminName?.trim(),
    adminEmail: input.adminEmail?.trim(),
    adminPassword: input.adminPassword,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.HOSPITALS, [item, ...list]);
  return item;
}

export function authenticateHospitalAdmin(
  email: string,
  password: string,
): { ok: true; hospital: HospitalOrg } | { ok: false; error: string } {
  const list = getHospitals();
  if (list.length === 0) {
    return {
      ok: false,
      error: "No hospitals have been enrolled yet. A Super Admin must enroll the hospital first.",
    };
  }
  const match = list.find(
    (h) => h.adminEmail && h.adminEmail.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!match || !match.adminPassword || match.adminPassword !== password) {
    return {
      ok: false,
      error: "Invalid Hospital Admin email or password. Verify credentials issued by Super Admin.",
    };
  }
  return { ok: true, hospital: match };
}

// --- Clinicians / Specialists ---
export function getClinicians(): ClinicianRecord[] {
  return readJson<ClinicianRecord[]>(KEYS.CLINICIANS, []);
}

export function saveClinicians(list: ClinicianRecord[]) {
  writeJson(KEYS.CLINICIANS, list);
}

export function addOrUpdateClinician(input: {
  id?: string;
  name: string;
  title?: string;
  role?: ClinicianRecord["role"];
  kmpdcReg: string;
  hospitalName: string;
  department?: string;
  county?: string;
  email?: string;
  phone?: string;
  password?: string;
  subspecialty?: string;
  consultDays?: string[];
  consultFormat?: string[];
  consultationHours?: string;
  status?: ClinicianRecord["status"];
}): ClinicianRecord {
  const hospitals = getHospitals();
  const matchedHosp = hospitals.find(
    (h) => h.name.toLowerCase() === input.hospitalName.trim().toLowerCase(),
  );
  const hospitalId = matchedHosp?.id;

  const list = getClinicians();
  const existingIdx = list.findIndex(
    (c) =>
      (input.id && c.id === input.id) ||
      c.kmpdcReg.toLowerCase() === input.kmpdcReg.trim().toLowerCase() ||
      (input.email && c.email && c.email.toLowerCase() === input.email.trim().toLowerCase()),
  );

  const existing = existingIdx >= 0 ? list[existingIdx] : null;

  const record: ClinicianRecord = {
    id:
      existing?.id ||
      input.id ||
      `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    title: input.title?.trim() || existing?.title || "Consultant Cardiologist",
    role: input.role || existing?.role || "CARDIOLOGIST",
    kmpdcReg: input.kmpdcReg.trim(),
    hospitalId: hospitalId || existing?.hospitalId,
    hospitalName: input.hospitalName.trim(),
    department: input.department?.trim() || existing?.department || "Cardiology & Internal Medicine",
    county: input.county?.trim() || matchedHosp?.county || existing?.county || "Nairobi",
    email: input.email?.trim() ?? existing?.email ?? "",
    phone: input.phone?.trim() ?? existing?.phone ?? "",
    password: input.password || existing?.password,
    subspecialty:
      input.subspecialty?.trim() || existing?.subspecialty || "Hypertension & Cardiovascular Care",
    consultDays:
      input.consultDays !== undefined
        ? input.consultDays
        : existing?.consultDays || ["Mon", "Wed", "Fri"],
    consultFormat:
      input.consultFormat !== undefined
        ? input.consultFormat
        : existing?.consultFormat || ["In-person", "Virtual"],
    consultationHours: input.consultationHours || existing?.consultationHours || "09:00–17:00",
    canOnboardPatients: existing ? existing.canOnboardPatients : true,
    status: input.status || existing?.status || "ACTIVE",
    acceptingNew: true,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    const updated = [...list];
    updated[existingIdx] = record;
    writeJson(KEYS.CLINICIANS, updated);
  } else {
    writeJson(KEYS.CLINICIANS, [record, ...list]);
  }
  return record;
}

export function authenticateClinician(
  identifier: string,
  password: string,
): { ok: true; clinician: ClinicianRecord } | { ok: false; error: string } {
  const q = identifier.trim().toLowerCase();
  if (!q || !password) {
    return { ok: false, error: "Both email/KMPDC number and password are required." };
  }
  const list = getClinicians();
  const match = list.find(
    (c) =>
      (c.email && c.email.toLowerCase() === q) ||
      c.kmpdcReg.toLowerCase() === q ||
      (c.phone && c.phone.trim() === identifier.trim()),
  );
  if (!match) {
    return {
      ok: false,
      error: "No registered specialist found with that email or KMPDC license number.",
    };
  }
  if (!match.password || match.password !== password) {
    return {
      ok: false,
      error: "Incorrect password for this specialist account.",
    };
  }
  if (match.status === "PENDING") {
    return {
      ok: false,
      error: `Your application at ${match.hospitalName} is awaiting verification by the Hospital Admin.`,
    };
  }
  if (match.status === "RESTRICTED") {
    return {
      ok: false,
      error: `Your clinical panel access at ${match.hospitalName} has been restricted by the Hospital Admin.`,
    };
  }
  return { ok: true, clinician: match };
}

// --- Readings & Dynamic Patient Status ---
export function getAllReadings(): BpReadingItem[] {
  return readJson<BpReadingItem[]>(KEYS.READINGS, []);
}

export function getPatientReadings(patientId: string): BpReadingItem[] {
  if (!patientId) return [];
  return getAllReadings()
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at));
}

export function computePatientBucketAndContext(
  readings: BpReadingItem[],
  medicationAdherence: number,
  medsStreak: number,
): {
  bucket: ClinicalBucket;
  contextNote: string;
  latestBp: PatientRecord["latestBp"];
} {
  if (readings.length === 0) {
    return {
      bucket: "DISENGAGED",
      contextNote: "No BP readings logged yet · Awaiting baseline reading",
      latestBp: null,
    };
  }

  const latest = readings[readings.length - 1];
  const days = daysSince(latest.measured_at);
  const last5 = readings.slice(-5);
  const elevatedCount = last5.filter((r) => isElevated(r)).length;

  const latestBp: PatientRecord["latestBp"] = {
    systolic: latest.systolic,
    diastolic: latest.diastolic,
    pulse: latest.pulse ?? undefined,
    measuredAt: new Date(latest.measured_at).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  if (days !== null && days >= 14) {
    return {
      bucket: "DISENGAGED",
      contextNote: `No BP readings in ${days} days · Medication ${medicationAdherence}%`,
      latestBp,
    };
  }

  // Elevated if 2+ of last 5 readings are >= 140/90, or if the only reading logged so far is >= 140/90
  if (elevatedCount >= 2 || (readings.length === 1 && elevatedCount === 1)) {
    return {
      bucket: "OUT_OF_CONTROL",
      contextNote: `${elevatedCount} of last ${last5.length} BP readings ≥ 140/90 mmHg · Adherence ${medicationAdherence}%`,
      latestBp,
    };
  }

  return {
    bucket: "STABLE",
    contextNote: `Within target range · Streak ${medsStreak} day${medsStreak === 1 ? "" : "s"}`,
    latestBp,
  };
}

// --- Patients ---
export function getPatients(): PatientRecord[] {
  return readJson<PatientRecord[]>(KEYS.PATIENTS, []);
}

export function savePatients(patients: PatientRecord[]) {
  writeJson(KEYS.PATIENTS, patients);
}

export function addOrUpdatePatient(input: {
  id?: string;
  name: string;
  age: number;
  gender?: string;
  phone: string;
  email?: string;
  password?: string;
  county: string;
  conditions: string[];
  smokingStatus?: string;
  symptomsNarrative?: string;
  takingMeds?: boolean;
  currentRegimen?: string;
  hasHomeMonitor?: boolean;
  familyHistory?: boolean;
  caregiverName?: string;
  caregiverPhone?: string;
  whatsappAlerts?: boolean;
  specialistId?: string;
  specialistName?: string;
  hospitalName?: string;
  baselineReading?: { systolic: number; diastolic: number; pulse?: number } | null;
}): PatientRecord {
  const list = getPatients();
  const existingIdx = list.findIndex(
    (p) =>
      (input.id && p.id === input.id) ||
      (input.phone && p.phone.trim() === input.phone.trim()) ||
      (input.email && p.email?.toLowerCase() === input.email.trim().toLowerCase()),
  );

  const patientId =
    existingIdx >= 0
      ? list[existingIdx].id
      : input.id || `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const hasDiabetes = input.conditions.some((c) => c.toLowerCase().includes("diabetes"));
  const hasHypertension = input.conditions.some(
    (c) => c.toLowerCase().includes("hypertension") || c.toLowerCase().includes("htn"),
  );

  const riskCategory = computeRisk({
    age: input.age,
    hasDiabetes,
    hasHypertension,
    hasFamilyHistory: input.familyHistory,
  });

  const conditions = input.conditions.length > 0 ? input.conditions : ["General CV Check"];
  const comorbidityBadge = conditions.join(" + ");

  const caregiverContact =
    input.caregiverName && input.caregiverPhone
      ? `${input.caregiverName} (${input.caregiverPhone})`
      : input.caregiverName || input.caregiverPhone || undefined;

  const existing = existingIdx >= 0 ? list[existingIdx] : null;
  const medsStreak = existing?.medsStreak ?? 0;
  const medicationAdherence = existing?.medicationAdherence ?? 0;
  const walksCompleted = existing?.walksCompleted ?? 0;

  let readings = getPatientReadings(patientId);
  if (
    input.baselineReading &&
    input.baselineReading.systolic > 0 &&
    input.baselineReading.diastolic > 0
  ) {
    const newReading: BpReadingItem = {
      id: `reading-${Date.now()}`,
      patientId,
      measured_at: new Date().toISOString(),
      systolic: input.baselineReading.systolic,
      diastolic: input.baselineReading.diastolic,
      pulse: input.baselineReading.pulse ?? 72,
      source: "MANUAL",
      ocr_confidence: "MANUAL",
    };
    const allReadings = getAllReadings();
    writeJson(KEYS.READINGS, [...allReadings, newReading]);
    readings = [...readings, newReading];
  }

  const computed = computePatientBucketAndContext(readings, medicationAdherence, medsStreak);

  const record: PatientRecord = {
    id: patientId,
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone: input.phone.trim(),
    email: input.email?.trim() || existing?.email,
    password: input.password || existing?.password,
    county: input.county.trim() || "Nairobi",
    conditions,
    comorbidityBadge,
    smokingStatus: input.smokingStatus,
    symptomsNarrative: input.symptomsNarrative,
    takingMeds: input.takingMeds,
    currentRegimen: input.currentRegimen,
    hasHomeMonitor: input.hasHomeMonitor,
    familyHistory: input.familyHistory,
    riskCategory,
    caregiverName: input.caregiverName,
    caregiverPhone: input.caregiverPhone,
    caregiverContact,
    whatsappAlerts: input.whatsappAlerts ?? true,
    specialistId: input.specialistId ?? existing?.specialistId,
    specialistName: input.specialistName ?? existing?.specialistName,
    hospitalName: input.hospitalName ?? existing?.hospitalName,
    latestBp: computed.latestBp,
    contextNote: computed.contextNote,
    medicationAdherence,
    medsStreak,
    lastMedsLoggedDate: existing?.lastMedsLoggedDate,
    walksCompleted,
    lastWalkLoggedDate: existing?.lastWalkLoggedDate,
    bucket: computed.bucket,
    status: "OPEN",
    acknowledgedAt: existing?.acknowledgedAt,
    acknowledgedBy: existing?.acknowledgedBy,
    adjustedPlan: existing?.adjustedPlan,
    adjustedPlanTarget: existing?.adjustedPlanTarget,
    adjustedPlanFollowUpDays: existing?.adjustedPlanFollowUpDays,
    adjustedPlanNote: existing?.adjustedPlanNote,
    adjustedPlanAt: existing?.adjustedPlanAt,
    adjustedBy: existing?.adjustedBy,
    consent: existing?.consent ?? {
      doctorAccessGranted: true,
      hospitalAccessGranted: true,
      caregiverAccessGranted: true,
      updatedAt: new Date().toISOString(),
    },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    const updated = [...list];
    updated[existingIdx] = record;
    savePatients(updated);
  } else {
    savePatients([record, ...list]);
  }

  return record;
}

export function authenticatePatient(
  identifier: string,
  password: string,
): { ok: true; patient: PatientRecord } | { ok: false; error: string } {
  const q = identifier.trim().toLowerCase();
  if (!q || !password) {
    return { ok: false, error: "Both phone/email and password are required." };
  }
  const list = getPatients();
  const match = list.find(
    (p) =>
      p.phone.trim().toLowerCase() === q ||
      (p.email && p.email.toLowerCase() === q),
  );
  if (!match) {
    return {
      ok: false,
      error: "No registered patient account found with that phone number or email.",
    };
  }
  if (!match.password || match.password !== password) {
    return {
      ok: false,
      error: "Incorrect password for this patient account.",
    };
  }
  return { ok: true, patient: match };
}

export function logPatientBpReading(input: {
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  source: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
  confidence?: string;
}): BpReadingItem[] {
  const newItem: BpReadingItem = {
    id: `reading-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId: input.patientId,
    measured_at: new Date().toISOString(),
    systolic: input.systolic,
    diastolic: input.diastolic,
    pulse: input.pulse ?? null,
    source: input.source,
    ocr_confidence: input.confidence ?? null,
  };

  const all = [...getAllReadings(), newItem];
  writeJson(KEYS.READINGS, all);

  // Recompute patient's latestBp, bucket, and reopen alert if new reading is out of control
  const patients = getPatients();
  const updatedPatients = patients.map((p) => {
    if (p.id !== input.patientId) return p;
    const pReadings = all
      .filter((r) => r.patientId === p.id)
      .sort((a, b) => a.measured_at.localeCompare(b.measured_at));
    const computed = computePatientBucketAndContext(
      pReadings,
      p.medicationAdherence,
      p.medsStreak,
    );
    return {
      ...p,
      latestBp: computed.latestBp,
      bucket: computed.bucket,
      contextNote: computed.contextNote,
      // Re-open alert if a new elevated reading puts them in OUT_OF_CONTROL
      status: isElevated(newItem) ? ("OPEN" as const) : p.status,
    };
  });
  savePatients(updatedPatients);

  return all.filter((r) => r.patientId === input.patientId);
}

export function logPatientAdherence(
  patientId: string,
  update: { medsTaken?: boolean; walkCompleted?: boolean },
): PatientRecord | null {
  const today = new Date().toISOString().slice(0, 10);
  const patients = getPatients();
  let updatedRecord: PatientRecord | null = null;

  const updated = patients.map((p) => {
    if (p.id !== patientId) return p;

    let medsStreak = p.medsStreak;
    let lastMedsLoggedDate = p.lastMedsLoggedDate;
    let medicationAdherence = p.medicationAdherence;

    if (update.medsTaken !== undefined) {
      if (update.medsTaken) {
        if (lastMedsLoggedDate !== today) {
          medsStreak = medsStreak + 1;
          lastMedsLoggedDate = today;
        }
        medicationAdherence = Math.min(100, Math.max(medicationAdherence, Math.round((medsStreak / 7) * 100)));
      } else {
        if (lastMedsLoggedDate === today) {
          medsStreak = Math.max(0, medsStreak - 1);
          lastMedsLoggedDate = undefined;
        }
        medicationAdherence = Math.round((medsStreak / 7) * 100);
      }
    }

    let walksCompleted = p.walksCompleted;
    let lastWalkLoggedDate = p.lastWalkLoggedDate;
    if (update.walkCompleted !== undefined) {
      if (update.walkCompleted && lastWalkLoggedDate !== today) {
        walksCompleted = Math.min(7, walksCompleted + 1);
        lastWalkLoggedDate = today;
      } else if (!update.walkCompleted && lastWalkLoggedDate === today) {
        walksCompleted = Math.max(0, walksCompleted - 1);
        lastWalkLoggedDate = undefined;
      }
    }

    const pReadings = getPatientReadings(p.id);
    const computed = computePatientBucketAndContext(pReadings, medicationAdherence, medsStreak);

    updatedRecord = {
      ...p,
      medsStreak,
      lastMedsLoggedDate,
      medicationAdherence,
      walksCompleted,
      lastWalkLoggedDate,
      contextNote: computed.contextNote,
      bucket: computed.bucket,
    };
    return updatedRecord;
  });

  savePatients(updated);
  return updatedRecord;
}

export function updatePatientConsent(
  patientId: string,
  consent: Partial<PatientConsent>,
): PatientRecord | null {
  const patients = getPatients();
  let updatedRecord: PatientRecord | null = null;
  const updated = patients.map((p) => {
    if (p.id !== patientId) return p;
    updatedRecord = {
      ...p,
      consent: {
        ...p.consent,
        ...consent,
        updatedAt: new Date().toISOString(),
      },
    };
    return updatedRecord;
  });
  savePatients(updated);
  return updatedRecord;
}

// --- Weekly Symptoms ---
export function getSymptomCheckins(patientId?: string): WeeklySymptomCheckin[] {
  const all = readJson<WeeklySymptomCheckin[]>(KEYS.SYMPTOMS, []);
  if (!patientId) return all;
  return all.filter((s) => s.patientId === patientId);
}

export function logWeeklySymptoms(input: {
  patientId: string;
  headache: boolean;
  chestDiscomfort: boolean;
  dizziness: boolean;
  notes?: string;
}): WeeklySymptomCheckin {
  const all = getSymptomCheckins();
  const item: WeeklySymptomCheckin = {
    id: `sym-${Date.now()}`,
    patientId: input.patientId,
    loggedAt: new Date().toISOString(),
    headache: input.headache,
    chestDiscomfort: input.chestDiscomfort,
    dizziness: input.dizziness,
    notes: input.notes,
  };
  writeJson(KEYS.SYMPTOMS, [item, ...all]);
  return item;
}

// --- Enrollments (Door 1 -> Door 2) ---
export function getEnrollmentRequests(): IncomingEnrollment[] {
  return readJson<IncomingEnrollment[]>(KEYS.ENROLLMENTS, []);
}

export function createEnrollmentRequest(input: {
  patient: PatientRecord;
  specialist: ClinicianRecord;
}): IncomingEnrollment {
  const list = getEnrollmentRequests();
  const item: IncomingEnrollment = {
    id: `req-${Date.now()}`,
    patientId: input.patient.id,
    patientName: input.patient.name,
    age: `${input.patient.age}y`,
    diagnoses: input.patient.conditions.join(", "),
    symptoms: input.patient.symptomsNarrative || "None reported",
    caregiver: input.patient.caregiverName || "None registered",
    phone: input.patient.caregiverPhone || input.patient.phone,
    doctorId: input.specialist.id,
    doctorName: input.specialist.name,
    hospital: input.specialist.hospitalName,
    requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "PENDING",
  };
  writeJson(KEYS.ENROLLMENTS, [item, ...list]);
  return item;
}

export function respondToEnrollmentRequest(
  requestId: string,
  decision: "ACCEPTED" | "DECLINED",
) {
  const requests = getEnrollmentRequests();
  const target = requests.find((r) => r.id === requestId);
  const updatedRequests = requests.map((r) =>
    r.id === requestId ? { ...r, status: decision } : r,
  );
  writeJson(KEYS.ENROLLMENTS, updatedRequests);

  if (target && decision === "ACCEPTED") {
    const patients = getPatients();
    const updatedPatients = patients.map((p) =>
      p.id === target.patientId
        ? {
            ...p,
            specialistId: target.doctorId,
            specialistName: target.doctorName,
            hospitalName: target.hospital,
          }
        : p,
    );
    savePatients(updatedPatients);
  }
}

// --- Clear All Data ---
export function clearAllMoyoDocData() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent("moyodoc:store_updated", { detail: { key: "ALL" } }));
}
