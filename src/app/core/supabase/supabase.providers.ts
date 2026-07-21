import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { createClient } from '@supabase/supabase-js';

import { RuntimeConfig } from '../config/runtime-config.model';
import { RUNTIME_CONFIG } from '../config/runtime-config.token';
import { Database } from './database.types';
import {
  ApplicationSupabaseClient,
  SUPABASE_CLIENT,
} from './supabase-client.token';

export function provideSupabase(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: SUPABASE_CLIENT,
      useFactory: createSupabaseClient,
      deps: [RUNTIME_CONFIG],
    },
  ]);
}

function createSupabaseClient(
  config: RuntimeConfig,
): ApplicationSupabaseClient {
  return createClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
}