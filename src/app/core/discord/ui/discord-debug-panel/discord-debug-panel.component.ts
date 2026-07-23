import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { DiscordService } from '../../data-access/discord.service';

@Component({
  selector: 'app-discord-debug-panel',
  standalone: true,
  templateUrl: './discord-debug-panel.component.html',
  styleUrl: './discord-debug-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscordDebugPanelComponent {
  readonly discord = inject(DiscordService);
}