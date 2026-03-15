import { NextResponse } from "next/server";
import { addSessionMessage } from "@/lib/jivoChatStore";

export const runtime = "nodejs";

const IGNORED_TYPES = new Set(["typein", "typing", "system"]);
const IGNORED_EVENTS = new Set(["typein", "typing"]);

const shouldIgnorePayload = (payload) => {
  const messageType = String(payload?.message?.type || "").toLowerCase();
  const eventType = String(payload?.event || "").toLowerCase();

  if (IGNORED_TYPES.has(messageType)) return true;
  if (IGNORED_EVENTS.has(eventType)) return true;
  if (!payload?.message?.text && !payload?.text && (messageType || eventType)) {
    return true;
  }

  return false;
};

const pickText = (payload) => {
  if (payload?.message?.text) return String(payload.message.text);
  if (payload?.text) return String(payload.text);
  return "";
};

export async function POST(request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  if (shouldIgnorePayload(payload)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const recipientId =
    payload?.recipient?.id ||
    payload?.client_id ||
    payload?.chat_id ||
    null;

  const text = pickText(payload).trim();

  if (recipientId && text) {
    addSessionMessage(String(recipientId), {
      id:
        payload?.message?.id ||
        payload?.id ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      direction: "incoming",
      text,
      type: payload?.message?.type || "text",
      createdAt: payload?.timestamp || Date.now(),
      author: payload?.sender?.name || "operator",
    });
  }

  return NextResponse.json({ ok: true });
}
