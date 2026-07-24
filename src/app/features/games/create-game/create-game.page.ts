import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommandBus } from '../../../application/commands/command-bus';
import { CreateGameCommand } from '../../../application/commands/create-game/create-game.command';
import { Game } from '../../../domain/game/model/game';
import { Lobby } from '../../../domain/lobby/model/lobby';
import { LobbyPlayer } from '../../../domain/lobby/model/lobby-player';
import { ScriptId } from '../../../domain/scripts/model/script-id';
import { InMemoryLobbyRepository } from '../../../infrastructure/lobby/in-memory-lobby-repository';

interface ScriptOption {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

@Component({
  selector: 'app-create-game-page',
  imports: [],
  templateUrl: './create-game.page.html',
  styleUrl: './create-game.page.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class CreateGamePage {
  private readonly commandBus =
    inject(CommandBus);

  private readonly lobbyRepository =
    inject(InMemoryLobbyRepository);

  private readonly lobby =
    this.createDemoLobby();

  private readonly lobbyReady =
    this.lobbyRepository.save(
      this.lobby,
    );

  protected readonly scripts:
    readonly ScriptOption[] = [
      {
        id: 'trouble-brewing',
        name: 'Trouble Brewing',
        description:
          'A beginner-friendly script with straightforward abilities and plenty of deduction.',
      },
      {
        id: 'sects-and-violets',
        name: 'Sects & Violets',
        description:
          'A more advanced script featuring madness, information changes and unusual character interactions.',
      },
      {
        id: 'bad-moon-rising',
        name: 'Bad Moon Rising',
        description:
          'A deadly script focused on survival, protection and determining why players are still alive.',
      },
    ];

  protected readonly selectedScriptId =
    signal<string>(
      this.scripts[0].id,
    );

  protected readonly selectedScript =
    computed(
      () =>
        this.scripts.find(
          (script) =>
            script.id ===
            this.selectedScriptId(),
        ) ?? this.scripts[0],
    );

  protected readonly storyteller =
    this.lobby.players.find(
      (player) =>
        player.role ===
        'storyteller',
    );

  protected readonly players =
    this.lobby.getSeatedPlayers();

  protected readonly isCreating =
    signal(false);

  protected readonly createdGame =
    signal<Game | null>(null);

  protected readonly errorMessage =
    signal<string | null>(null);

  protected readonly createdGameId =
    computed(
      () =>
        this.createdGame()?.id ??
        null,
    );

  protected readonly gameState =
    computed(
      () =>
        this.createdGame()?.state ??
        null,
    );

  protected selectScript(
    event: Event,
  ): void {
    const selectElement =
      event.target as HTMLSelectElement;

    this.selectedScriptId.set(
      selectElement.value,
    );

    this.createdGame.set(null);
    this.errorMessage.set(null);
  }

  protected async createGame():
    Promise<void> {
    if (this.isCreating()) {
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set(null);

    try {
      await this.lobbyReady;

      const command =
        new CreateGameCommand(
          `game-${Date.now()}`,
          this.lobby.id,
          ScriptId.create(
            this.selectedScriptId(),
          ),
        );

      const game =
        await this.commandBus.execute(
          command,
        );

      this.createdGame.set(game);
    } catch (error: unknown) {
      this.createdGame.set(null);

      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the game.',
      );
    } finally {
      this.isCreating.set(false);
    }
  }

  private createDemoLobby(): Lobby {
    const storyteller =
      LobbyPlayer.create({
        id: 'storyteller-1',
        userId:
          'storyteller-user-1',
        displayName: 'Roberta',
        role: 'storyteller',
      });

    const players:
      readonly LobbyPlayer[] = [
        LobbyPlayer.create({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'player',
          seatNumber: 1,
        }),
        LobbyPlayer.create({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          role: 'player',
          seatNumber: 2,
        }),
        LobbyPlayer.create({
          id: 'player-3',
          userId: 'user-3',
          displayName: 'Charlie',
          role: 'player',
          seatNumber: 3,
        }),
        LobbyPlayer.create({
          id: 'player-4',
          userId: 'user-4',
          displayName: 'Diana',
          role: 'player',
          seatNumber: 4,
        }),
      ];

    return players.reduce(
      (lobby, player) =>
        lobby.addPlayer(player),
      Lobby.create({
        id: 'demo-lobby',
      }).addPlayer(storyteller),
    );
  }
}