---
status: complete
phase: 28-overseas-coverage-expansion
source: [28-01-SUMMARY.md, 28-02-SUMMARY.md, 28-03-SUMMARY.md, 28-04-SUMMARY.md, 28-05-SUMMARY.md, 28-06-SUMMARY.md, 28-07-SUMMARY.md]
started: 2026-04-22T03:20:00.000Z
updated: 2026-04-22T04:02:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. New Overseas Country Resolve & Save
expected: User can click on a location in one of the expanded 21 countries (e.g., a US state, French region, Japanese prefecture) and the system correctly resolves it to an authoritative admin1 record. The popup shows the correct English displayName, typeLabel (State/Prefecture/Region), and parentLabel (country name). User can successfully save the travel record to their account.
result: pass

### 2. Unsupported Overseas Notice
expected: When clicking a location in a country not in the 21-country matrix, the system shows an "unsupported region" notice with the country's name from SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH, not a generic error.
result: pass

### 3. Bootstrap Metadata Preservation
expected: After saving travel records in expanded overseas countries, logging out and back in (or refreshing) shows the same displayName, typeLabel, parentLabel, and subtitle as when the record was saved — no regression to old labels.
result: pass

### 4. Washington DC Distinct from Washington State
expected: When resolving a location in Washington DC (US-DC), the system shows "District of Columbia" with typeLabel "District" and parentLabel "United States". When resolving a location in Washington State (US-WA), it shows "Washington" with typeLabel "State" and parentLabel "United States". The two are clearly distinct with different placeIds.
result: pass

### 5. Buenos Aires Distinct from Buenos Aires Province
expected: When resolving a location in Buenos Aires (AR-C), the system shows "Buenos Aires" with typeLabel "Autonomous City" and parentLabel "Argentina". When resolving Buenos Aires Province (AR-B), it shows "Buenos Aires Province" with typeLabel "Province" and parentLabel "Argentina". The two are clearly distinct with different placeIds.
result: pass

### 6. Backfill Completes Without Errors
expected: The metadata backfill script runs successfully and reports matched rows for travel/smoke/userTravelRecord tables without crashing on zero-count or race conditions.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]