import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

  const token = request.cookies.get('drivo.token')?.value
  const refreshToken = request.cookies.get('drivo.refreshToken')?.value


  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/signup'


  if (!token && !refreshToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }


  if ((token || refreshToken) && isPublicRoute) {
    return NextResponse.redirect(new URL('/home', request.url))
  }


  return NextResponse.next()
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)',
  ],
}
