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
  ) {}

  public static create(
    params: CreateGamePlayerParams,
  ): GamePlayer {
    const id = params.id.trim();
    const userId = params.userId.trim();
    const displayName = params.displayName.trim();

    if (!id) {
      throw new Error(
        'Game player ID cannot be empty.',
      );
    }

    if (!userId) {
      throw new Error(
        'User ID cannot be empty.',
      );
    }

    if (!displayName) {
      throw new Error(
        'Display name cannot be empty.',
      );
    }

    if (
      !Number.isInteger(params.seatNumber) ||
      params.seatNumber < 1
    ) {
      throw new Error(
        'Seat number must be a positive integer.',
      );
    }

    return new GamePlayer(
      id,
      userId,
      displayName,
      params.seatNumber,
    );
  }
}