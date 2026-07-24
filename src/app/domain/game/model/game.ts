import { CharacterId } from '../../characters/model/character-id';
import { CharacterAssignment } from './character-assignment';
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
    private readonly playersValue:
      readonly GamePlayer[],
  ) {}

  public static create(
    params: CreateGameParams,
  ): Game {
    const id = Game.normalizeRequiredId(
      params.id,
      'Game ID cannot be empty.',
    );

    const lobbyId =
      Game.normalizeRequiredId(
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

  public get players():
    readonly GamePlayer[] {
    return [...this.playersValue];
  }

  public addPlayer(
    player: GamePlayer,
  ): Game {
    this.assertState(
      'setup',
      'Players can only be added while the game is in setup.',
    );

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

    return this.copy({
      players: [
        ...this.playersValue,
        player,
      ],
    });
  }

  public removePlayer(
    playerId: string,
  ): Game {
    this.assertState(
      'setup',
      'Players can only be removed while the game is in setup.',
    );

    const player =
      this.getRequiredPlayer(playerId);

    return this.copy({
      players: this.playersValue.filter(
        (existingPlayer) =>
          existingPlayer.id !== player.id,
      ),
    });
  }

  public changePlayerSeat(
    playerId: string,
    seatNumber: number,
  ): Game {
    this.assertState(
      'setup',
      'Player seats can only be changed while the game is in setup.',
    );

    Game.assertSeatNumber(seatNumber);

    const player =
      this.getRequiredPlayer(playerId);

    const playerAtSeat =
      this.getPlayerAtSeat(seatNumber);

    if (
      playerAtSeat &&
      playerAtSeat.id !== player.id
    ) {
      throw new Error(
        `Seat ${seatNumber} is already occupied.`,
      );
    }

    const updatedPlayer =
      player.changeSeat(seatNumber);

    if (updatedPlayer === player) {
      return this;
    }

    return this.replacePlayer(
      updatedPlayer,
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
        player.userId ===
        normalizedUserId,
    );
  }

  public getPlayerAtSeat(
    seatNumber: number,
  ): GamePlayer | undefined {
    Game.assertSeatNumber(seatNumber);

    return this.playersValue.find(
      (player) =>
        player.seatNumber ===
        seatNumber,
    );
  }

  public getLivingPlayers():
    readonly GamePlayer[] {
    return this.playersValue.filter(
      (player) => player.isAlive,
    );
  }

  public getDeadPlayers():
    readonly GamePlayer[] {
    return this.playersValue.filter(
      (player) => !player.isAlive,
    );
  }

  public start(): Game {
    if (this.state !== 'setup') {
      throw new Error(
        `Game cannot be started from state "${this.state}".`,
      );
    }

    if (
      this.playersValue.length === 0
    ) {
      throw new Error(
        'Game requires at least one player before it can be started.',
      );
    }

    const playerWithoutCharacter =
      this.playersValue.find(
        (player) =>
          player.characterId === null,
      );

    if (playerWithoutCharacter) {
      throw new Error(
        `Game player "${playerWithoutCharacter.id}" must receive a character before the game can be started.`,
      );
    }

    return this.copy({
      state: 'in-progress',
    });
  }

  public finish(): Game {
    if (
      this.state !== 'in-progress'
    ) {
      throw new Error(
        `Game cannot be finished from state "${this.state}".`,
      );
    }

    return this.copy({
      state: 'finished',
    });
  }

  public killPlayer(
    playerId: string,
  ): Game {
    this.assertState(
      'in-progress',
      'Players can only be killed while the game is in progress.',
    );

    const player =
      this.getRequiredPlayer(playerId);

    return this.replacePlayer(
      player.die(),
    );
  }

  public revivePlayer(
    playerId: string,
  ): Game {
    this.assertState(
      'in-progress',
      'Players can only be revived while the game is in progress.',
    );

    const player =
      this.getRequiredPlayer(playerId);

    return this.replacePlayer(
      player.revive(),
    );
  }

  public useGhostVote(
    playerId: string,
  ): Game {
    this.assertState(
      'in-progress',
      'Ghost votes can only be used while the game is in progress.',
    );

    const player =
      this.getRequiredPlayer(playerId);

    return this.replacePlayer(
      player.useGhostVote(),
    );
  }

  public assignCharacters(
    assignments: readonly CharacterAssignment[],
  ): Game {
    this.assertState(
      'setup',
      'Characters can only be assigned while the game is in setup.',
    );

    if (
      assignments.length !==
      this.playersValue.length
    ) {
      throw new Error(
        'Every game player must receive exactly one character.',
      );
    }

    const normalizedAssignments =
      assignments.map((assignment) => ({
        playerId:
          Game.normalizeRequiredId(
            assignment.playerId,
            'Game player ID cannot be empty.',
          ),
        characterId:
          assignment.characterId,
      }));

    this.assertUniqueAssignedPlayers(
      normalizedAssignments,
    );

    this.assertUniqueAssignedCharacters(
      normalizedAssignments,
    );

    const assignmentByPlayerId =
      new Map(
        normalizedAssignments.map(
          (assignment) => [
            assignment.playerId,
            assignment.characterId,
          ],
        ),
      );

    for (const player of this.playersValue) {
      if (
        !assignmentByPlayerId.has(
          player.id,
        )
      ) {
        throw new Error(
          `Game player "${player.id}" has no character assignment.`,
        );
      }
    }

    const updatedPlayers =
      this.playersValue.map((player) => {
        const characterId =
          assignmentByPlayerId.get(
            player.id,
          );

        if (!characterId) {
          throw new Error(
            `Game player "${player.id}" has no character assignment.`,
          );
        }

        return player.assignCharacter(
          characterId,
        );
      });

    const hasChanges =
      updatedPlayers.some(
        (player, index) =>
          player !==
          this.playersValue[index],
      );

    if (!hasChanges) {
      return this;
    }

    return this.copy({
      players: updatedPlayers,
    });
  }

  public getPlayerByCharacterId(
    characterId: CharacterId,
  ): GamePlayer | undefined {
    return this.playersValue.find(
      (player) =>
        player.characterId?.equals(
          characterId,
        ) ?? false,
    );
  }

  private getRequiredPlayer(
    playerId: string,
  ): GamePlayer {
    const normalizedPlayerId =
      Game.normalizeRequiredId(
        playerId,
        'Game player ID cannot be empty.',
      );

    const player =
      this.findPlayerById(
        normalizedPlayerId,
      );

    if (!player) {
      throw new Error(
        `Game player with ID "${normalizedPlayerId}" was not found.`,
      );
    }

    return player;
  }

  private replacePlayer(
    updatedPlayer: GamePlayer,
  ): Game {
    return this.copy({
      players: this.playersValue.map(
        (player) =>
          player.id === updatedPlayer.id
            ? updatedPlayer
            : player,
      ),
    });
  }

  private copy(
    changes: Partial<{
      readonly state: GameState;
      readonly players:
        readonly GamePlayer[];
    }>,
  ): Game {
    return new Game(
      this.id,
      this.lobbyId,
      this.storytellerId,
      changes.state ?? this.state,
      changes.players ??
        this.playersValue,
    );
  }

  private findPlayerById(
    playerId: string,
  ): GamePlayer | undefined {
    return this.playersValue.find(
      (player) =>
        player.id === playerId,
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
      (player) =>
        player.userId === userId,
    );
  }

  private isSeatOccupied(
    seatNumber: number,
  ): boolean {
    return this.playersValue.some(
      (player) =>
        player.seatNumber ===
        seatNumber,
    );
  }

  private assertState(
    requiredState: GameState,
    errorMessage: string,
  ): void {
    if (
      this.state !== requiredState
    ) {
      throw new Error(errorMessage);
    }
  }

  private static normalizeRequiredId(
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

  private assertUniqueAssignedPlayers(
    assignments: readonly CharacterAssignment[],
  ): void {
    const assignedPlayerIds =
      new Set<string>();

    for (const assignment of assignments) {
      if (
        assignedPlayerIds.has(
          assignment.playerId,
        )
      ) {
        throw new Error(
          `Game player "${assignment.playerId}" received multiple character assignments.`,
        );
      }

      assignedPlayerIds.add(
        assignment.playerId,
      );
    }
  }

  private assertUniqueAssignedCharacters(
    assignments: readonly CharacterAssignment[],
  ): void {
    const assignedCharacterIds =
      new Set<string>();

    for (const assignment of assignments) {
      const characterId =
        assignment.characterId.value;

      if (
        assignedCharacterIds.has(
          characterId,
        )
      ) {
        throw new Error(
          `Character "${characterId}" was assigned to multiple game players.`,
        );
      }

      assignedCharacterIds.add(
        characterId,
      );
    }
  }
}