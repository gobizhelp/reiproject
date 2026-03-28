import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If an explicit redirect was provided, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Otherwise route based on the user's active_view
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_view, role_selected")
          .eq("id", user.id)
          .single();

        if (!profile?.role_selected) {
          return NextResponse.redirect(`${origin}/select-role`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=Could not verify your email. Please try again.`);
}
