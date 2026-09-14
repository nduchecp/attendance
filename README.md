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
