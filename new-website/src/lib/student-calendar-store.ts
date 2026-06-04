import { unstable_noStore as noStore } from "next/cache";
import { readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import { academicYear, holidaysBlobPath, remindersBlobPath } from "@/lib/portal-storage-paths";
import {
  emptyCalendarData,
  filterActiveHolidays,
  filterRemindersForStudent,
  type HolidayItem,
  type PortalReminder,
  type StudentCalendarData,
} from "@/types/student-calendar";
import type { StudentProfile } from "@/types/student";

type ItemsFile<T> = { items: T[] };

const MEMORY_TTL_MS = 30 * 1000;
let memoryCalendar: StudentCalendarData | null = null;
let memoryCalendarAt = 0;
let memoryYear = "";

async function loadHolidays(year: string): Promise<HolidayItem[]> {
  const file = await readBlobJson<ItemsFile<HolidayItem>>(holidaysBlobPath(year));
  const items = Array.isArray(file?.items) ? file.items : [];
  return items.map((h) => ({
    ...h,
    createdAt: h.createdAt || `${h.startDate}T08:00:00.000Z`,
  }));
}

async function loadReminders(year: string): Promise<PortalReminder[]> {
  const file = await readBlobJson<ItemsFile<PortalReminder>>(remindersBlobPath(year));
  return Array.isArray(file?.items) ? file.items : [];
}

export async function getStudentCalendarData(
  year: string = academicYear(),
  options?: { fresh?: boolean }
): Promise<StudentCalendarData> {
  noStore();

  if (!options?.fresh && memoryCalendar && memoryYear === year && Date.now() - memoryCalendarAt < MEMORY_TTL_MS) {
    return memoryCalendar;
  }

  if (!isBlobStorageConfigured()) {
    return emptyCalendarData();
  }

  try {
    const data: StudentCalendarData = {
      holidays: await loadHolidays(year),
      reminders: await loadReminders(year),
    };
    memoryCalendar = data;
    memoryCalendarAt = Date.now();
    memoryYear = year;
    return data;
  } catch (error) {
    console.error("Failed to load calendar data:", error);
    return emptyCalendarData();
  }
}

export async function getCalendarForStudent(
  student: StudentProfile,
  year: string = academicYear()
): Promise<StudentCalendarData> {
  const data = await getStudentCalendarData(year);
  return {
    holidays: filterActiveHolidays(data.holidays),
    reminders: filterRemindersForStudent(data.reminders, student),
  };
}

export async function saveStudentCalendarData(
  data: StudentCalendarData,
  year: string = academicYear()
): Promise<StudentCalendarData> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  const holidays = Array.isArray(data.holidays) ? data.holidays : [];
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];
  const now = new Date().toISOString();

  const normalizedHolidays = holidays.map((h) => ({
    ...h,
    createdAt: h.createdAt || now,
  }));

  await writeBlobJson(holidaysBlobPath(year), { items: normalizedHolidays });
  await writeBlobJson(remindersBlobPath(year), { items: reminders });

  const saved = { holidays: normalizedHolidays, reminders };
  memoryCalendar = saved;
  memoryCalendarAt = Date.now();
  memoryYear = year;
  return saved;
}
