import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  AuthService,
} from '../../../core/auth/data-access/auth.service';

@Component({
  selector: 'app-auth-callback-page',
  templateUrl: './auth-callback.page.html',
  styleUrl: './auth-callback.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hasFailed = signal(false);

  constructor() {
    effect(() => {
      const status = this.authService.status();

      if (status === 'authenticated') {
        void this.router.navigateByUrl('/', {
          replaceUrl: true,
        });

        return;
      }

      if (status === 'anonymous') {
        this.hasFailed.set(true);
      }
    });
  }
}