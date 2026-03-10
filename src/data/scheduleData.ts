// Room Schedule Data for FABINHS
// Building 1 (Pavilion 1) - Grade 11 Sections

export interface ScheduleEntry {
  subject: string;
  teacher: string;
  color: string; // background color for timetable cell
}

export interface RoomSchedule {
  section: string;
  adviser: string;
  schedule: Record<string, Record<string, ScheduleEntry>>; // time -> day -> entry
}

export type RoomScheduleMap = Record<string, RoomSchedule>;

const DAYS = ["M", "T", "W", "Th", "F"] as const;
export { DAYS };

export const TIME_SLOTS = [
  "6:45-7:00",
  "7:00-8:00",
  "8:00-9:00",
  "9:00-10:00",
] as const;

// Building 1, Floor 1 Rooms
export const roomSchedules: RoomScheduleMap = {
  // ===== ROOM 101 (G11-01) =====
  "B1-101": {
    section: "G11-01 (P1)",
    adviser: "Rose Ann L. Dela Peña",
    schedule: {
      "6:45-7:00": {
        M: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        T: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        W: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        Th: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        F: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
      },
      "7:00-8:00": {
        M: { subject: "HGP", teacher: "Ms. Dela Peña", color: "#ef4444" },
        T: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        W: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        Th: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: "#84cc16" },
        F: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: "#84cc16" },
      },
      "8:00-9:00": {
        M: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#a855f7" },
        T: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#a855f7" },
        W: { subject: "Gen. Sci", teacher: "A. Villar", color: "#22c55e" },
        Th: { subject: "Gen. Sci", teacher: "A. Villar", color: "#22c55e" },
        F: { subject: "Life Skills", teacher: "Ms. J. Andal", color: "#f5f5f5" },
      },
      "9:00-10:00": {
        M: { subject: "Life Skills", teacher: "Ms. J. Andal", color: "#f5f5f5" },
        T: { subject: "Life Skills", teacher: "Ms. J. Andal", color: "#f5f5f5" },
        W: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        Th: { subject: "Life Skills", teacher: "Ms. J. Andal", color: "#f5f5f5" },
        F: { subject: "Life Skills", teacher: "Ms. J. Andal", color: "#f5f5f5" },
      },
    },
  },

  // ===== ROOM 102 (G11-02) =====
  "B1-102": {
    section: "G11-02 (P1)",
    adviser: "Christene R. Llanes",
    schedule: {
      "6:45-7:00": {
        M: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        T: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        W: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        Th: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        F: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
      },
      "7:00-8:00": {
        M: { subject: "HGP", teacher: "Ms. Llanes", color: "#ef4444" },
        T: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#eab308" },
        W: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#eab308" },
        Th: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#eab308" },
        F: { subject: "Creative Composition 1", teacher: "Ms. Llanes", color: "#eab308" },
      },
      "8:00-9:00": {
        M: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: "#22c55e" },
        T: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: "#22c55e" },
        W: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: "#22c55e" },
        Th: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Kim", color: "#22c55e" },
        F: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: "#84cc16" },
      },
      "9:00-10:00": {
        M: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        T: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        W: { subject: "Effective Com", teacher: "Ms. R. De La Peña", color: "#f97316" },
        Th: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: "#22c55e" },
        F: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: "#22c55e" },
      },
    },
  },

  // ===== ROOM 103 (G11-03) =====
  "B1-103": {
    section: "G11-03 (P1)",
    adviser: "Alex M. Vergara",
    schedule: {
      "6:45-7:00": {
        M: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        T: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        W: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        Th: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
        F: { subject: "Flag Ceremony / Classroom Management", teacher: "", color: "#d1d5db" },
      },
      "7:00-8:00": {
        M: { subject: "HGP", teacher: "Mr. A. Vergara", color: "#6366f1" },
        T: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: "#6366f1" },
        W: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: "#6366f1" },
        Th: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: "#6366f1" },
        F: { subject: "Gen. Math", teacher: "Mr. A. Vergara", color: "#6366f1" },
      },
      "8:00-9:00": {
        M: { subject: "Kasaysayan", teacher: "Ms. A. Panaligon", color: "#f59e0b" },
        T: { subject: "Gen. Sci", teacher: "A. Villar", color: "#22c55e" },
        W: { subject: "Komunikasyon", teacher: "Ms. R. De La Peña", color: "#84cc16" },
        Th: { subject: "Komunikasyon", teacher: "Ms. Mitra", color: "#84cc16" },
        F: { subject: "Komunikasyon", teacher: "Ms. Mitra", color: "#84cc16" },
      },
      "9:00-10:00": {
        M: { subject: "Kasaysayan", teacher: "Ms. Viñas", color: "#f59e0b" },
        T: { subject: "Kasaysayan", teacher: "Ms. Viñas", color: "#f59e0b" },
        W: { subject: "Life Skills", teacher: "Ms. Cerilla", color: "#f5f5f5" },
        Th: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: "#22c55e" },
        F: { subject: "Piling Larang", teacher: "M. Manguiat C/O Mam Mavelle", color: "#22c55e" },
      },
    },
  },
};

// Helper to get schedule for a room code
export const getRoomSchedule = (roomCode: string): RoomSchedule | undefined => {
  return roomSchedules[roomCode];
};

// Get all unique teachers from schedule data
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

// Get all unique subjects for a room
export const getSubjectsForRoom = (roomCode: string): string[] => {
  const room = roomSchedules[roomCode];
  if (!room) return [];
  const subjects = new Set<string>();
  Object.values(room.schedule).forEach(dayMap => {
    Object.values(dayMap).forEach(entry => {
      if (entry.subject && !entry.subject.includes("Flag Ceremony")) subjects.add(entry.subject);
    });
  });
  return Array.from(subjects);
};
