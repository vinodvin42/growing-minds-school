# Student portal — Blob folder layout

## Homework (by year + class)

Each homework item is saved under the class it targets:

```
portal/
  2026/
    classes/
      3rd-standard/
        homework.json     → { "items": [ ... ] }
        students.json
      nursery/
        homework.json
        students.json
      all-classes/
        homework.json     → homework for “All students” or “All standards”
      individual/
        homework.json     → homework for specific students only
```

| Target in admin | Blob folder |
|-----------------|-------------|
| All students | `all-classes` |
| One standard (e.g. 3rd Standard) | `3rd-standard` |
| Individual students | `individual` |

Year comes from the homework **created date**.

## Messages (by year + month)

```
portal/
  2026/
    06/
      messages.json    → { "items": [ ... ] }
```

## Students (by year + class)

```
portal/
  2026/
    classes/
      3rd-standard/
        students.json    → { "students": [ ... ] }
```

## Fees & accounts (per student)

```
portal/
  2026/
    accounts/
      stu_abc123.json    → fee items, payments, balance, notes
```

Admin: **Student App → Fees & Accounts**  
Students: **Fees** tab in the app

## Calendar & reminders

```
portal/
  2026/
    calendar/
      holidays.json     → { "items": [ ... ] }  — school holidays, PTM days, events
      reminders.json    → { "items": [ ... ] }  — fees, homework, PTM reminders
```

**Holiday types:** Holiday, Half day, PTM/Meeting, School event  
**Reminder types:** Fees, Homework, PTM, General (with class/student targeting)

Admin: **Student App → Calendar**  
Students: **Calendar** tab + “Coming up” on Home

## After save in admin

Open **Homework** → **Save** once to move data from old monthly paths (`portal/2026/06/homework.json`) into class folders.

Legacy files (`student-portal-data.json`, `students-registry.json`) are still read until you save.
