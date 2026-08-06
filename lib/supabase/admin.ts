import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

/**
 * RLS をバイパスするサーバー専用クライアント。
 * 参加者（未ログイン）向けの共有URLページでのみ、必要な範囲で使用する。
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
