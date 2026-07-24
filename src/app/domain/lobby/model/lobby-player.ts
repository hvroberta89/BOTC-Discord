import { LobbyPlayerRole } from './lobby-player-role';
import { SeatNumber } from './seat-number';

export interface CreateLobbyPlayerParams {
  readonly id: string;
  readonly userId: string;
  readonly displayName: string;
  readonly role: LobbyPlayerRole;
  readonly seatNumber?: number | null;
  readonly joinedAt?: Date;
}

interface LobbyPlayerChanges {
  readonly seatNumberValue?: SeatNumber | null;
}

export class LobbyPlayer {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly displayName: string,
    public readonly role: LobbyPlayerRole,
    private readonly seatNumberValue: SeatNumber | null,
    private readonly joinedAtValue: Date,
  ) {}

  public static create(
    params: CreateLobbyPlayerParams,
  ): LobbyPlayer {
    const id = params.id.trim();
    const userId = params.userId.trim();
    const displayName = params.displayName.trim();

    if (!id) {
      throw new Error(
        'Lobby player ID cannot be empty.',
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

    const seatNumberValue =
      params.seatNumber === undefined ||
      params.seatNumber === null
        ? null
        : SeatNumber.create(params.seatNumber);

    LobbyPlayer.assertSeatIsValidForRole(
      params.role,
      seatNumberValue,
    );

    return new LobbyPlayer(
      id,
      userId,
      displayName,
      params.role,
      seatNumberValue,
      params.joinedAt
        ? new Date(params.joinedAt)
        : new Date(),
    );
  }

  public get seatNumber(): number | null {
    return this.seatNumberValue?.value ?? null;
  }

  public get joinedAt(): Date {
    return new Date(this.joinedAtValue);
  }

  public takeSeat(
    seatNumber: number,
  ): LobbyPlayer {
    if (this.role !== 'player') {
      throw new Error(
        'Only players can take a seat.',
      );
    }

    const seatNumberValue =
      SeatNumber.create(seatNumber);

    if (
      this.seatNumberValue?.equals(
        seatNumberValue,
      )
    ) {
      return this;
    }

    return this.copy({
      seatNumberValue,
    });
  }

  public leaveSeat(): LobbyPlayer {
    if (this.seatNumberValue === null) {
      return this;
    }

    return this.copy({
      seatNumberValue: null,
    });
  }

  public changeRole(
    role: LobbyPlayerRole,
  ): LobbyPlayer {
    if (this.role === role) {
      return this;
    }

    const seatNumberValue =
      role === 'player'
        ? this.seatNumberValue
        : null;

    LobbyPlayer.assertSeatIsValidForRole(
      role,
      seatNumberValue,
    );

    return new LobbyPlayer(
      this.id,
      this.userId,
      this.displayName,
      role,
      seatNumberValue,
      new Date(this.joinedAtValue),
    );
  }

  private copy(
    changes: LobbyPlayerChanges,
  ): LobbyPlayer {
    const seatNumberValue =
      changes.seatNumberValue !== undefined
        ? changes.seatNumberValue
        : this.seatNumberValue;

    LobbyPlayer.assertSeatIsValidForRole(
      this.role,
      seatNumberValue,
    );

    return new LobbyPlayer(
      this.id,
      this.userId,
      this.displayName,
      this.role,
      seatNumberValue,
      new Date(this.joinedAtValue),
    );
  }

  private static assertSeatIsValidForRole(
    role: LobbyPlayerRole,
    seatNumberValue: SeatNumber | null,
  ): void {
    if (
      role !== 'player' &&
      seatNumberValue !== null
    ) {
      throw new Error(
        'Storytellers and spectators cannot occupy a seat.',
      );
    }
  }
}