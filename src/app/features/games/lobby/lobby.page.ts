import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-lobby.page',
  imports: [],
  templateUrl: './lobby.page.html',
  styleUrl: './lobby.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyPage {
  readonly gameId = input.required<string>();
}
