import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/data-access/auth.service';

@Component({
  selector: 'app-home.page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly authService = inject(AuthService);

  async signIn(): Promise<void> {
    await this.authService.signInWithDiscord();
  }
}
