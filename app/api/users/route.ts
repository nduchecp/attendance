import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { QueryDocumentSnapshot, Transaction } from "firebase-admin/firestore";
import type { CreateUserInput, FirestoreUser } from "@/lib/types";

// GET /api/users?search=alice
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.toLowerCase().trim();

    const snapshot = await db.collection("users").get();
    let users = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestoreUser);

    if (search) {
      users = users.filter(
        (u: FirestoreUser) =>
          u.name?.toLowerCase().includes(search) ||
          u.rfid_uid?.toLowerCase().includes(search)
      );
    }

    users.sort((a: FirestoreUser, b: FirestoreUser) => a.name.localeCompare(b.name));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users failed:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users
// Creates a user record with name + RFID UID only. Fingerprint/face
// enrollment can only happen on the Pi itself (needs the physical
// sensors), so fingerprint_id starts as null here and gets filled in
// only once the Pi's own enrollment flow runs for this person.
//
// IMPORTANT: the Pi's SQLite database assigns its own autoincrement ids
// independently (starting from 1) every time someone enrolls via the
// physical hardware. To avoid two completely separate systems handing
// out the same id to different people, web-created users start counting
// from WEB_ID_OFFSET instead of 1. This makes collisions practically
// impossible, but it does NOT unify the two records if the same person
// is later enrolled on the Pi -- that would create a second, separate
// user with a different (low) id. There is currently no reconciliation
// between a web pre-registration and a later hardware enrollment for
// the same person; treat this as a known limitation until that's built.
const WEB_ID_OFFSET = 100000;

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserInput = await request.json();

    if (!body.name?.trim() || !body.rfid_uid?.trim()) {
      return NextResponse.json(
        { error: "name and rfid_uid are required" },
        { status: 400 }
      );
    }

    // rfid_uid must stay unique, matching the Pi's local SQLite constraint
    const existing = await db
      .collection("users")
      .where("rfid_uid", "==", body.rfid_uid.trim())
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: `rfid_uid ${body.rfid_uid} is already registered to another user` },
        { status: 409 }
      );
    }

    const counterRef = db.collection("_counters").doc("web_users");
    const newId = await db.runTransaction(async (tx: Transaction) => {
      const counterDoc = await tx.get(counterRef);
      const current = counterDoc.exists
        ? (counterDoc.data()?.value ?? WEB_ID_OFFSET)
        : WEB_ID_OFFSET;
      const next = current + 1;
      tx.set(counterRef, { value: next });
      return next;
    });

    const newUser: FirestoreUser = {
      id: newId,
      name: body.name.trim(),
      rfid_uid: body.rfid_uid.trim(),
      fingerprint_id: body.fingerprint_id ?? null,
    };

    await db.collection("users").doc(String(newId)).set(newUser);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users failed:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
