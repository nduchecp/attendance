import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { FirestoreUser, UpdateUserInput } from "@/lib/types";

// GET /api/users/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user: doc.data() as FirestoreUser });
  } catch (error) {
    console.error(`GET /api/users/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PATCH /api/users/[id]
// Only "name" is editable here -- see UpdateUserInput in lib/types.ts for
// why rfid_uid and fingerprint_id are deliberately excluded.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body: UpdateUserInput = await request.json();

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: "name cannot be blank" }, { status: 400 });
    }

    const ref = db.collection("users").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Partial<FirestoreUser> = {};
    if (body.name !== undefined) updates.name = body.name.trim();

    await ref.update(updates);
    const updated = await ref.get();

    return NextResponse.json({ user: updated.data() as FirestoreUser });
  } catch (error) {
    console.error(`PATCH /api/users/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/[id]
// Deletes the Firestore record only. This does NOT remove the person from
// the Pi's local SQLite database, does NOT erase their fingerprint
// template from the sensor's flash memory, and does NOT delete their
// trained face data (face_id_*.jpg / their entry in face_trainer.yml).
// Until a reconciliation mechanism exists, the Pi will keep recognizing
// this person's card/finger/face after a web-side delete.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ref = db.collection("users").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error(`DELETE /api/users/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
