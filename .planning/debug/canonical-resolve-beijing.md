## ROOT CAUSE FOUND

**Root Cause:** Multiple compounding issues — wrong port (4000, not 3000), wrong endpoint path (`/places/resolve`, not `/canonical-resolve`), and wrong request body format (`{"lat":...,"lng":...}` coordinates, not `{"query":"北京"}` text input).

---

## Evidence Summary

- **Port:** `apps/server/src/main.ts` line 14 — `const PORT = 4000`. Server listens on `0.0.0.0:4000`, not 3000.
- **Endpoint path:** `apps/server/src/modules/canonical-places/canonical-places.controller.ts` — controller is `@Controller('places')` with `@Post('resolve')`, making the full path `/places/resolve`, not `/canonical-resolve`.
- **No global prefix:** `apps/server/src/main.ts` has no `app.setGlobalPrefix(...)` call, so the path is exactly `/places/resolve`.
- **Request body is lat/lng coordinates, not text:** `apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts` — DTO requires `{ lat: number, lng: number }`. There is no `query` or `input` text field. The service matches fixtures by coordinate proximity (`Math.abs(fixture.click.lat - input.lat) < 0.0001`).
- **Fixture-backed service:** `apps/server/src/modules/canonical-places/canonical-places.service.ts` resolves by coordinate lookup against `CANONICAL_RESOLVE_FIXTURES`, not by city name string. Sending `{"query":"北京"}` or `{"input":"北京"}` would be rejected by `ValidationPipe` with `forbidNonWhitelisted: true` — returning a 400 error body or empty response depending on client handling.

---

## Files Involved

- `apps/server/src/main.ts`: Port is 4000; no global prefix set.
- `apps/server/src/modules/canonical-places/canonical-places.controller.ts`: Route is `POST /places/resolve` (not `/canonical-resolve`).
- `apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts`: Body requires `{ lat: number, lng: number }`, no text query field.
- `apps/server/src/modules/canonical-places/canonical-places.service.ts`: Resolves by coordinate match against fixtures, not by city name.

---

## Correct curl Command

To test "北京" you need the lat/lng coordinates for Beijing (one of the fixture click points). Based on standard Beijing center coordinates:

```bash
curl -s -X POST http://localhost:4000/places/resolve \
  -H "Content-Type: application/json" \
  -d '{"lat":39.9042,"lng":116.4074}'
```

To find the exact fixture coordinates that will match, check:
`apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts`
and use a lat/lng that is within 0.0001 degrees of a Beijing fixture `click`.

---

## Suggested Fix Direction

The UAT test 6 description says `POST /canonical-resolve` with input "北京" — this does not match the actual implementation on three dimensions:

1. **Port** in UAT/docs should be 4000, not 3000.
2. **Path** should be `/places/resolve`, not `/canonical-resolve`.
3. **Input format** should be `{"lat": <number>, "lng": <number>}` — a geographic coordinate pair matching a fixture, not a text string like "北京" or "Beijing".

The UAT was written assuming a text-based geocoding API, but the server implements a coordinate-based fixture lookup. Either:
- Update UAT steps 6/7/8 to use the correct port, path, and coordinate body matching known fixture click points, or
- Determine if a text-based search endpoint was intended and is missing from the implementation.
