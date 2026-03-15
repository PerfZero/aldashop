import { NextResponse } from "next/server";
import { getSessionMessages } from "@/lib/jivoChatStore";

export const runtime = "nodejs";

const CLIENT_COOKIE = "jivo_chat_client_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const getClientId = (request) => {
  return request.cookies.get(CLIENT_COOKIE)?.value || crypto.randomUUID();
};

export async function GET(request) {
  const clientId = getClientId(request);
  const messages = getSessionMessages(clientId);

  const response = NextResponse.json({
    ok: true,
    clientId,
    messages,
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
