import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/data-access/auth.service';
import {
  DiscordDebugPanelComponent,
} from '../../core/discord/ui/discord-debug-panel/discord-debug-panel.component';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    DiscordDebugPanelComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly authService = inject(AuthService);

  signIn(): void {
    void this.authService.signInWithDiscord();
  }
}