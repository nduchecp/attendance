import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { FirestoreLog } from "@/lib/types";

// GET /api/logs?from=2026-09-01&to=2026-09-12&userId=4&status=Verified
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const from = searchParams.get("from"); // "YYYY-MM-DD"
    const to = searchParams.get("to"); // "YYYY-MM-DD"
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const snapshot = await db.collection("logs").get();
    let logs = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestoreLog);

    if (from) {
      logs = logs.filter((l: FirestoreLog) => l.timestamp.slice(0, 10) >= from);
    }
    if (to) {
      logs = logs.filter((l: FirestoreLog) => l.timestamp.slice(0, 10) <= to);
    }
    if (userId) {
      logs = logs.filter((l: FirestoreLog) => String(l.user_id) === userId);
    }
    if (status) {
      logs = logs.filter((l: FirestoreLog) => l.status.toLowerCase().includes(status.toLowerCase()));
    }

    logs.sort((a: FirestoreLog, b: FirestoreLog) => b.timestamp.localeCompare(a.timestamp)); // newest first

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("GET /api/logs failed:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
