import { NextResponse } from "next/server";
import { buildLogoutCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Sessão encerrada." });
  res.headers.set("Set-Cookie", buildLogoutCookie());
  return res;
}
