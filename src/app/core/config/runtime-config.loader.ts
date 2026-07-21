import { RuntimeConfig } from './runtime-config.model';

const CONFIG_URL = '/assets/config.json';

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch(CONFIG_URL, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Runtime configuration could not be loaded: ${response.status}`,
    );
  }

  const config: unknown = await response.json();

  if (!isRuntimeConfig(config)) {
    throw new Error('Runtime configuration is invalid.');
  }

  return config;
}

export function isRuntimeConfig(
  value: unknown,
): value is RuntimeConfig {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['supabaseUrl'] === 'string' &&
    typeof value['supabaseAnonKey'] === 'string' &&
    typeof value['discordClientId'] === 'string' &&
    isRuntimeMode(value['runtimeMode'])
  );
}

function isRuntimeMode(
  value: unknown,
): value is RuntimeConfig['runtimeMode'] {
  return (
    value === 'standalone' ||
    value === 'discord-activity'
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}