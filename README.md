# Attendance Backend (API only)

Next.js API routes providing CRUD access to the same Firestore project your
Raspberry Pi's `main_system.py` writes to. No UI is included here on
purpose -- build that separately (e.g. in Antigravity) and point it at
these routes.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local: point GOOGLE_APPLICATION_CREDENTIALS at your service
# account key file (same kind of file as firebase_key.json on the Pi)
npm run dev
```

Visit `http://localhost:3000` for a quick index of available routes.

## API Reference

### Users

| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List all users. `?search=` filters by name or RFID UID. |
| POST | `/api/users` | Create a user (`name`, `rfid_uid` required). See caveat below. |
| GET | `/api/users/:id` | Get one user. |
| PATCH | `/api/users/:id` | Update `name` only. |
| DELETE | `/api/users/:id` | Delete the Firestore record. See caveat below. |

**Example: create a user**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "rfid_uid": "123456789"}'
```

### Logs

| Method | Route | Description |
|---|---|---|
| GET | `/api/logs` | List logs. Filters: `?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=4&status=Verified` |
| GET | `/api/logs/:id` | Get one log. |
| PATCH | `/api/logs/:id` | Update `status` and/or `timestamp`. |
| DELETE | `/api/logs/:id` | Delete a log entry. |

## Important caveats (read before wiring up delete/create in your UI)

1. **No two-way sync with the Pi.** This API only talks to Firestore. The
   Pi's local SQLite database, its fingerprint sensor's flash memory, and
   its trained face data (`face_trainer.yml`) are completely separate and
   are NOT updated by anything in this project. Deleting a user here does
   not stop the Pi's hardware from recognizing them.

2. **User creation uses a separate id range.** Users created via
   `POST /api/users` get ids starting at 100,000+ specifically so they
   never collide with the Pi's own autoincrement ids (which start at 1).
   If the same person is later enrolled on the Pi's physical hardware,
   that creates a *second*, unrelated user record with a different (low)
   id -- there's no merging between the two right now.

3. **`rfid_uid` and `fingerprint_id` are not editable via PATCH.**
   Only `name` can be changed. Changing the RFID UID or fingerprint index
   here would desync from what's physically programmed into the card/
   sensor on the Pi.

4. **No authentication is included.** Anyone who can reach these routes
   can read/write/delete everything. Add auth (even a simple shared-secret
   check in middleware) before deploying this anywhere reachable from the
   internet.

## Firestore schema (must match what main_system.py writes)

```
users/{id}
  id: number
  name: string
  rfid_uid: string
  fingerprint_id: number | null

logs/{id}
  id: number
  user_id: number
  timestamp: string   // "YYYY-MM-DD HH:MM:SS"
  status: string       // e.g. "Verified (Fingerprint)", "Verified (Face)"
  device: string        // e.g. "Pi_3_Model_B"
```
