import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { FirestoreLog, UpdateLogInput } from "@/lib/types";

// GET /api/logs/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await db.collection("logs").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }
    return NextResponse.json({ log: doc.data() as FirestoreLog });
  } catch (error) {
    console.error(`GET /api/logs/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to fetch log" }, { status: 500 });
  }
}

// PATCH /api/logs/[id]
// For manual corrections -- e.g. fixing a status after reviewing an
// attendance snapshot photo, or correcting a timestamp. This does NOT
// propagate back to the Pi's local SQLite database; the two stay
// independently editable once a record has synced to Firestore.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body: UpdateLogInput = await request.json();

    const ref = db.collection("logs").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    const updates: Partial<FirestoreLog> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.timestamp !== undefined) updates.timestamp = body.timestamp;

    await ref.update(updates);
    const updated = await ref.get();

    return NextResponse.json({ log: updated.data() as FirestoreLog });
  } catch (error) {
    console.error(`PATCH /api/logs/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
  }
}

// DELETE /api/logs/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ref = db.collection("logs").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error(`DELETE /api/logs/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
