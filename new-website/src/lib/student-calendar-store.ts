import { unstable_noStore as noStore } from "next/cache";
import { isStorageConfigured, storageErrorMessage } from "@/lib/storage/config";
import { readStorageJson, writeStorageJson } from "@/lib/storage/index";
import { academicYear, holidaysPath, remindersPath } from "@/lib/portal-storage-paths";
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
  const file = await readStorageJson<ItemsFile<HolidayItem>>(holidaysPath(year));
  const items = Array.isArray(file?.items) ? file.items : [];
  return items.map((h) => ({
    ...h,
    createdAt: h.createdAt || `${h.startDate}T08:00:00.000Z`,
  }));
}

async function loadReminders(year: string): Promise<PortalReminder[]> {
  const file = await readStorageJson<ItemsFile<PortalReminder>>(remindersPath(year));
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

  if (!isStorageConfigured()) {
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
  if (!isStorageConfigured()) {
    throw new Error(storageErrorMessage());
  }

  const holidays = Array.isArray(data.holidays) ? data.holidays : [];
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];
  const now = new Date().toISOString();

  const normalizedHolidays = holidays.map((h) => ({
    ...h,
    createdAt: h.createdAt || now,
  }));

  await writeStorageJson(holidaysPath(year), { items: normalizedHolidays });
  await writeStorageJson(remindersPath(year), { items: reminders });

  const saved = { holidays: normalizedHolidays, reminders };
  memoryCalendar = saved;
  memoryCalendarAt = Date.now();
  memoryYear = year;
  return saved;
}
