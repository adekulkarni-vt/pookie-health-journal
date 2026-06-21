import { createServiceClient } from './supabase/service';

export async function requireWhitelist(email: string): Promise<void> {
  const allowed = await checkWhitelist(email);
  if (!allowed) {
    throw new Error('Whitelist access denied');
  }
}

export async function checkWhitelist(email: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('allowed_users')
      .select('email, is_active')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Whitelist lookup error:', error.message);
      return false;
    }

    const allowed = !!data;

    console.log({ email, whitelistAllowed: allowed });

    return allowed;
  } catch (err) {
    console.error('Whitelist check failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}
