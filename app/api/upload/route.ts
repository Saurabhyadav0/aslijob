import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/store";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let filename = "uploaded-file";
  let mimeType = "application/octet-stream";
  let size = 0;
  let text = "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: { code: "invalid_input", message: "A file is required" } },
          { status: 400 },
        );
      }

      const fileObj = file as File;
      size = fileObj.size;
      filename = fileObj.name || filename;
      mimeType = fileObj.type || mimeType;

      if (size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: { code: "payload_too_large", message: "File exceeds 5MB limit" } },
          { status: 413 },
        );
      }

      const buffer = Buffer.from(await fileObj.arrayBuffer());
      text = parseFileText(buffer, mimeType, filename);
    } catch (e) {
      return NextResponse.json(
        { error: { code: "upload_failed", message: e instanceof Error ? e.message : "Upload failed" } },
        { status: 400 },
      );
    }
  } else if (contentType.includes("application/json")) {
    try {
      const json = await req.json();
      filename = json.filename ?? "document.txt";
      mimeType = json.mimeType ?? "text/plain";
      const content = json.content ?? json.text ?? json.file ?? "";

      let buffer: Buffer;
      if (typeof content === "string" && json.encoding === "base64") {
        buffer = Buffer.from(content, "base64");
      } else if (typeof content === "string") {
        buffer = Buffer.from(content, "utf-8");
      } else {
        buffer = Buffer.from("");
      }

      size = buffer.length;
      if (size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: { code: "payload_too_large", message: "File exceeds 5MB limit" } },
          { status: 413 },
        );
      }

      text = parseFileText(buffer, mimeType, filename);
    } catch {
      return NextResponse.json(
        { error: { code: "invalid_input", message: "Body must be JSON or multipart form-data" } },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: { code: "unsupported_media_type", message: "Unsupported Content-Type" } },
      { status: 415 },
    );
  }

  const fileId = randomUUID();
  saveUploadedFile({
    fileId,
    filename,
    mimeType,
    size,
    text,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ fileId });
}

function parseFileText(buffer: Buffer, mimeType: string, filename: string): string {
  // If plain text or markdown
  if (mimeType.startsWith("text/") || filename.endsWith(".txt") || filename.endsWith(".md")) {
    return buffer.toString("utf-8");
  }

  // Vision / OCR extraction path:
  // For images and PDFs in demo mode, extract ASCII/UTF8 printable text strings from the buffer
  // or return decoded content.
  const raw = buffer.toString("latin1");
  const printableStrings = raw.match(/[A-Za-z0-9@+._\-:\/ ]{4,}/g);
  if (printableStrings && printableStrings.length > 0) {
    return printableStrings.join(" ");
  }

  return buffer.toString("utf-8");
}
