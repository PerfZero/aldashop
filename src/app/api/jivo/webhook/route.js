import { NextResponse } from "next/server";
import { addSessionMessage } from "@/lib/jivoChatStore";

export const runtime = "nodejs";

const pickText = (payload) => {
  if (payload?.message?.text) return String(payload.message.text);
  if (payload?.text) return String(payload.text);
  if (payload?.message?.type) return `[${payload.message.type}]`;
  if (payload?.event) return `[${payload.event}]`;
  return "";
};

export async function POST(request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
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
