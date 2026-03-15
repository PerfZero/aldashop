import { NextResponse } from "next/server";
import {
  addSessionMessage,
  markSessionStarted,
  upsertSessionProfile,
} from "@/lib/jivoChatStore";

export const runtime = "nodejs";

const CLIENT_COOKIE = "jivo_chat_client_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const getClientId = (request) => {
  return request.cookies.get(CLIENT_COOKIE)?.value || crypto.randomUUID();
};

const getEndpoint = () => {
  return (
    process.env.JIVO_CHAT_API_ENDPOINT ||
    process.env.JIVO_CHAT_ENDPOINT ||
    process.env.JIVO_ENDPOINT
  );
};

export async function POST(request) {
  const endpoint = getEndpoint();
  if (!endpoint) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Jivo endpoint is not configured. Set JIVO_CHAT_API_ENDPOINT in environment.",
      },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body?.text || "").trim();
  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Message text is required." },
      { status: 400 },
    );
  }

  const clientId = getClientId(request);
  const profile = {
    name: String(body?.name || "").trim() || "Гость",
    email: String(body?.email || "").trim() || undefined,
    phone: String(body?.phone || "").trim() || undefined,
  };
  upsertSessionProfile(clientId, profile);

  const payload = {
    sender: {
      id: clientId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    },
    message: {
      id: crypto.randomUUID(),
      type: "text",
      text,
      timestamp: Date.now(),
      url:
        typeof body?.pageUrl === "string" && body.pageUrl
          ? body.pageUrl
          : undefined,
    },
  };

  const jivoResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!jivoResponse.ok) {
    const errorText = await jivoResponse.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: "Jivo API request failed.",
        status: jivoResponse.status,
        details: errorText,
      },
      { status: 502 },
    );
  }

  addSessionMessage(clientId, {
    id: payload.message.id,
    direction: "outgoing",
    text,
    type: "text",
    createdAt: Date.now(),
    author: "client",
  });
  markSessionStarted(clientId);

  const response = NextResponse.json({
    ok: true,
    clientId,
    message: {
      id: payload.message.id,
      direction: "outgoing",
      text,
      type: "text",
      createdAt: Date.now(),
      author: "client",
    },
  });

  if (!request.cookies.get(CLIENT_COOKIE)?.value) {
    response.cookies.set(CLIENT_COOKIE, clientId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return response;
}
