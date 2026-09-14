# Attendance Sys — Biometric & RFID Attendance Console

An administrative dashboard engineered for real-time monitoring and management of a Raspberry Pi–powered IoT attendance system supporting Facial Recognition, Optical Fingerprint scanning, and RFID card authentication.

### Key Highlights
- **Biometric & RFID Synchronization**: Real-time Firebase Firestore integration aggregating attendance logs from physical Raspberry Pi hardware terminals.
- **Dual Light & Dark Mode Architecture**: System and manual theme switching with high-contrast surfaces adhering to WCAG standards.
- **Adaptive Responsive Design**: Desktop executive tabular views and mobile touch-friendly inspection cards.
- **Spreadsheet Export**: Formatted Microsoft Excel (.xlsx) export with sequential ID generation and animated progress modal.
- **Administrative Security**: JWT cookie-based session management with protected administrative routes and destructive action verification modals.

### Tech Stack
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Vanilla CSS & Tailwind CSS
- **Database**: Google Firebase Firestore (Admin SDK)
- **Icons & UI**: Lucide React & Custom SVG components
- **Export Engine**: SheetJS (xlsx)

---

## Setup & Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET, and GOOGLE_APPLICATION_CREDENTIALS
npm run dev
```

Visit `http://localhost:3000` to access the console.

---

## API Reference

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List all users. `?search=` filters by name or RFID UID. |
| POST | `/api/users` | Create a user (`name`, `rfid_uid` required). |
| GET | `/api/users/:id` | Get one user. |
| PATCH | `/api/users/:id` | Update `name` only. |
| DELETE | `/api/users/:id` | Delete the Firestore record. |

### Logs
| Method | Route | Description |
|---|---|---|
| GET | `/api/logs` | List logs. Filters: `?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=4&status=Verified` |
| GET | `/api/logs/:id` | Get one log. |
| PATCH | `/api/logs/:id` | Update `status` and/or `timestamp`. |
| DELETE | `/api/logs/:id` | Delete a log entry. |

---

## Firestore Schema

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
