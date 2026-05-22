import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const PROTETOR_PATHS = ["/painel"];
const ADOTANTE_PATHS = ["/perfil/adotante", "/painel/adotante"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedProtetor = PROTETOR_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedAdotante = ADOTANTE_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedProtetor && !isProtectedAdotante && !isProtectedAdmin) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedAdmin && session.tipo !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedProtetor && !pathname.startsWith("/painel/adotante") && session.tipo === "adotante") {
    return NextResponse.redirect(new URL("/painel/adotante", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/perfil/adotante/:path*", "/admin/:path*"],
};
