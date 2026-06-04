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

## After save in admin

Open **Homework** → **Save** once to move data from old monthly paths (`portal/2026/06/homework.json`) into class folders.

Legacy files (`student-portal-data.json`, `students-registry.json`) are still read until you save.
