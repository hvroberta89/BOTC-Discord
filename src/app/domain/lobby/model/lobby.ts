import { LobbyPlayer } from './lobby-player';
import { LobbyPlayerRole } from './lobby-player-role';
import { SeatingOrder } from './seating-order';
import { SeatNumber } from './seat-number';

export interface CreateLobbyParams {
  readonly id: string;
}

export class Lobby {
  private constructor(
    public readonly id: string,
    private readonly playersValue: readonly LobbyPlayer[],
  ) {}

  public static create(params: CreateLobbyParams): Lobby {
    const id = params.id.trim();

    if (!id) {
      throw new Error('Lobby ID cannot be empty.');
    }

    return new Lobby(id, []);
  }

  public get players(): readonly LobbyPlayer[] {
    return [...this.playersValue];
  }

  public get seatingOrder(): SeatingOrder {
    return SeatingOrder.create(this.playersValue);
  }

  public addPlayer(player: LobbyPlayer): Lobby {
    if (this.hasPlayerId(player.id)) {
      throw new Error(
        `Lobby player with ID "${player.id}" already exists.`,
      );
    }

    if (this.hasUserId(player.userId)) {
      throw new Error(
        `User with ID "${player.userId}" is already in the lobby.`,
      );
    }

    if (
      player.role === 'storyteller' &&
      this.hasStoryteller()
    ) {
      throw new Error(
        'The lobby can only have one storyteller.',
      );
    }

    if (
      player.seatNumber !== null &&
      this.isSeatOccupied(player.seatNumber)
    ) {
      throw new Error(
        `Seat ${player.seatNumber} is already occupied.`,
      );
    }

    return new Lobby(
      this.id,
      [...this.playersValue, player],
    );
  }

  public removePlayer(playerId: string): Lobby {
    const normalizedPlayerId =
      Lobby.normalizePlayerId(playerId);

    if (!this.hasPlayerId(normalizedPlayerId)) {
      throw new Error(
        `Lobby player with ID "${normalizedPlayerId}" does not exist.`,
      );
    }

    return new Lobby(
      this.id,
      this.playersValue.filter(
        (player) => player.id !== normalizedPlayerId,
      ),
    );
  }

  public assignSeat(
    playerId: string,
    seatNumber: number,
  ): Lobby {
    const normalizedPlayerId =
      Lobby.normalizePlayerId(playerId);

    const seatNumberValue =
      SeatNumber.create(seatNumber);

    const player = this.findPlayerById(
      normalizedPlayerId,
    );

    if (!player) {
      throw new Error(
        `Lobby player with ID "${normalizedPlayerId}" does not exist.`,
      );
    }

    if (
      player.seatNumber === seatNumberValue.value
    ) {
      return this;
    }

    if (
      this.isSeatOccupied(
        seatNumberValue.value,
      )
    ) {
      throw new Error(
        `Seat ${seatNumberValue.value} is already occupied.`,
      );
    }

    const updatedPlayer = player.takeSeat(
      seatNumberValue.value,
    );

    return this.replacePlayer(updatedPlayer);
  }

  public leaveSeat(playerId: string): Lobby {
    const normalizedPlayerId =
      Lobby.normalizePlayerId(playerId);

    const player = this.findPlayerById(
      normalizedPlayerId,
    );

    if (!player) {
      throw new Error(
        `Lobby player with ID "${normalizedPlayerId}" does not exist.`,
      );
    }

    const updatedPlayer = player.leaveSeat();

    if (updatedPlayer === player) {
      return this;
    }

    return this.replacePlayer(updatedPlayer);
  }

  public getPlayerById(
    playerId: string,
  ): LobbyPlayer | undefined {
    const normalizedPlayerId =
      Lobby.normalizePlayerId(playerId);

    return this.findPlayerById(
      normalizedPlayerId,
    );
  }

  public getPlayerByUserId(
    userId: string,
  ): LobbyPlayer | undefined {
    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
      throw new Error('User ID cannot be empty.');
    }

    return this.playersValue.find(
      (player) => player.userId === normalizedUserId,
    );
  }

  public changePlayerRole(
    playerId: string,
    role: LobbyPlayerRole,
  ): Lobby {
    const normalizedPlayerId =
      Lobby.normalizePlayerId(playerId);

    const player = this.findPlayerById(
      normalizedPlayerId,
    );

    if (!player) {
      throw new Error(
        `Lobby player with ID "${normalizedPlayerId}" does not exist.`,
      );
    }

    if (
      role === 'storyteller' &&
      player.role !== 'storyteller' &&
      this.hasStoryteller()
    ) {
      throw new Error(
        'The lobby can only have one storyteller.',
      );
    }

    const updatedPlayer =
      player.changeRole(role);

    if (updatedPlayer === player) {
      return this;
    }

    return this.replacePlayer(updatedPlayer);
  }

  public getSeatedPlayers(): readonly LobbyPlayer[] {
    return this.seatingOrder.players;
  }

  public getPlayerAtSeat(
    seatNumber: number,
  ): LobbyPlayer | undefined {
    const seatNumberValue =
      SeatNumber.create(seatNumber);

    return this.playersValue.find(
      (player) =>
        player.seatNumber ===
        seatNumberValue.value,
    );
  }

  private replacePlayer(
    updatedPlayer: LobbyPlayer,
  ): Lobby {
    return new Lobby(
      this.id,
      this.playersValue.map((player) =>
        player.id === updatedPlayer.id
          ? updatedPlayer
          : player,
      ),
    );
  }

  private hasPlayerId(playerId: string): boolean {
    return this.findPlayerById(playerId) !== undefined;
  }

  private hasUserId(userId: string): boolean {
    return this.playersValue.some(
      (player) => player.userId === userId,
    );
  }

  private hasStoryteller(): boolean {
    return this.playersValue.some(
      (player) => player.role === 'storyteller',
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
  ): LobbyPlayer | undefined {
    return this.playersValue.find(
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