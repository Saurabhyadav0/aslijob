import { NextResponse } from "next/server";
import { z } from "zod";
import { runCheck } from "@/lib/check";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().max(10000).optional(),
  fileId: z.string().uuid().optional(),
  identifier: z
    .object({
      kind: z.enum(["phone", "upi", "email", "domain", "url", "wallet", "telegram"]),
      value: z.string().min(1).max(500),
    })
    .optional(),
  lang: z.enum(["en", "hi", "mr"]).default("en"),
  channel: z.enum(["web", "telegram", "whatsapp", "extension", "email"]).default("web"),
  ref: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many checks. Please wait an hour before checking again." } },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return err("invalid_input", "Body must be JSON", 400);
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) return err("invalid_input", parsed.error.issues[0]?.message ?? "Invalid input", 400);

  const { text, identifier, fileId } = parsed.data;
  if (!text?.trim() && !identifier && !fileId) {
    return err("invalid_input", "Provide text, fileId, or an identifier to check", 400);
  }

  try {
    const result = await runCheck(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    return err("internal", e instanceof Error ? e.message : "Something went wrong", 500);
  }
}

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
