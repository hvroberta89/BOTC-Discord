import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { RUNTIME_CONFIG } from '../../../config/runtime-config.token';
import { DiscordService } from '../../data-access/discord.service';

@Component({
  selector: 'app-discord-debug-panel',
  standalone: true,
  templateUrl: './discord-debug-panel.component.html',
  styleUrl: './discord-debug-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscordDebugPanelComponent {
  private readonly runtimeConfig = inject(RUNTIME_CONFIG);

  readonly discord = inject(DiscordService);

  readonly runtimeMode =
    this.runtimeConfig.runtimeMode;
}