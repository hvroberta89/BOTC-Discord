import { LobbyPlayer } from './lobby-player';

export interface PlayerNeighbours {
  readonly left: LobbyPlayer;
  readonly right: LobbyPlayer;
}

export interface PlayerDistance {
  readonly left: number;
  readonly right: number;
  readonly shortest: number;
}

export class SeatingOrder {
  private constructor(
    private readonly playersValue: readonly LobbyPlayer[],
  ) {}

  public static create(
    players: readonly LobbyPlayer[],
  ): SeatingOrder {
    const seatedPlayers = players
      .filter(
        (player) => player.seatNumber !== null,
      )
      .sort(
        (firstPlayer, secondPlayer) =>
          firstPlayer.seatNumber! -
          secondPlayer.seatNumber!,
      );

    return new SeatingOrder(seatedPlayers);
  }

  public get players(): readonly LobbyPlayer[] {
    return [...this.playersValue];
  }

  public get size(): number {
    return this.playersValue.length;
  }

  public getLeftNeighbour(
    playerId: string,
  ): LobbyPlayer | undefined {
    return this.getNeighbours(playerId)?.left;
}

  public getRightNeighbour(
    playerId: string,
  ): LobbyPlayer | undefined {
    return this.getNeighbours(playerId)?.right;
  }
  
  public getNeighbours(
    playerId: string,
  ): PlayerNeighbours | undefined {
    const normalizedPlayerId =
        SeatingOrder.normalizePlayerId(playerId);

    const playerIndex =
        this.findPlayerIndex(normalizedPlayerId);

    if (
        playerIndex === -1 ||
        this.playersValue.length <= 1
    ) {
        return undefined;
    }

    const leftIndex =
        playerIndex === 0
        ? this.playersValue.length - 1
        : playerIndex - 1;

    const rightIndex =
        playerIndex === this.playersValue.length - 1
        ? 0
        : playerIndex + 1;

    return {
        left: this.playersValue[leftIndex],
        right: this.playersValue[rightIndex],
    };
  }

  public getDistance(
    fromPlayerId: string,
    toPlayerId: string,
    ): PlayerDistance | undefined {
    const normalizedFromPlayerId =
        SeatingOrder.normalizePlayerId(fromPlayerId);

    const normalizedToPlayerId =
        SeatingOrder.normalizePlayerId(toPlayerId);

    const fromPlayerIndex =
        this.findPlayerIndex(normalizedFromPlayerId);

    const toPlayerIndex =
        this.findPlayerIndex(normalizedToPlayerId);

    if (
        fromPlayerIndex === -1 ||
        toPlayerIndex === -1
    ) {
        return undefined;
    }

    if (fromPlayerIndex === toPlayerIndex) {
        return {
        left: 0,
        right: 0,
        shortest: 0,
        };
    }

    const playerCount = this.playersValue.length;

    const rightDistance =
        (toPlayerIndex -
        fromPlayerIndex +
        playerCount) %
        playerCount;

    const leftDistance =
        (fromPlayerIndex -
        toPlayerIndex +
        playerCount) %
        playerCount;

    return {
        left: leftDistance,
        right: rightDistance,
        shortest: Math.min(
        leftDistance,
        rightDistance,
        ),
    };
}

  private findPlayerIndex(
    playerId: string,
  ): number {
    return this.playersValue.findIndex(
      (player) => player.id === playerId,
    );
  }

  private static normalizePlayerId(
    playerId: string,
  ): string {
    const normalizedPlayerId =
      playerId.trim();

    if (!normalizedPlayerId) {
      throw new Error(
        'Lobby player ID cannot be empty.',
      );
    }

    return normalizedPlayerId;
  }
}