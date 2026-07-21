import { InjectionToken } from '@angular/core';
import {
  PlatformIntegration,
} from './platform-integration';

export const PLATFORM_INTEGRATION =
  new InjectionToken<PlatformIntegration>(
    'PLATFORM_INTEGRATION',
  );