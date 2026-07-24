import { GamePlayer } from './game-player';
import { GameState } from './game-state';

export interface CreateGameParams {
  readonly id: string;
  readonly lobbyId: string;
  readonly storytellerId: string;
}

export class Game {
  private constructor(
    public readonly id: string,
    public readonly lobbyId: string,
    public readonly storytellerId: string,
    public readonly state: GameState,
    private readonly playersValue: readonly GamePlayer[],
  ) {}

  public static create(
    params: CreateGameParams,
  ): Game {
    const id = Game.normalizeRequiredId(
      params.id,
      'Game ID cannot be empty.',
    );

    const lobbyId = Game.normalizeRequiredId(
      params.lobbyId,
      'Lobby ID cannot be empty.',
    );

    const storytellerId =
      Game.normalizeRequiredId(
        params.storytellerId,
        'Storyteller ID cannot be empty.',
      );

    return new Game(
      id,
      lobbyId,
      storytellerId,
      'setup',
      [],
    );
  }

  public get players(): readonly GamePlayer[] {
    return [...this.playersValue];
  }

  public addPlayer(
    player: GamePlayer,
  ): Game {
    if (this.hasPlayerId(player.id)) {
      throw new Error(
        `Game player with ID "${player.id}" already exists.`,
      );
    }

    if (this.hasUserId(player.userId)) {
      throw new Error(
        `User with ID "${player.userId}" is already in the game.`,
      );
    }

    if (
      this.isSeatOccupied(
        player.seatNumber,
      )
    ) {
      throw new Error(
        `Seat ${player.seatNumber} is already occupied.`,
      );
    }

    return new Game(
      this.id,
      this.lobbyId,
      this.storytellerId,
      this.state,
      [
        ...this.playersValue,
        player,
      ],
    );
  }

  public getPlayerById(
    playerId: string,
  ): GamePlayer | undefined {
    const normalizedPlayerId =
      Game.normalizeRequiredId(
        playerId,
        'Game player ID cannot be empty.',
      );

    return this.findPlayerById(
      normalizedPlayerId,
    );
  }

  public getPlayerByUserId(
    userId: string,
  ): GamePlayer | undefined {
    const normalizedUserId =
      Game.normalizeRequiredId(
        userId,
        'User ID cannot be empty.',
      );

    return this.playersValue.find(
      (player) =>
        player.userId === normalizedUserId,
    );
  }

  public getPlayerAtSeat(
    seatNumber: number,
  ): GamePlayer | undefined {
    Game.assertSeatNumber(seatNumber);

    return this.playersValue.find(
      (player) =>
        player.seatNumber === seatNumber,
    );
  }

  private hasPlayerId(
    playerId: string,
  ): boolean {
    return (
      this.findPlayerById(playerId) !==
      undefined
    );
  }

  private hasUserId(
    userId: string,
  ): boolean {
    return this.playersValue.some(
      (player) => player.userId === userId,
    );
  }

  private isSeatOccupied(
    seatNumber: number,
  ): boolean {
    return this.playersValue.some(
      (player) =>
        player.seatNumber === seatNumber,
    );
  }

  private findPlayerById(
    playerId: string,
  ): GamePlayer | undefined {
    return this.playersValue.find(
      (player) => player.id === playerId,
    );
  }

  private static normalizeRequiredId(
    value: string,
    errorMessage: string,
  ): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new Error(errorMessage);
    }

    return normalizedValue;
  }

  private static assertSeatNumber(
    seatNumber: number,
  ): void {
    if (
      !Number.isInteger(seatNumber) ||
      seatNumber < 1
    ) {
      throw new Error(
        'Seat number must be a positive integer.',
      );
    }
  }
}