import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { AuthService } from './auth.service';

export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const authService = inject(AuthService);

      return authService.initialize();
    }),
  ]);
}