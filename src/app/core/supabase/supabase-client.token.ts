import { InjectionToken } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

export type ApplicationSupabaseClient =
  SupabaseClient;

export const SUPABASE_CLIENT =
  new InjectionToken<ApplicationSupabaseClient>(
    'SUPABASE_CLIENT',
  );