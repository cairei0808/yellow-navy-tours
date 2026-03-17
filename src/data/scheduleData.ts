// Room Schedule Data for FABINHS - Building 1 (Pavilion 1)
// SY 2025-2026, 2nd Semester

export interface ScheduleEntry {
  subject: string;
  teacher: string;
  color: string;
}

export interface RoomSchedule {
  section: string;
  adviser: string;
  schedule: Record<string, Record<string, ScheduleEntry>>;
}

export type RoomScheduleMap = Record<string, RoomSchedule>;

const DAYS = ["M", "T", "W", "Th", "F"] as const;
export { DAYS };

export const TIME_SLOTS = [
  "6:45-7:00",
  "7:00-8:00",
  "8:00-9:00",
  "9:00-10:00",
  "10:00-10:20",
  "10:20-11:20",
  "11:20-12:20",
  "12:20-1:20",
  "1:20-2:20",
] as const;

// Subject color map for consistency
const C = {
  FLAG: "#9ca3af",
  HGP: "#ef4444",
  ECOM: "#f97316",
  KOM: "#84cc16",
  CC1: "#a855f7",
  GSCI: "#22c55e",
  GMATH: "#3b82f6",
  KAS: "#eab308",
  LIFE: "#94a3b8",
  PIL: "#14b8a6",
  BREAK: "#d1d5db",
  CHEM2: "#dc2626",
  CC2: "#c084fc",
  MABISA: "#f472b6",
  FIN2: "#6366f1",
  PHYS2: "#0ea5e9",
  // Grade 12 subjects
  IMM: "#7c3aed",
  CSS4: "#0d9488",
  EMPTECH: "#d97706",
  RESPR: "#2563eb",
  ENTREP: "#059669",
  POLITICS: "#b91c1c",
  CESAC: "#7e22ce",
  CNF: "#c2410c",
  TRENDS: "#0891b2",
  CULM: "#4f46e5",
  HOPE4: "#16a34a",
  PHYSCI: "#ea580c",
};

const flag = (t = ""): ScheduleEntry => ({ subject: "Flag Ceremony / Classroom Mgt.", teacher: t, color: C.FLAG });
const brk = (label: string): ScheduleEntry => ({ subject: label, teacher: "", color: C.BREAK });

