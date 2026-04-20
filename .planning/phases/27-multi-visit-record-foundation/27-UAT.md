---
status: complete
phase: 27-multi-visit-record-foundation
source: [27-01-SUMMARY.md, 27-02-SUMMARY.md, 27-03-SUMMARY.md, 27-04-SUMMARY.md, 27-05-SUMMARY.md, 27-06-SUMMARY.md]
started: 2026-04-20T11:12:30.803Z
updated: 2026-04-20T11:45:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Date Input Form Appears
expected: When clicking an unvisited location on the map, a date input form should appear in the popup with start date (required) and end date (optional) fields, along with Save and Cancel buttons. The Save button should be disabled until a start date is selected.
result: pass

### 2. Save Travel Record with Date
expected: After selecting a start date (and optionally an end date), clicking Save should successfully illuminate the location on the map and store the travel record with the selected dates. The popup should update to show "已去过 1 次" (visited 1 time) with the trip date.
result: pass

### 3. Multiple Visits to Same Location
expected: When clicking an already-illuminated location, the popup should show "已去过 N 次" (visited N times) and a "再记一次去访" (Record another visit) button. Clicking this button should open the date form again to add another trip record.
result: pass

### 4. Latest Trip Summary Display
expected: After adding multiple trips to the same location with different dates, the popup should show "最近一次" (Latest) with the date of the trip that has the latest travel date (not the latest createdAt). If a trip from 2025-10-01 is added before a trip from 2025-05-01, the latest should still show 2025-10-01.
result: pass

### 5. Date Validation
expected: When entering an end date that is earlier than the start date, an error message "结束日期不能早于开始日期" (End date cannot be earlier than start date) should appear and the Save button should be disabled.
result: pass

### 6. Unknown Date Handling
expected: When a travel record is saved without selecting dates (or from legacy migration), the popup should display "日期未知" (Date unknown) instead of showing a fake date.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
