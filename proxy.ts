import { NextResponse, type NextRequest } from "next/server";

export const proxy = (request: NextRequest) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-wil-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-wil-search", request.nextUrl.search);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
