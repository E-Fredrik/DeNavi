import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sanitize(file.name);
    const filename = `${Date.now()}-${ext}`;
    const publicPath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(publicPath, buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "");
}
