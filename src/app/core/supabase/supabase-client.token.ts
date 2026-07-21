import { InjectionToken } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export type ApplicationSupabaseClient =
  SupabaseClient<Database>;

export const SUPABASE_CLIENT =
  new InjectionToken<ApplicationSupabaseClient>(
    'SUPABASE_CLIENT',
  );