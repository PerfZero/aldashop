import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadDir = join(process.cwd(), "public", "uploads");
  await writeFile(join(uploadDir, filename), buffer);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

  return NextResponse.json({
    ok: true,
    url: `${baseUrl}/uploads/${filename}`,
    name: file.name,
  });
}
