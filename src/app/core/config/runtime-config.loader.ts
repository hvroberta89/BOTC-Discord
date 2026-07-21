import {
  RuntimeConfig,
  RuntimeMode,
} from './runtime-config.model';

const RUNTIME_CONFIG_URL =
  '/assets/config.json';

export async function loadRuntimeConfig():
Promise<RuntimeConfig> {
  const response = await fetch(
    RUNTIME_CONFIG_URL,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Runtime configuration could not be loaded. ` +
      `HTTP status: ${response.status}.`,
    );
  }

  const value: unknown = await response.json();

  if (!isRuntimeConfig(value)) {
    throw new Error(
      'Runtime configuration is invalid.',
    );
  }

  return value;
}

export function isRuntimeConfig(
  value: unknown,
): value is RuntimeConfig {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value['supabaseUrl']) &&
    isNonEmptyString(
      value['supabasePublishableKey'],
    ) &&
    typeof value['discordClientId'] ===
      'string' &&
    isRuntimeMode(value['runtimeMode'])
  );
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

function isRuntimeMode(
  value: unknown,
): value is RuntimeMode {
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