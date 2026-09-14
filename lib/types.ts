export interface FirestoreUser {
  id: number;
  name: string;
  rfid_uid: string;
  fingerprint_id: number | null;
  photo_url?: string | null;
  registered_at?: unknown; // Firestore server timestamp
}

export interface FirestoreLog {
  id: number;
  user_id: number;
  timestamp: string; // "YYYY-MM-DD HH:MM:SS" from the Pi's local clock
  status: string; // e.g. "Verified (Fingerprint)", "Verified (Face)"
  device: string; // e.g. "Pi_3_Model_B"
}

export interface CreateUserInput {
  name: string;
  rfid_uid: string;
  fingerprint_id?: number | null;
}

export interface UpdateUserInput {
  name?: string;
  // rfid_uid and fingerprint_id are deliberately NOT editable here --
  // changing them in Firestore alone would desync the Pi's local SQLite
  // database and its physical sensors. Only re-enrolling on the device
  // itself should change those.
}

export interface UpdateLogInput {
  status?: string;
  timestamp?: string;
}
