import { createServerSupabaseClient } from './supabase/server';
import { createSupabaseClient } from './supabase/client';

/**
 * Get the current authenticated user (server-side)
 * Use this in Server Components
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session (server-side)
 * Use this in Server Components
 */
export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 * Use this in Server Actions and API routes
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return user;
}

/**
 * Check if a resource belongs to the current user
 * Use this for authorization checks
 */
export async function isOwner(resourceUserId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.id === resourceUserId;
}

/**
 * Get authenticated client (client-side)
 * Use this in Client Components
 */
export function getAuthClient() {
  return createSupabaseClient();
}
