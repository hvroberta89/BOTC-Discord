export interface CreateGamePlayerParams {
  readonly id: string;
  readonly userId: string;
  readonly displayName: string;
  readonly seatNumber: number;
}

export class GamePlayer {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly displayName: string,
    public readonly seatNumber: number,
    public readonly isAlive: boolean,
    public readonly ghostVoteAvailable: boolean,
  ) {}

  public static create(
    params: CreateGamePlayerParams,
  ): GamePlayer {
    const id =
      GamePlayer.normalizeRequiredText(
        params.id,
        'Game player ID cannot be empty.',
      );

    const userId =
      GamePlayer.normalizeRequiredText(
        params.userId,
        'User ID cannot be empty.',
      );

    const displayName =
      GamePlayer.normalizeRequiredText(
        params.displayName,
        'Display name cannot be empty.',
      );

    GamePlayer.assertSeatNumber(
      params.seatNumber,
    );

    return new GamePlayer(
      id,
      userId,
      displayName,
      params.seatNumber,
      true,
      false,
    );
  }

  public die(): GamePlayer {
    if (!this.isAlive) {
      throw new Error(
        `Game player "${this.id}" is already dead.`,
      );
    }

    return this.copy({
      isAlive: false,
      ghostVoteAvailable: true,
    });
  }

  public revive(): GamePlayer {
    if (this.isAlive) {
      throw new Error(
        `Game player "${this.id}" is already alive.`,
      );
    }

    return this.copy({
      isAlive: true,
      ghostVoteAvailable: false,
    });
  }

  public useGhostVote(): GamePlayer {
    if (this.isAlive) {
      throw new Error(
        'Living players do not use ghost votes.',
      );
    }

    if (!this.ghostVoteAvailable) {
      throw new Error(
        `Game player "${this.id}" has no ghost vote available.`,
      );
    }

    return this.copy({
      ghostVoteAvailable: false,
    });
  }

  public changeSeat(
    seatNumber: number,
  ): GamePlayer {
    GamePlayer.assertSeatNumber(
      seatNumber,
    );

    if (
      seatNumber === this.seatNumber
    ) {
      return this;
    }

    return this.copy({
      seatNumber,
    });
  }

  private copy(
    changes: Partial<{
      readonly seatNumber: number;
      readonly isAlive: boolean;
      readonly ghostVoteAvailable: boolean;
    }>,
  ): GamePlayer {
    return new GamePlayer(
      this.id,
      this.userId,
      this.displayName,
      changes.seatNumber ??
        this.seatNumber,
      changes.isAlive ??
        this.isAlive,
      changes.ghostVoteAvailable ??
        this.ghostVoteAvailable,
    );
  }

  private static normalizeRequiredText(
    value: string,
    errorMessage: string,
  ): string {
    const normalizedValue =
      value.trim();

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