export const roomSchedules: RoomScheduleMap = {

  // ═══════════════════════════════════════
  // ROOM 101 — G11-01 (P1)
  // ═══════════════════════════════════════
  "B1-101": {
    section: "G11-01 (P1)",
    adviser: "Rose Ann L. Dela Peña",
    schedule: {
      "6:45-7:00": {
        M: flag(), T: flag(), W: flag(), Th: flag(), F: flag(),
      },
      "7:00-8:00": {
        M:  { subject: "HGP", teacher: "Ms. De La Peña", color: C.HGP },
        T:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        W:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        Th: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: C.KOM },
        F:  { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: C.KOM },
      },
      "8:00-9:00": {
        M:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        T:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        W:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        Th: { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        F:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
      },
      "9:00-10:00": {
        M:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        T:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        W:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        Th: { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        F:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
      },
      "10:00-10:20": {
        M: brk("Recess"), T: brk("Recess"), W: brk("Recess"), Th: brk("Recess"), F: brk("Recess"),
      },
      "10:20-11:20": {
        M:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        T:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        W:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        Th: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        F:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
      },
      "11:20-12:20": {
        M:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        T:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        W:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        Th: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        F:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
      },
      "12:20-1:20": {
        M: brk("Lunch"), T: brk("Lunch"), W: brk("Lunch"), Th: brk("Lunch"), F: brk("Lunch"),
      },
      "1:20-2:20": {
        M:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Rose", color: C.PIL },
        T:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Rose", color: C.PIL },
        W:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Rose", color: C.PIL },
        Th: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Rose", color: C.PIL },
        F:  brk("—"),
      },
    },
  },

  // ═══════════════════════════════════════
  // ROOM 102 — G11-02 (P1)
  // ═══════════════════════════════════════
  "B1-102": {
    section: "G11-02 (P1)",
    adviser: "Christene R. Llanes",
    schedule: {
      "6:45-7:00": {
        M: flag(), T: flag(), W: flag(), Th: flag(), F: flag(),
      },
      "7:00-8:00": {
        M:  { subject: "HGP", teacher: "Ms. Llanes", color: C.HGP },
        T:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        W:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        Th: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        F:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
      },
      "8:00-9:00": {
        M:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: C.PIL },
        T:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: C.PIL },
        W:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: C.PIL },
        Th: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: C.PIL },
        F:  { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: C.KOM },
      },
      "9:00-10:00": {
        M:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        T:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        W:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        Th: { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        F:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
      },
      "10:00-10:20": {
        M: brk("Recess"), T: brk("Recess"), W: brk("Recess"), Th: brk("Recess"), F: brk("Recess"),
      },
      "10:20-11:20": {
        M:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        T:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        W:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        Th: { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        F:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
      },
      "11:20-12:20": {
        M:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        T:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        W:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        Th: { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        F:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
      },
      "12:20-1:20": {
        M: brk("Lunch"), T: brk("Lunch"), W: brk("Lunch"), Th: brk("Lunch"), F: brk("Lunch"),
      },
      "1:20-2:20": {
        M:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        T:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        W:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        Th: { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        F:  brk("—"),
      },
    },
  },

  // ═══════════════════════════════════════
  // ROOM 103 — G11-03 (P1)
  // ═══════════════════════════════════════
  "B1-103": {
    section: "G11-03 (P1)",
    adviser: "Alex M. Vergara",
    schedule: {
      "6:45-7:00": {
        M: flag(), T: flag(), W: flag(), Th: flag(), F: flag(),
      },
      "7:00-8:00": {
        M:  { subject: "HGP", teacher: "Mr. A. Vergara", color: C.HGP },
        T:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        W:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        Th: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
        F:  { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: C.GMATH },
      },
      "8:00-9:00": {
        M:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        T:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        W:  { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: C.KOM },
        Th: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: C.KOM },
        F:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: C.PIL },
      },
      "9:00-10:00": {
        M:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: C.PIL },
        T:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: C.PIL },
        W:  { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: C.PIL },
        Th: { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        F:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
      },
      "10:00-10:20": {
        M: brk("Recess"), T: brk("Recess"), W: brk("Recess"), Th: brk("Recess"), F: brk("Recess"),
      },
      "10:20-11:20": {
        M:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        T:  { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: C.ECOM },
        W:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        Th: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        F:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
      },
      "11:20-12:20": {
        M:  { subject: "Gen. Sci", teacher: "A. Villar", color: C.GSCI },
        T:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        W:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        Th: { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
        F:  { subject: "Life Skills", teacher: "Ms. J. Andal", color: C.LIFE },
      },
      "12:20-1:20": {
        M: brk("Lunch"), T: brk("Lunch"), W: brk("Lunch"), Th: brk("Lunch"), F: brk("Lunch"),
      },
      "1:20-2:20": {
        M:  { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: C.CC1 },
        T:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        W:  { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        Th: { subject: "Kasaysayan", teacher: "Ms. A. Panaligan", color: C.KAS },
        F:  brk("—"),
      },
    },
  },
};

export const getRoomSchedule = (roomCode: string): RoomSchedule | undefined => {
  return roomSchedules[roomCode];
};

export const getTeachersForRoom = (roomCode: string): string[] => {
  const room = roomSchedules[roomCode];
  if (!room) return [];
  const teachers = new Set<string>();
  Object.values(room.schedule).forEach(dayMap => {
    Object.values(dayMap).forEach(entry => {
      if (entry.teacher) teachers.add(entry.teacher);
    });
  });
  return Array.from(teachers);
};

export const getSubjectsForRoom = (roomCode: string): string[] => {
  const room = roomSchedules[roomCode];
  if (!room) return [];
  const subjects = new Set<string>();
  Object.values(room.schedule).forEach(dayMap => {
    Object.values(dayMap).forEach(entry => {
      if (entry.subject && !entry.subject.includes("Flag Ceremony") && !["Recess", "Lunch", "—"].includes(entry.subject)) {
        subjects.add(entry.subject);
      }
    });
  });
  return Array.from(subjects);
};
