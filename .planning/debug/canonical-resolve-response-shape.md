## ROOT CAUSE FOUND

**Root Cause:** The UAT was calling `POST /canonical-resolve` — a route that does not exist. The actual endpoint is `POST /places/resolve`. There is no global API prefix, so no `/api/` prefix is needed. Additionally, the DTO accepts `{ lat, lng }` (numeric coordinates), not a text field like `input`, `query`, or `text`. Sending a string like "California" will be rejected by the `ValidationPipe` (`forbidNonWhitelisted: true`) and return a 400, which appears as an empty/unexpected response.

**Correct endpoint:** `POST /places/resolve` with body `{ lat: number, lng: number }`
**Correct confirm endpoint:** `POST /places/confirm` with body `{ lat: number, lng: number, candidatePlaceId: string }`
**Actual response shape:**
```jsonc
// status: "resolved"
{
  "status": "resolved",
  "click": { "lat": number, "lng": number },
  "place": {
    "placeId": string,
    "placeKind": string,
    "typeLabel": string,
    "geometryRef": {
      "boundaryId": string,
      "layer": string,
      "geometryDatasetVersion": string,
      "assetKey": string,
      "renderableId": string
    }
  }
}

// status: "ambiguous"
{
  "status": "ambiguous",
  "click": { "lat": number, "lng": number },
  "prompt": string,
  "recommendedPlaceId": string,
  "candidates": [
    {
      /* same fields as place above */
      "candidateHint": string
    }
  ]
}

// status: "failed"
{
  "status": "failed",
  "click": { "lat": number, "lng": number },
  "reason": "OUTSIDE_SUPPORTED_DATA" | "CANDIDATE_MISMATCH" | "NO_CANONICAL_MATCH",
  "message": string
}
```
**Port:** 4000

**Evidence:**
- `canonical-places.controller.ts` line 17: `@Controller('places')` — controller prefix is `places`, not `canonical-resolve`
- `canonical-places.controller.ts` line 24: `@Post('resolve')` — combined route is `POST /places/resolve`
- `main.ts`: No `app.setGlobalPrefix(...)` call anywhere — there is no `/api/` prefix
- `main.ts` line 14: `const PORT = 4000`
- `resolve-canonical-place.dto.ts`: Only fields are `lat: number` and `lng: number` — there is no `input`, `query`, or `text` field
- `ValidationPipe` is configured with `forbidNonWhitelisted: true` — any extra fields (like `input: "California"`) cause a 400 rejection
- The service's `findFixture()` (line 150–155 of service) matches by coordinate proximity (`< 0.0001` tolerance), not by name — text strings are architecturally unsupported at this layer
- `canonical-resolve.e2e-spec.ts` line 23–26 confirms the correct payload format: `{ lat: 36.7783, lng: -119.4179 }` for California
- HTTP success status is `201` (NestJS `@Post` default), not `200`
- "California" e2e fixture uses coordinates `lat: 36.7783, lng: -119.4179` and returns `placeId: "us-california"` with `geometryRef.assetKey: "overseas/us.json"`
