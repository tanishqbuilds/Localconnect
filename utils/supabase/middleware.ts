import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  
  if (user) {
    // If the user is logged in, use their metadata role instead of DB hit
    const role = user.user_metadata?.role || 'citizen';
    if (path.startsWith('/login') || path.startsWith('/signup')) {
       return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
    
    // Protect role-specific routes
    if (path.startsWith('/dashboard/citizen') && role !== 'citizen') {
       return NextResponse.redirect(new URL('/dashboard/officer', request.url));
    }
    if (path.startsWith('/dashboard/officer') && role !== 'officer') {
       return NextResponse.redirect(new URL('/dashboard/citizen', request.url));
    }

  } else {
    // protect all dashboard and private routes
    const protectedRoutes = ['/dashboard', '/create-complaint', '/profile', '/feed', '/complaints'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse
}
